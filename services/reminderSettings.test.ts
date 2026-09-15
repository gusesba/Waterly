import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: storage,
}));

import {
  DEFAULT_REMINDER_TIMES,
  loadReminderSettings,
  normalizeReminderTimes,
} from "./reminderSettings";

beforeEach(() => vi.clearAllMocks());

describe("normalizeReminderTimes", () => {
  it("sorts, deduplicates and limits valid times", () => {
    expect(normalizeReminderTimes(["17:00", "09:00", "09:00", "13:00", "20:00"]))
      .toEqual(["09:00", "13:00", "17:00"]);
  });

  it("removes invalid values", () => {
    expect(normalizeReminderTimes(["24:00", "12:60", "9:00", "08:30"]))
      .toEqual(["08:30"]);
  });
});

describe("loadReminderSettings", () => {
  it("returns disabled defaults when no preference exists", async () => {
    storage.getItem.mockResolvedValue(null);

    await expect(loadReminderSettings("person@example.com")).resolves.toEqual({
      enabled: false,
      notificationIds: [],
      times: DEFAULT_REMINDER_TIMES,
      version: 1,
    });
  });

  it("falls back safely for an unknown persisted version", async () => {
    storage.getItem.mockResolvedValue(JSON.stringify({ enabled: true, times: ["10:00"], version: 2 }));

    const result = await loadReminderSettings("person@example.com");
    expect(result.enabled).toBe(false);
    expect(result.times).toEqual(DEFAULT_REMINDER_TIMES);
  });
});
