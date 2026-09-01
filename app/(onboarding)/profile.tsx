import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { OnboardingPage } from "../../components/onboarding/OnboardingPage";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useOnboarding } from "../../providers/OnboardingProvider";
import { ProfileScreen } from "../../screens/onboarding/profile/ProfileScreen";

export default function ProfileRoute() {
  const copy = useAppLabels().copy;
  const router = useRouter();
  const {
    draft,
    prepareRecommendedTarget,
    profileComplete,
    setAge,
    setHeight,
    setWeight,
  } = useOnboarding();

  function goBack() {
    void Haptics.selectionAsync();
    router.back();
  }

  function continueToTarget() {
    prepareRecommendedTarget();
    void Haptics.selectionAsync();
    router.push("/(onboarding)/target");
  }

  return (
    <OnboardingPage copy={copy} currentStep={2} onBack={goBack}>
      <ProfileScreen
        age={draft.age}
        copy={copy}
        height={draft.height}
        isComplete={profileComplete}
        onAgeChange={setAge}
        onContinue={continueToTarget}
        onHeightChange={setHeight}
        onWeightChange={setWeight}
        weight={draft.weight}
      />
    </OnboardingPage>
  );
}
