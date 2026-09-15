import { beforeEach, describe, expect, it, vi } from "vitest";

const notifications = vi.hoisted(() => ({
  cancel: vi.fn(),
  getPermissions: vi.fn(),
  requestPermissions: vi.fn(),
  schedule: vi.fn(),
  setChannel: vi.fn(),
}));
const saveSettings = vi.hoisted(() => vi.fn());

vi.mock("react-native", () => ({ Platform: { OS: "android" } }));
vi.mock("expo-notifications", () => ({
  AndroidImportance: { DEFAULT: 3 },
  PermissionStatus: { GRANTED: "granted" },
  SchedulableTriggerInputTypes: { DAILY: "daily" },
  cancelScheduledNotificationAsync: notifications.cancel,
  getPermissionsAsync: notifications.getPermissions,
  requestPermissionsAsync: notifications.requestPermissions,
  scheduleNotificationAsync: notifications.schedule,
  setNotificationChannelAsync: notifications.setChannel,
}));
vi.mock("./reminderSettings", async (importOriginal) => ({
  ...await importOriginal<typeof import("./reminderSettings")>(),
  saveReminderSettings: saveSettings,
}));

import type { ReminderSettings } from "./reminderSettings";
import { disableReminders, enableReminders } from "./reminders";

const current: ReminderSettings = {
  enabled: true,
  notificationIds: ["old-waterly-id"],
  times: ["09:00"],
  version: 1,
};
const copy = { body: "Body", channelName: "Hydration", title: "Title" };

beforeEach(() => {
  vi.clearAllMocks();
  notifications.getPermissions.mockResolvedValue({ status: "granted" });
  notifications.schedule.mockResolvedValueOnce("new-1").mockResolvedValueOnce("new-2");
});

describe("enableReminders", () => {
  it("replaces only the stored Waterly schedules", async () => {
    const result = await enableReminders("person@example.com", current, ["17:00", "09:00"], copy);

    expect(notifications.cancel).toHaveBeenCalledExactlyOnceWith("old-waterly-id");
    expect(notifications.schedule).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ enabled: true, notificationIds: ["new-1", "new-2"], times: ["09:00", "17:00"] });
    expect(saveSettings).toHaveBeenCalledTimes(2);
    expect(saveSettings).toHaveBeenLastCalledWith("person@example.com", result);
  });

  it("does not schedule after permission is denied", async () => {
    notifications.getPermissions.mockResolvedValue({ status: "denied" });
    notifications.requestPermissions.mockResolvedValue({ status: "denied" });

    await expect(enableReminders("person@example.com", current, ["09:00"], copy))
      .rejects.toThrow("permission-denied");
    expect(notifications.schedule).not.toHaveBeenCalled();
  });
});

describe("disableReminders", () => {
  it("cancels stored schedules and persists the disabled state", async () => {
    const result = await disableReminders("person@example.com", current);

    expect(notifications.cancel).toHaveBeenCalledExactlyOnceWith("old-waterly-id");
    expect(result).toMatchObject({ enabled: false, notificationIds: [] });
    expect(saveSettings).toHaveBeenCalledWith("person@example.com", result);
  });
});
