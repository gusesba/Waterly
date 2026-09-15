export type MascotMood = "complete" | "empty" | "progress";

export function getMascotMood(progress: number, entryCount: number): MascotMood {
  if (progress >= 1) return "complete";
  return entryCount === 0 ? "empty" : "progress";
}

export function didReachGoal(previousProgress: number, nextProgress: number) {
  return previousProgress < 1 && nextProgress >= 1;
}

export function shouldCelebrateGoal(
  previousProgress: number,
  nextProgress: number,
  date: string,
  celebratedDate: string | null,
) {
  return celebratedDate !== date && didReachGoal(previousProgress, nextProgress);
}
