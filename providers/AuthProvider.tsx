import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAppLabels } from "../hooks/useAppLabels";
import {
  ApiError,
  apiRequest,
  CurrentUser,
  getCurrentUser,
  loginAccount,
  refreshSession,
  registerAccount,
  type SessionTokens,
  syncOnboarding,
} from "../services/api";
import {
  clearSession,
  loadCachedUser,
  loadSession,
  saveCachedUser,
  saveSession,
} from "../services/sessionStorage";
import { useOnboarding } from "./OnboardingProvider";

export type AuthMode = "login" | "register";

type AuthContextValue = {
  authenticate: (mode: AuthMode, email: string, password: string) => Promise<void>;
  isHydrated: boolean;
  logout: () => Promise<void>;
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
  user: CurrentUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { language } = useAppLabels();
  const {
    draft,
    hasCompletedOnboarding,
    isHydrated: isOnboardingHydrated,
    restoreOnboardingFromServer,
  } = useOnboarding();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [session, setSession] = useState<SessionTokens | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      const storedSession = await loadSession();

      if (!storedSession) {
        if (isMounted) {
          setIsHydrated(true);
        }
        return;
      }

      try {
        const validSession = await ensureFreshSession(storedSession);
        const restored = await loadAndReconcileUser(validSession);
        await saveCachedUser(restored.user);

        if (isMounted) {
          setSession(restored.session);
          setUser(restored.user);
        }
      } catch (error) {
        if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
          await clearSession();
        } else {
          const cachedUser = await loadCachedUser();
          if (isMounted && cachedUser) {
            setSession(storedSession);
            setUser(cachedUser);
          }
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    if (!isOnboardingHydrated) {
      return () => {
        isMounted = false;
      };
    }

    if (hasCompletedOnboarding) {
      setIsHydrated(false);
      void hydrate();
    } else {
      setIsHydrated(true);
    }

    return () => {
      isMounted = false;
    };
  }, [hasCompletedOnboarding, isOnboardingHydrated]);

  async function authenticate(mode: AuthMode, email: string, password: string) {
    if (mode === "register") {
      await registerAccount(email, password);
    }

    const newSession = await loginAccount(email, password);
    await saveSession(newSession);
    const authenticated = await loadAndReconcileUser(newSession);

    queryClient.clear();
    setSession(authenticated.session);
    setUser(authenticated.user);
    await saveCachedUser(authenticated.user);
  }

  async function logout() {
    await clearSession();
    queryClient.clear();
    setSession(null);
    setUser(null);
  }

  async function authorizedRequest<T>(path: string, init: RequestInit = {}) {
    if (!session) {
      throw new ApiError(401);
    }

    try {
      return await apiRequest<T>(path, init, session.accessToken, language);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }

      const refreshedSession = await refreshSession(session.refreshToken);
      await saveSession(refreshedSession);
      setSession(refreshedSession);
      return apiRequest<T>(path, init, refreshedSession.accessToken, language);
    }
  }

  async function ensureFreshSession(currentSession: SessionTokens) {
    if (currentSession.expiresAt > Date.now() + 30_000) {
      return currentSession;
    }

    const refreshedSession = await refreshSession(currentSession.refreshToken);
    await saveSession(refreshedSession);
    return refreshedSession;
  }

  async function loadAndReconcileUser(currentSession: SessionTokens) {
    let activeSession = currentSession;
    let currentUser: CurrentUser;

    try {
      currentUser = await getCurrentUser(activeSession.accessToken, language);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }

      activeSession = await refreshSession(activeSession.refreshToken);
      await saveSession(activeSession);
      currentUser = await getCurrentUser(activeSession.accessToken, language);
    }

    if (currentUser.hasCompletedOnboarding && currentUser.profile && currentUser.hydrationGoal) {
      await restoreOnboardingFromServer(currentUser.profile, currentUser.hydrationGoal.dailyTargetMl);
      return { session: activeSession, user: currentUser };
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const syncedUser = await syncOnboarding(activeSession.accessToken, language, {
      age: Number(draft.age),
      dailyTargetMl: draft.manualTarget,
      goals: draft.selectedGoals,
      heightCm: Number(draft.height),
      timeZone,
      weightKg: Number(draft.weight),
    });

    return { session: activeSession, user: syncedUser };
  }

  const value: AuthContextValue = {
    authenticate,
    isHydrated,
    logout,
    request: authorizedRequest,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
