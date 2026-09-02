import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { useAppLabels } from "../hooks/useAppLabels";
import {
  ApiError,
  CurrentUser,
  getCurrentUser,
  loginAccount,
  refreshSession,
  registerAccount,
  type SessionTokens,
  syncOnboarding,
} from "../services/api";
import { clearSession, loadSession, saveSession } from "../services/sessionStorage";
import { useOnboarding } from "./OnboardingProvider";

export type AuthMode = "login" | "register";

type AuthContextValue = {
  authenticate: (mode: AuthMode, email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
  isHydrated: boolean;
  logout: () => Promise<void>;
  user: CurrentUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { language } = useAppLabels();
  const {
    draft,
    hasCompletedOnboarding,
    isHydrated: isOnboardingHydrated,
    restoreOnboardingFromServer,
  } = useOnboarding();
  const [user, setUser] = useState<CurrentUser | null>(null);
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
        const currentUser = await loadAndReconcileUser(validSession);

        if (isMounted) {
          setUser(currentUser);
        }
      } catch (error) {
        if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
          await clearSession();
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
    const currentUser = await loadAndReconcileUser(newSession);

    setUser(currentUser);
  }

  async function logout() {
    await clearSession();
    setUser(null);
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
      return currentUser;
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    return syncOnboarding(activeSession.accessToken, language, {
      age: Number(draft.age),
      dailyTargetMl: draft.manualTarget,
      goals: draft.selectedGoals,
      heightCm: Number(draft.height),
      timeZone,
      weightKg: Number(draft.weight),
    });
  }

  const value: AuthContextValue = {
    authenticate,
    isAuthenticated: user?.hasCompletedOnboarding === true,
    isHydrated,
    logout,
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
