import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { OnboardingPage } from "../../components/onboarding/OnboardingPage";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useOnboarding } from "../../providers/OnboardingProvider";
import { GoalsScreen } from "../../screens/onboarding/goals/GoalsScreen";

export default function GoalsRoute() {
  const copy = useAppLabels().copy;
  const router = useRouter();
  const { draft, toggleGoal } = useOnboarding();

  function goBack() {
    void Haptics.selectionAsync();
    router.back();
  }

  function continueToProfile() {
    void Haptics.selectionAsync();
    router.push("/(onboarding)/profile");
  }

  function toggleSelectedGoal(goalId: Parameters<typeof toggleGoal>[0]) {
    void Haptics.selectionAsync();
    toggleGoal(goalId);
  }

  return (
    <OnboardingPage copy={copy} currentStep={1} onBack={goBack}>
      <GoalsScreen
        copy={copy}
        onContinue={continueToProfile}
        onToggleGoal={toggleSelectedGoal}
        selectedGoals={draft.selectedGoals}
      />
    </OnboardingPage>
  );
}
