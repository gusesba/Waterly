import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AddEntryCommand } from "./hydration";

export type HydrationOperation =
  | { id: string; type: "create"; payload: AddEntryCommand }
  | {
      id: string;
      type: "update";
      entryId: string;
      payload: { beverageCode: string; volumeMl: number };
    }
  | { id: string; type: "delete"; entryId: string };

const VERSION = 1;

function storageKey(account: string) {
  return `@waterly/hydration-queue/${account.toLowerCase()}`;
}

export async function loadHydrationQueue(account: string): Promise<HydrationOperation[]> {
  try {
    const value = await AsyncStorage.getItem(storageKey(account));
    if (!value) return [];
    const parsed = JSON.parse(value) as { operations?: HydrationOperation[]; version?: number };
    return parsed.version === VERSION && Array.isArray(parsed.operations)
      ? parsed.operations
      : [];
  } catch {
    return [];
  }
}

export async function saveHydrationQueue(
  account: string,
  operations: HydrationOperation[],
) {
  await AsyncStorage.setItem(storageKey(account), JSON.stringify({ operations, version: VERSION }));
}
