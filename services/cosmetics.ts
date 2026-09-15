export type AuraCode = "natural" | "ocean" | "sunset" | "stellar";

export type CosmeticAura = {
  code: AuraCode;
  isOwned: boolean;
  isSelected: boolean;
  requiredAchievementCode: string | null;
};

export type CharacterLoadout = {
  characterCode: "axolotl-pink";
  auraCode: AuraCode;
  auras: CosmeticAura[];
};

export function canEquipAura(aura: CosmeticAura) {
  return aura.isOwned && !aura.isSelected;
}
