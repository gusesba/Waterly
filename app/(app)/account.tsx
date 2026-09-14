import { useRouter } from "expo-router";
import { useState } from "react";

import { OnboardingPage } from "../../components/onboarding/OnboardingPage";
import { useAppLabels } from "../../hooks/useAppLabels";
import { AuthMode, useAuth } from "../../providers/AuthProvider";
import { AuthScreen } from "../../screens/auth/AuthScreen";

export default function AccountRoute() {
  const { copy } = useAppLabels();
  const { authenticate } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("register");

  async function submit(email: string, password: string) {
    await authenticate(mode, email, password);
    router.replace("/");
  }

  return (
    <OnboardingPage copy={copy}>
      <AuthScreen
        copy={copy}
        mode={mode}
        onContinueWithoutAccount={() => router.back()}
        onModeChange={setMode}
        onSubmit={submit}
      />
    </OnboardingPage>
  );
}
