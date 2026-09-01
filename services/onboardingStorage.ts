import AsyncStorage from "@react-native-async-storage/async-storage";

import type { OnboardingDraft } from "../providers/OnboardingProvider";

const ONBOARDING_STORAGE_KEY = "@waterly/onboarding";
const ONBOARDING_STORAGE_VERSION = 1;

type StoredOnboarding = {
  completed: boolean;
  draft: OnboardingDraft;
  version: number;
};

export async function loadOnboarding(): Promise<StoredOnboarding | null> {
  try {
    const storedValue = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    const parsed = JSON.parse(storedValue) as StoredOnboarding;

    if (
      parsed.version !== ONBOARDING_STORAGE_VERSION ||
      typeof parsed.completed !== "boolean" ||
      !parsed.draft
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function saveCompletedOnboarding(draft: OnboardingDraft) {
  const storedValue: StoredOnboarding = {
    completed: true,
    draft,
    version: ONBOARDING_STORAGE_VERSION,
  };

  await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(storedValue));
}
