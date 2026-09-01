import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { OnboardingPage } from "../../components/onboarding/OnboardingPage";
import { useAppLabels } from "../../hooks/useAppLabels";
import { WelcomeScreen } from "../../screens/onboarding/welcome/WelcomeScreen";

export default function WelcomeRoute() {
  const copy = useAppLabels().copy;
  const router = useRouter();

  function continueToGoals() {
    void Haptics.selectionAsync();
    router.push("/(onboarding)/goals");
  }

  return (
    <OnboardingPage copy={copy}>
      <WelcomeScreen copy={copy} onContinue={continueToGoals} />
    </OnboardingPage>
  );
}
