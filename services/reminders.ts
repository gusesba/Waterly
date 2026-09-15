import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
  normalizeReminderTimes,
  type ReminderSettings,
  saveReminderSettings,
} from "./reminderSettings";

const CHANNEL_ID = "hydration-reminders";

export type ReminderCopy = {
  body: string;
  channelName: string;
  title: string;
};

export async function enableReminders(
  account: string,
  current: ReminderSettings,
  times: string[],
  copy: ReminderCopy,
) {
  const normalizedTimes = normalizeReminderTimes(times);
  if (normalizedTimes.length === 0) throw new Error("invalid-times");
  if (Platform.OS === "web") throw new Error("unsupported-platform");

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      importance: Notifications.AndroidImportance.DEFAULT,
      name: copy.channelName,
    });
  }

  let permission = await Notifications.getPermissionsAsync();
  if (permission.status !== Notifications.PermissionStatus.GRANTED) {
    permission = await Notifications.requestPermissionsAsync();
  }
  if (permission.status !== Notifications.PermissionStatus.GRANTED) {
    throw new Error("permission-denied");
  }

  const notificationIds: string[] = [];
  try {
    for (const time of normalizedTimes) {
      const [hour, minute] = time.split(":").map(Number);
      notificationIds.push(await Notifications.scheduleNotificationAsync({
        content: {
          body: copy.body,
          data: { kind: "hydration-reminder" },
          title: copy.title,
        },
        trigger: {
          channelId: CHANNEL_ID,
          hour,
          minute,
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
        },
      }));
    }
  } catch (error) {
    await cancelScheduled(notificationIds);
    throw error;
  }
  const settings: ReminderSettings = {
    enabled: true,
    notificationIds,
    times: normalizedTimes,
    version: 1,
  };
  await saveReminderSettings(account, {
    ...settings,
    notificationIds: [...current.notificationIds, ...notificationIds],
  });
  await cancelScheduled(current.notificationIds);
  await saveReminderSettings(account, settings);
  return settings;
}

export async function disableReminders(account: string, current: ReminderSettings) {
  await cancelScheduled(current.notificationIds);
  const settings: ReminderSettings = {
    ...current,
    enabled: false,
    notificationIds: [],
  };
  await saveReminderSettings(account, settings);
  return settings;
}

async function cancelScheduled(ids: string[]) {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}
