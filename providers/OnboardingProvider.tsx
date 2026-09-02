import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { GoalId } from "../constants/labels";
import { loadOnboarding, saveCompletedOnboarding } from "../services/onboardingStorage";
import { roundToFifty } from "../screens/onboarding/utils";

export type OnboardingDraft = {
  age: string;
  height: string;
  manualTarget: number;
  selectedGoals: GoalId[];
  targetInput: string;
  weight: string;
};

const initialDraft: OnboardingDraft = {
  age: "",
  height: "",
  manualTarget: 2450,
  selectedGoals: [],
  targetInput: "2450",
  weight: "",
};

type OnboardingContextValue = {
  adjustTarget: (amount: number) => void;
  commitTarget: () => void;
  completeOnboarding: () => Promise<void>;
  draft: OnboardingDraft;
  hasCompletedOnboarding: boolean;
  isHydrated: boolean;
  prepareRecommendedTarget: () => void;
  profileComplete: boolean;
  recommendedTarget: number;
  restoreOnboardingFromServer: (
    profile: { age: number; goals: GoalId[]; heightCm: number; weightKg: number },
    dailyTargetMl: number,
  ) => Promise<void>;
  setAge: (value: string) => void;
  setHeight: (value: string) => void;
  setTargetInput: (value: string) => void;
  setWeight: (value: string) => void;
  targetPreview: number;
  toggleGoal: (goalId: GoalId) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

type OnboardingProviderProps = {
  children: ReactNode;
};

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      const saved = await loadOnboarding();

      if (!isMounted) {
        return;
      }

      if (saved) {
        setDraft({ ...initialDraft, ...saved.draft });
        setHasCompletedOnboarding(saved.completed);
      }

      setIsHydrated(true);
    }

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const recommendedTarget = roundToFifty((Number(draft.weight) || 70) * 35);
  const profileComplete =
    Number(draft.height) >= 100 && Number(draft.height) <= 250 &&
    Number(draft.age) >= 13 && Number(draft.age) <= 120 &&
    Number(draft.weight) >= 30 && Number(draft.weight) <= 300;
  const typedTarget = Number(draft.targetInput);
  const targetPreview = typedTarget >= 500 ? typedTarget : draft.manualTarget;

  function updateDraft(values: Partial<OnboardingDraft>) {
    setDraft((current) => ({ ...current, ...values }));
  }

  function normalizeTarget(value: string | number) {
    return Math.min(6000, Math.max(500, Math.round(Number(value) || draft.manualTarget)));
  }

  function toggleGoal(goalId: GoalId) {
    setDraft((current) => ({
      ...current,
      selectedGoals: current.selectedGoals.includes(goalId)
        ? current.selectedGoals.filter((id) => id !== goalId)
        : [...current.selectedGoals, goalId],
    }));
  }

  function prepareRecommendedTarget() {
    updateDraft({
      manualTarget: recommendedTarget,
      targetInput: String(recommendedTarget),
    });
  }

  function commitTarget() {
    const normalized = normalizeTarget(draft.targetInput);
    updateDraft({
      manualTarget: normalized,
      targetInput: String(normalized),
    });
  }

  function adjustTarget(amount: number) {
    const adjusted = normalizeTarget((Number(draft.targetInput) || draft.manualTarget) + amount);
    updateDraft({
      manualTarget: adjusted,
      targetInput: String(adjusted),
    });
  }

  async function completeOnboarding() {
    const normalized = normalizeTarget(draft.targetInput);
    const completedDraft = {
      ...draft,
      manualTarget: normalized,
      targetInput: String(normalized),
    };

    await saveCompletedOnboarding(completedDraft);
    setDraft(completedDraft);
    setHasCompletedOnboarding(true);
  }

  async function restoreOnboardingFromServer(
    profile: { age: number; goals: GoalId[]; heightCm: number; weightKg: number },
    dailyTargetMl: number,
  ) {
    const restoredDraft: OnboardingDraft = {
      age: String(profile.age),
      height: String(profile.heightCm),
      manualTarget: dailyTargetMl,
      selectedGoals: profile.goals,
      targetInput: String(dailyTargetMl),
      weight: String(profile.weightKg),
    };

    await saveCompletedOnboarding(restoredDraft);
    setDraft(restoredDraft);
    setHasCompletedOnboarding(true);
  }

  const value: OnboardingContextValue = {
    adjustTarget,
    commitTarget,
    completeOnboarding,
    draft,
    hasCompletedOnboarding,
    isHydrated,
    prepareRecommendedTarget,
    profileComplete,
    recommendedTarget,
    restoreOnboardingFromServer,
    setAge: (age) => updateDraft({ age }),
    setHeight: (height) => updateDraft({ height }),
    setTargetInput: (targetInput) => updateDraft({ targetInput }),
    setWeight: (weight) => updateDraft({ weight }),
    targetPreview,
    toggleGoal,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  }

  return context;
}
