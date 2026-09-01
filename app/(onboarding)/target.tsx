import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { OnboardingPage } from "../../components/onboarding/OnboardingPage";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useOnboarding } from "../../providers/OnboardingProvider";
import { TargetScreen } from "../../screens/onboarding/target/TargetScreen";

export default function TargetRoute() {
  const { copy, language } = useAppLabels();
  const router = useRouter();
  const {
    adjustTarget,
    commitTarget,
    draft,
    recommendedTarget,
    setTargetInput,
    targetPreview,
  } = useOnboarding();

  function goBack() {
    void Haptics.selectionAsync();
    router.back();
  }

  function finishTarget() {
    commitTarget();
    void Haptics.selectionAsync();
    router.push("/(onboarding)/done");
  }

  function changeTarget(amount: number) {
    void Haptics.selectionAsync();
    adjustTarget(amount);
  }

  return (
    <OnboardingPage copy={copy} currentStep={3} onBack={goBack}>
      <TargetScreen
        copy={copy}
        language={language}
        onCommitTarget={commitTarget}
        onDecrease={() => changeTarget(-100)}
        onFinish={finishTarget}
        onIncrease={() => changeTarget(100)}
        onTargetInputChange={setTargetInput}
        recommendedTarget={recommendedTarget}
        targetInput={draft.targetInput}
        targetPreview={targetPreview}
      />
    </OnboardingPage>
  );
}
