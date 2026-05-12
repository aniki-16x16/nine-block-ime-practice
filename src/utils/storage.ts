import type { TrainingItem } from "../data/lessons";

const STORAGE_KEY = "nine-block-ime-practice-progress-v1";

export type ItemPracticeStats = {
  label: string;
  pinyin: string;
  attempts: number;
  correct: number;
  totalTimeMs: number;
  bestTimeMs: number | null;
  mistakes: number;
  lastPracticedAt: number;
};

export type LessonPracticeStats = {
  attempts: number;
  correct: number;
  completed: number;
  lastPracticedAt: number;
};

export type DailyPracticeStats = {
  date: string;
  attempts: number;
  correct: number;
  totalTimeMs: number;
};

export type PracticeProgress = {
  version: 1;
  totalAttempts: number;
  correctAttempts: number;
  totalTimeMs: number;
  currentStreak: number;
  bestStreak: number;
  itemStats: Record<string, ItemPracticeStats>;
  lessonStats: Record<string, LessonPracticeStats>;
  weakItemIds: string[];
  history: DailyPracticeStats[];
};

type AttemptRecord = {
  lessonId: string;
  item: TrainingItem;
  correct: boolean;
  elapsedMs: number;
};

export const createEmptyProgress = (): PracticeProgress => ({
  version: 1,
  totalAttempts: 0,
  correctAttempts: 0,
  totalTimeMs: 0,
  currentStreak: 0,
  bestStreak: 0,
  itemStats: {},
  lessonStats: {},
  weakItemIds: [],
  history: [],
});

export const loadPracticeProgress = () => {
  try {
    const rawProgress = window.localStorage.getItem(STORAGE_KEY);

    if (!rawProgress) {
      return createEmptyProgress();
    }

    const parsedProgress = JSON.parse(rawProgress) as PracticeProgress;

    if (parsedProgress.version !== 1) {
      return createEmptyProgress();
    }

    return {
      ...createEmptyProgress(),
      ...parsedProgress,
      itemStats: parsedProgress.itemStats ?? {},
      lessonStats: parsedProgress.lessonStats ?? {},
      weakItemIds: parsedProgress.weakItemIds ?? [],
      history: parsedProgress.history ?? [],
    };
  } catch {
    return createEmptyProgress();
  }
};

export const savePracticeProgress = (progress: PracticeProgress) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const recordPracticeAttempt = (
  progress: PracticeProgress,
  attempt: AttemptRecord,
): PracticeProgress => {
  const timestamp = Date.now();
  const currentItemStats = progress.itemStats[attempt.item.id];
  const nextItemStats: ItemPracticeStats = {
    label: attempt.item.label,
    pinyin: attempt.item.displayPinyin ?? attempt.item.pinyin,
    attempts: (currentItemStats?.attempts ?? 0) + 1,
    correct: (currentItemStats?.correct ?? 0) + (attempt.correct ? 1 : 0),
    totalTimeMs: (currentItemStats?.totalTimeMs ?? 0) + attempt.elapsedMs,
    bestTimeMs: attempt.correct
      ? Math.min(
          currentItemStats?.bestTimeMs ?? Number.POSITIVE_INFINITY,
          attempt.elapsedMs,
        )
      : (currentItemStats?.bestTimeMs ?? null),
    mistakes: (currentItemStats?.mistakes ?? 0) + (attempt.correct ? 0 : 1),
    lastPracticedAt: timestamp,
  };
  const currentLessonStats = progress.lessonStats[attempt.lessonId];
  const nextLessonStats: LessonPracticeStats = {
    attempts: (currentLessonStats?.attempts ?? 0) + 1,
    correct: (currentLessonStats?.correct ?? 0) + (attempt.correct ? 1 : 0),
    completed: currentLessonStats?.completed ?? 0,
    lastPracticedAt: timestamp,
  };
  const nextItemStatsMap = {
    ...progress.itemStats,
    [attempt.item.id]: nextItemStats,
  };
  const nextCurrentStreak = attempt.correct ? progress.currentStreak + 1 : 0;
  const nextProgress: PracticeProgress = {
    ...progress,
    totalAttempts: progress.totalAttempts + 1,
    correctAttempts: progress.correctAttempts + (attempt.correct ? 1 : 0),
    totalTimeMs: progress.totalTimeMs + attempt.elapsedMs,
    currentStreak: nextCurrentStreak,
    bestStreak: Math.max(progress.bestStreak, nextCurrentStreak),
    itemStats: nextItemStatsMap,
    lessonStats: {
      ...progress.lessonStats,
      [attempt.lessonId]: nextLessonStats,
    },
    history: updateDailyHistory(
      progress.history,
      attempt.correct,
      attempt.elapsedMs,
    ),
    weakItemIds: getWeakItemIds(nextItemStatsMap),
  };

  return nextProgress;
};

export const recordLessonCompleted = (
  progress: PracticeProgress,
  lessonId: string,
): PracticeProgress => {
  const currentLessonStats = progress.lessonStats[lessonId];

  return {
    ...progress,
    lessonStats: {
      ...progress.lessonStats,
      [lessonId]: {
        attempts: currentLessonStats?.attempts ?? 0,
        correct: currentLessonStats?.correct ?? 0,
        completed: (currentLessonStats?.completed ?? 0) + 1,
        lastPracticedAt: Date.now(),
      },
    },
  };
};

export const resetPracticeProgress = () => {
  window.localStorage.removeItem(STORAGE_KEY);
  return createEmptyProgress();
};

const updateDailyHistory = (
  history: DailyPracticeStats[],
  correct: boolean,
  elapsedMs: number,
) => {
  const today = new Date().toISOString().slice(0, 10);
  const currentDay = history.find((entry) => entry.date === today);
  const nextEntry: DailyPracticeStats = {
    date: today,
    attempts: (currentDay?.attempts ?? 0) + 1,
    correct: (currentDay?.correct ?? 0) + (correct ? 1 : 0),
    totalTimeMs: (currentDay?.totalTimeMs ?? 0) + elapsedMs,
  };

  return [...history.filter((entry) => entry.date !== today), nextEntry].slice(
    -14,
  );
};

const getWeakItemIds = (itemStats: Record<string, ItemPracticeStats>) =>
  Object.entries(itemStats)
    .filter(([, stats]) => stats.mistakes > 0)
    .sort(([, leftStats], [, rightStats]) => {
      const leftAccuracy = leftStats.correct / leftStats.attempts;
      const rightAccuracy = rightStats.correct / rightStats.attempts;
      return (
        rightStats.mistakes - leftStats.mistakes || leftAccuracy - rightAccuracy
      );
    })
    .slice(0, 12)
    .map(([itemId]) => itemId);
