import { describe, expect, it } from "vitest";

import { buildProgressionTimeline, ProgressionEntry } from "./progression";

const entry = (id: string, createdAt: string): ProgressionEntry => ({
  amount: 10,
  createdAt,
  entryType: "achievement-reward",
  id,
  referenceId: "first-goal",
  referenceType: "achievement",
});

describe("buildProgressionTimeline", () => {
  it("combines currencies from newest to oldest", () => {
    const result = buildProgressionTimeline(
      [entry("drops", "2026-09-14T12:00:00Z")],
      [entry("prestige", "2026-09-15T12:00:00Z")],
    );

    expect(result.map((item) => [item.id, item.currency])).toEqual([
      ["prestige", "prestige"],
      ["drops", "drops"],
    ]);
  });
});
