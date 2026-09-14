import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { OnboardingProvider, useOnboarding } from "../providers/OnboardingProvider";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { QueryProvider } from "../providers/QueryProvider";
import { HydrationSyncProvider } from "../providers/HydrationSyncProvider";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <QueryProvider>
      <OnboardingProvider>
        <AuthProvider>
          <HydrationSyncProvider>
            <RootNavigator />
          </HydrationSyncProvider>
        </AuthProvider>
      </OnboardingProvider>
    </QueryProvider>
  );
}

function RootNavigator() {
  const {
    hasCompletedAccountPrompt,
    hasCompletedOnboarding,
    isHydrated: isOnboardingHydrated,
  } = useOnboarding();
  const { isHydrated: isAuthHydrated, user } = useAuth();
  const isHydrated = isOnboardingHydrated && isAuthHydrated;

  useEffect(() => {
    if (isHydrated) {
      void SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!hasCompletedOnboarding}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected
        guard={hasCompletedOnboarding && !hasCompletedAccountPrompt && !user}
      >
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected
        guard={hasCompletedOnboarding && (hasCompletedAccountPrompt || !!user)}
      >
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
