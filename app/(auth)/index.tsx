import { useState } from "react";

import { OnboardingPage } from "../../components/onboarding/OnboardingPage";
import { useAppLabels } from "../../hooks/useAppLabels";
import { AuthMode, useAuth } from "../../providers/AuthProvider";
import { AuthScreen } from "../../screens/auth/AuthScreen";

export default function AuthRoute() {
  const { copy } = useAppLabels();
  const { authenticate } = useAuth();
  const [mode, setMode] = useState<AuthMode>("register");

  return (
    <OnboardingPage copy={copy}>
      <AuthScreen
        copy={copy}
        mode={mode}
        onModeChange={setMode}
        onSubmit={(email, password) => authenticate(mode, email, password)}
      />
    </OnboardingPage>
  );
}
