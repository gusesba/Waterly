import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { OnboardingProvider, useOnboarding } from "../providers/OnboardingProvider";
import { AuthProvider, useAuth } from "../providers/AuthProvider";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </OnboardingProvider>
  );
}

function RootNavigator() {
  const { hasCompletedOnboarding, isHydrated: isOnboardingHydrated } = useOnboarding();
  const { isAuthenticated, isHydrated: isAuthHydrated } = useAuth();
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
      <Stack.Protected guard={hasCompletedOnboarding && !isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={hasCompletedOnboarding && isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
