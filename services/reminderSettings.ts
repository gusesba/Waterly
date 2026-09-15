import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReminderSettings = {
  enabled: boolean;
  notificationIds: string[];
  times: string[];
  version: 1;
};

export const DEFAULT_REMINDER_TIMES = ["09:00", "13:00", "17:00"];

function storageKey(account: string) {
  return `@waterly/reminders/${account.toLowerCase()}`;
}

export function normalizeReminderTimes(times: string[]) {
  return [...new Set(times.filter((time) => {
    if (!/^\d{2}:\d{2}$/.test(time)) return false;
    const [hour, minute] = time.split(":").map(Number);
    return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
  }))].sort().slice(0, 3);
}

export async function loadReminderSettings(account: string): Promise<ReminderSettings> {
  const fallback: ReminderSettings = {
    enabled: false,
    notificationIds: [],
    times: DEFAULT_REMINDER_TIMES,
    version: 1,
  };

  try {
    const value = await AsyncStorage.getItem(storageKey(account));
    if (!value) return fallback;
    const parsed = JSON.parse(value) as Partial<ReminderSettings>;
    if (parsed.version !== 1 || !Array.isArray(parsed.times)) return fallback;
    const times = normalizeReminderTimes(parsed.times);
    return {
      enabled: parsed.enabled === true,
      notificationIds: Array.isArray(parsed.notificationIds)
        ? parsed.notificationIds.filter((id): id is string => typeof id === "string")
        : [],
      times: times.length > 0 ? times : DEFAULT_REMINDER_TIMES,
      version: 1,
    };
  } catch {
    return fallback;
  }
}

export async function saveReminderSettings(account: string, settings: ReminderSettings) {
  await AsyncStorage.setItem(storageKey(account), JSON.stringify(settings));
}
