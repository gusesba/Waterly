import { describe, expect, it } from "vitest";

import { Achievement, sortAchievements } from "./habits";

const achievement = (values: Partial<Achievement> & Pick<Achievement, "code">): Achievement => ({
  isUnlocked: false,
  progress: 0,
  requirement: 1,
  unlockedAt: null,
  ...values,
});

describe("sortAchievements", () => {
  it("shows unlocked achievements first and then the closest progress", () => {
    const sorted = sortAchievements([
      achievement({ code: "streak-7", progress: 2, requirement: 7 }),
      achievement({ code: "first-goal", isUnlocked: true, progress: 1 }),
      achievement({ code: "streak-3", progress: 2, requirement: 3 }),
    ]);

    expect(sorted.map((item) => item.code)).toEqual(["first-goal", "streak-3", "streak-7"]);
  });

  it("does not mutate the response array", () => {
    const items = [
      achievement({ code: "locked" }),
      achievement({ code: "unlocked", isUnlocked: true }),
    ];

    sortAchievements(items);

    expect(items.map((item) => item.code)).toEqual(["locked", "unlocked"]);
  });
});
