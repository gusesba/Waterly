import { Stack,usePathname,useRouter,useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { OnboardingProvider, useOnboarding } from "../providers/OnboardingProvider";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { QueryProvider } from "../providers/QueryProvider";
import { HydrationSyncProvider } from "../providers/HydrationSyncProvider";
import { PendingInviteProvider,usePendingInvite } from "../providers/PendingInviteProvider";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <QueryProvider>
      <OnboardingProvider>
        <AuthProvider>
          <PendingInviteProvider><HydrationSyncProvider><RootNavigator /></HydrationSyncProvider></PendingInviteProvider>
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
  const { isHydrated: isInviteHydrated,token }=usePendingInvite();
  const router=useRouter();const pathname=usePathname();const segments=useSegments();
  const isHydrated = isOnboardingHydrated && isAuthHydrated && isInviteHydrated;

  useEffect(()=>{if(!isHydrated||!hasCompletedOnboarding||!token)return;const invitePath=`/invite/group/${token}`;if(user&&pathname!==invitePath)router.replace(invitePath as never);else if(!user&&!pathname.startsWith("/invite/group")&&segments[0]!=="(auth)")router.replace(invitePath as never);},[hasCompletedOnboarding,isHydrated,pathname,router,segments,token,user]);

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
        guard={hasCompletedOnboarding && !user}
      >
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected
        guard={hasCompletedOnboarding && (hasCompletedAccountPrompt || !!user || !!token)}
      >
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
