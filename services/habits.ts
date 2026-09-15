export type Streak = {
  current: number;
  longest: number;
  todayCompleted: boolean;
  lastCompletedDate: string | null;
};

export type Achievement = {
  code: string;
  progress: number;
  requirement: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
};

export function sortAchievements(items: Achievement[]) {
  return [...items].sort((left, right) => {
    if (left.isUnlocked !== right.isUnlocked) return left.isUnlocked ? -1 : 1;
    const leftProgress = left.requirement ? left.progress / left.requirement : 0;
    const rightProgress = right.requirement ? right.progress / right.requirement : 0;
    return rightProgress - leftProgress || left.requirement - right.requirement;
  });
}
