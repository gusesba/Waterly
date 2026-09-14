import AsyncStorage from "@react-native-async-storage/async-storage";

import type { TodayHydration } from "./hydration";

function key(account: string) {
  return `@waterly/hydration-today/${account.toLowerCase()}`;
}

export async function loadHydrationSnapshot(account: string): Promise<TodayHydration | null> {
  try {
    const value = await AsyncStorage.getItem(key(account));
    return value ? JSON.parse(value) as TodayHydration : null;
  } catch {
    return null;
  }
}

export async function saveHydrationSnapshot(account: string, hydration: TodayHydration) {
  await AsyncStorage.setItem(key(account), JSON.stringify(hydration));
}
