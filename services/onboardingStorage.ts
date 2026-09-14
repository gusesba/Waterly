import AsyncStorage from "@react-native-async-storage/async-storage";

import type { OnboardingDraft } from "../providers/OnboardingProvider";

const ONBOARDING_STORAGE_KEY = "@waterly/onboarding";
const ONBOARDING_STORAGE_VERSION = 1;

type StoredOnboarding = {
  accountPromptCompleted: boolean;
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

    return {
      ...parsed,
      accountPromptCompleted: parsed.accountPromptCompleted ?? true,
    };
  } catch {
    return null;
  }
}

export async function saveCompletedOnboarding(
  draft: OnboardingDraft,
  accountPromptCompleted: boolean,
) {
  const storedValue: StoredOnboarding = {
    accountPromptCompleted,
    completed: true,
    draft,
    version: ONBOARDING_STORAGE_VERSION,
  };

  await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(storedValue));
}

export async function markAccountPromptCompleted() {
  const stored = await loadOnboarding();

  if (!stored) {
    return;
  }

  await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({
    ...stored,
    accountPromptCompleted: true,
  }));
}
