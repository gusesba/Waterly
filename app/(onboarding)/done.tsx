import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { OnboardingPage } from "../../components/onboarding/OnboardingPage";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useOnboarding } from "../../providers/OnboardingProvider";
import { DoneScreen } from "../../screens/onboarding/done/DoneScreen";

export default function DoneRoute() {
  const { copy, language } = useAppLabels();
  const router = useRouter();
  const { completeOnboarding, draft } = useOnboarding();

  function reviewTarget() {
    void Haptics.selectionAsync();
    router.back();
  }

  async function startHydrating() {
    await completeOnboarding();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <OnboardingPage copy={copy}>
      <DoneScreen
        copy={copy}
        language={language}
        manualTarget={draft.manualTarget}
        onReview={reviewTarget}
        onStart={() => void startHydrating()}
        selectedGoalsCount={draft.selectedGoals.length}
      />
    </OnboardingPage>
  );
}
