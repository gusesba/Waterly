export type DrinkEntry = {
  id: string;
  clientEntryId: string;
  volumeMl: number;
  hydrationMl: number;
  beverageCode: string;
  occurredAt: string;
  timeZone: string;
  source: string;
};

export type TodayHydration = {
  date: string;
  dailyTargetMl: number;
  consumedMl: number;
  progress: number;
  entries: DrinkEntry[];
};

export type HydrationHistoryDay = TodayHydration;

export type HydrationHistory = {
  days: HydrationHistoryDay[];
};

export type AddEntryCommand = {
  clientEntryId: string;
  occurredAt: string;
  timeZone: string;
  volumeMl: number;
  beverageCode: string;
};

export type Beverage = {
  code: string;
  hydrationFactor: number;
  totalVolumeMl: number;
};

export type QuickAddSuggestion = {
  beverageCode: string;
  volumeMl: number;
};
