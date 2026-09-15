export type ProgressionEntry = {
  id: string;
  amount: number;
  entryType: string;
  referenceType: string;
  referenceId: string;
  createdAt: string;
};

export type ProgressionBalance = {
  balance: number;
  entries: ProgressionEntry[];
};

export type ProgressionTimelineEntry = ProgressionEntry & {
  currency: "drops" | "prestige";
};

export function buildProgressionTimeline(
  drops: ProgressionEntry[],
  prestige: ProgressionEntry[],
) {
  return [
    ...drops.map((entry) => ({ ...entry, currency: "drops" as const })),
    ...prestige.map((entry) => ({ ...entry, currency: "prestige" as const })),
  ].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}
