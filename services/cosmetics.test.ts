import { describe, expect, it } from "vitest";

import { canEquipAura, CosmeticAura } from "./cosmetics";

describe("canEquipAura", () => {
  it("only allows an owned aura that is not already selected", () => {
    const aura = (isOwned: boolean, isSelected: boolean): CosmeticAura => ({
      code: "ocean",
      isOwned,
      isSelected,
      requiredAchievementCode: "first-goal",
    });

    expect(canEquipAura(aura(true, false))).toBe(true);
    expect(canEquipAura(aura(false, false))).toBe(false);
    expect(canEquipAura(aura(true, true))).toBe(false);
  });
});
