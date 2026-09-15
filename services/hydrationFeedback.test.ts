import { describe, expect, it } from "vitest";

import { didReachGoal, getMascotMood, shouldCelebrateGoal } from "./hydrationFeedback";

describe("hydration feedback", () => {
  it("selects the mascot mood from entries and progress", () => {
    expect(getMascotMood(0, 0)).toBe("empty");
    expect(getMascotMood(0.4, 1)).toBe("progress");
    expect(getMascotMood(1, 1)).toBe("complete");
  });

  it("detects only a crossing of the daily goal", () => {
    expect(didReachGoal(0.9, 1)).toBe(true);
    expect(didReachGoal(1, 1)).toBe(false);
    expect(didReachGoal(1.1, 1.2)).toBe(false);
  });

  it("celebrates once for the same date", () => {
    expect(shouldCelebrateGoal(0.9, 1, "2026-09-15", null)).toBe(true);
    expect(shouldCelebrateGoal(0.9, 1, "2026-09-15", "2026-09-15")).toBe(false);
  });
});
