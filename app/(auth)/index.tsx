import { useState } from "react";
import { useRouter } from "expo-router";

import { OnboardingPage } from "../../components/onboarding/OnboardingPage";
import { useAppLabels } from "../../hooks/useAppLabels";
import { AuthMode, useAuth } from "../../providers/AuthProvider";
import { useOnboarding } from "../../providers/OnboardingProvider";
import { AuthScreen } from "../../screens/auth/AuthScreen";
import { usePendingInvite } from "../../providers/PendingInviteProvider";

export default function AuthRoute() {
  const { copy } = useAppLabels();
  const { authenticate } = useAuth();
  const { completeAccountPrompt } = useOnboarding();
  const [mode, setMode] = useState<AuthMode>("login");
  const router=useRouter();const pending=usePendingInvite();

  async function submit(email: string, password: string) {
    await authenticate(mode, email, password);
    await completeAccountPrompt();
  }

  async function continueWithoutAccount(){await pending.clear();await completeAccountPrompt();router.replace("/");}

  return (
    <OnboardingPage copy={copy}>
      <AuthScreen
        copy={copy}
        mode={mode}
        onContinueWithoutAccount={() => void continueWithoutAccount()}
        onModeChange={setMode}
        onSubmit={submit}
      />
    </OnboardingPage>
  );
}
