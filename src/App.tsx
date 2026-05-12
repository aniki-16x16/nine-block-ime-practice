import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { ALL_TRAINING_ITEMS, ITEM_BY_ID, LESSONS } from "./data/lessons";
import type { Lesson, TrainingItem } from "./data/lessons";
import {
  formatDuration,
  formatPinyin,
  NINE_KEYS,
  pinyinToDigits,
} from "./utils/nineKey";
import {
  loadPracticeProgress,
  recordLessonCompleted,
  recordPracticeAttempt,
  resetPracticeProgress,
  savePracticeProgress,
} from "./utils/storage";

type PracticeMode = "lesson" | "review" | "random";

type Feedback = {
  tone: "idle" | "good" | "bad" | "done";
  text: string;
};

type RunStats = {
  correct: number;
  wrong: number;
};

const AUTO_NEXT_DELAY = 560;

const shuffleItems = (items: TrainingItem[]) =>
  [...items].sort(() => Math.random() - 0.5);

const buildQueue = (
  lesson: Lesson,
  mode: PracticeMode,
  weakItems: TrainingItem[],
) => {
  if (mode === "review") {
    return weakItems.length > 0 ? weakItems : lesson.items;
  }

  if (mode === "random") {
    return shuffleItems(ALL_TRAINING_ITEMS).slice(0, 14);
  }

  return lesson.items;
};

const getAccuracy = (correct: number, attempts: number) => {
  if (attempts === 0) {
    return 0;
  }

  return Math.round((correct / attempts) * 100);
};

function App() {
  const firstLesson = LESSONS[0];
  const [progress, setProgress] = useState(loadPracticeProgress);
  const [selectedLessonId, setSelectedLessonId] = useState(firstLesson.id);
  const [mode, setMode] = useState<PracticeMode>("lesson");
  const [queue, setQueue] = useState<TrainingItem[]>(firstLesson.items);
  const [position, setPosition] = useState(0);
  const [inputDigits, setInputDigits] = useState("");
  const [feedback, setFeedback] = useState<Feedback>({
    tone: "idle",
    text: "准备",
  });
  const [isLocked, setIsLocked] = useState(false);
  const [isRunComplete, setIsRunComplete] = useState(false);
  const [runStats, setRunStats] = useState<RunStats>({
    correct: 0,
    wrong: 0,
  });
  const [completedElapsedMs, setCompletedElapsedMs] = useState(0);
  const timerRef = useRef<number | null>(null);
  const queueRef = useRef(queue);
  const runStartedAtRef = useRef(0);
  const itemStartedAtRef = useRef(0);

  const selectedLesson = useMemo(
    () =>
      LESSONS.find((lesson) => lesson.id === selectedLessonId) ?? firstLesson,
    [firstLesson, selectedLessonId],
  );
  const weakItems = useMemo(
    () =>
      progress.weakItemIds
        .map((itemId) => ITEM_BY_ID.get(itemId))
        .filter(Boolean) as TrainingItem[],
    [progress.weakItemIds],
  );
  const activeItem = queue[position] ?? queue[0];
  const expectedDigits = activeItem ? pinyinToDigits(activeItem.pinyin) : "";
  const answeredCount = runStats.correct + runStats.wrong;
  const progressPercent =
    queue.length > 0 ? Math.min(100, (answeredCount / queue.length) * 100) : 0;
  const totalAccuracy = getAccuracy(
    progress.correctAttempts,
    progress.totalAttempts,
  );
  const runAccuracy = getAccuracy(runStats.correct, answeredCount);
  const averageTime =
    progress.totalAttempts > 0
      ? progress.totalTimeMs / progress.totalAttempts
      : 0;

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    savePracticeProgress(progress);
  }, [progress]);

  useEffect(
    () => () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const beginRun = useCallback(
    (lessonId: string, nextMode: PracticeMode) => {
      const lesson =
        LESSONS.find((lessonItem) => lessonItem.id === lessonId) ?? firstLesson;
      const nextQueue = buildQueue(lesson, nextMode, weakItems);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      const now = performance.now();

      setSelectedLessonId(lesson.id);
      setMode(nextMode);
      setQueue(nextQueue);
      setPosition(0);
      setInputDigits("");
      setFeedback({
        tone: "idle",
        text: nextMode === "review" ? "回炉" : "准备",
      });
      setIsLocked(false);
      setIsRunComplete(false);
      setCompletedElapsedMs(0);
      setRunStats({ correct: 0, wrong: 0 });
      runStartedAtRef.current = now;
      itemStartedAtRef.current = now;
    },
    [firstLesson, weakItems],
  );

  const advanceQuestion = useCallback(() => {
    const currentQueue = queueRef.current;

    setInputDigits("");
    setIsLocked(false);
    itemStartedAtRef.current = performance.now();
    setPosition((currentPosition) => {
      const nextPosition = currentPosition + 1;

      if (nextPosition >= currentQueue.length) {
        setIsRunComplete(true);
        setFeedback({ tone: "done", text: "完成" });
        setCompletedElapsedMs(
          performance.now() - (runStartedAtRef.current || performance.now()),
        );
        setProgress((currentProgress) =>
          recordLessonCompleted(currentProgress, selectedLessonId),
        );
        return currentPosition;
      }

      setFeedback({ tone: "idle", text: "继续" });
      return nextPosition;
    });
  }, [selectedLessonId]);

  const scheduleNext = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(advanceQuestion, AUTO_NEXT_DELAY);
  }, [advanceQuestion]);

  const finishAttempt = useCallback(
    (correct: boolean, visibleDigits: string) => {
      if (!activeItem) {
        return;
      }

      const now = performance.now();
      const itemStartedAt = itemStartedAtRef.current || now;
      const elapsedMs = now - itemStartedAt;

      if (runStartedAtRef.current === 0) {
        runStartedAtRef.current = itemStartedAt;
      }

      setInputDigits(visibleDigits);
      setIsLocked(true);
      setFeedback({
        tone: correct ? "good" : "bad",
        text: correct ? "正确" : "错题入队",
      });
      setRunStats((currentStats) => ({
        ...currentStats,
        correct: currentStats.correct + (correct ? 1 : 0),
        wrong: currentStats.wrong + (correct ? 0 : 1),
      }));
      setProgress((currentProgress) =>
        recordPracticeAttempt(currentProgress, {
          lessonId: selectedLessonId,
          item: activeItem,
          correct,
          elapsedMs,
        }),
      );

      if (!correct) {
        setQueue((currentQueue) => [...currentQueue, activeItem]);
      }

      scheduleNext();
    },
    [activeItem, scheduleNext, selectedLessonId],
  );

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (isLocked || isRunComplete || !activeItem || digit === "1") {
        return;
      }

      const nextDigits = inputDigits + digit;

      if (!expectedDigits.startsWith(nextDigits)) {
        finishAttempt(false, nextDigits);
        return;
      }

      if (nextDigits.length === expectedDigits.length) {
        finishAttempt(true, nextDigits);
        return;
      }

      setInputDigits(nextDigits);
      setFeedback({ tone: "idle", text: "继续" });
    },
    [
      activeItem,
      expectedDigits,
      finishAttempt,
      inputDigits,
      isLocked,
      isRunComplete,
    ],
  );

  const handleBackspace = useCallback(() => {
    if (isLocked || isRunComplete) {
      return;
    }

    setInputDigits((currentDigits) => currentDigits.slice(0, -1));
    setFeedback({ tone: "idle", text: "调整" });
  }, [isLocked, isRunComplete]);

  const handleSkip = useCallback(() => {
    if (isLocked || isRunComplete || !activeItem) {
      return;
    }

    finishAttempt(false, inputDigits || "-");
  }, [activeItem, finishAttempt, inputDigits, isLocked, isRunComplete]);

  const handleResetProgress = () => {
    setProgress(resetPracticeProgress());
    beginRun(selectedLessonId, "lesson");
  };

  const handleStartLesson = (lessonId: string) => {
    beginRun(lessonId, "lesson");
  };

  const handleStartReview = () => {
    beginRun(selectedLessonId, "review");
  };

  const handleStartRandom = () => {
    beginRun(selectedLessonId, "random");
  };

  const handleRestart = () => {
    beginRun(selectedLessonId, mode);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">九宫格输入训练</p>
          <h1>节奏练习台</h1>
        </div>
        <div className="topbar-actions" aria-label="训练模式">
          <button
            type="button"
            onClick={handleStartReview}
            disabled={weakItems.length === 0}
          >
            错题
          </button>
          <button type="button" onClick={handleStartRandom}>
            随机
          </button>
        </div>
      </header>

      <section className="summary-strip" aria-label="总体统计">
        <div>
          <span>总正确率</span>
          <strong>{totalAccuracy}%</strong>
        </div>
        <div>
          <span>平均用时</span>
          <strong>{formatDuration(averageTime)}</strong>
        </div>
        <div>
          <span>当前连击</span>
          <strong>{progress.currentStreak}</strong>
        </div>
        <div>
          <span>已练题次</span>
          <strong>{progress.totalAttempts}</strong>
        </div>
      </section>

      <div className="workspace-grid">
        <section className="practice-panel" aria-label="当前练习">
          <div className="practice-head">
            <div>
              <span className="mode-pill">
                {mode === "lesson"
                  ? selectedLesson.level
                  : mode === "review"
                    ? "回炉"
                    : "随机"}
              </span>
              <h2>{mode === "random" ? "随机训练" : selectedLesson.title}</h2>
              <p>{selectedLesson.focus}</p>
            </div>
            <div className={`feedback ${feedback.tone}`}>{feedback.text}</div>
          </div>

          <div className="progress-track" aria-label="当前关卡进度">
            <div style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="progress-meta">
            <span>
              {Math.min(answeredCount, queue.length)} / {queue.length}
            </span>
            <span>本轮正确率 {runAccuracy}%</span>
          </div>

          <div className="prompt-stage">
            {activeItem && (
              <>
                <div className="prompt-label">{activeItem.label}</div>
                <div className="prompt-pinyin">
                  {formatPinyin(activeItem.pinyin, activeItem.displayPinyin)}
                </div>
                <div className="digit-target" aria-label="输入进度">
                  {expectedDigits.split("").map((digit, index) => {
                    const typedDigit = inputDigits[index];
                    const state = typedDigit
                      ? typedDigit === digit
                        ? "matched"
                        : "missed"
                      : "empty";

                    return (
                      <span className={state} key={`${digit}-${index}`}>
                        {typedDigit ?? ""}
                      </span>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="keyboard" aria-label="九宫格键盘">
            {NINE_KEYS.map((key) => (
              <button
                className="key-button"
                disabled={!key.enabled || isLocked || isRunComplete}
                key={key.digit}
                onClick={() => handleDigitPress(key.digit)}
                type="button"
              >
                <span>{key.digit}</span>
                <small>{key.letters || " "}</small>
              </button>
            ))}
          </div>

          <div className="practice-actions">
            <button
              type="button"
              onClick={handleBackspace}
              disabled={isLocked || isRunComplete || inputDigits.length === 0}
            >
              退格
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isLocked || isRunComplete}
            >
              跳过
            </button>
            <button type="button" onClick={handleRestart}>
              重练
            </button>
          </div>

          {isRunComplete && (
            <div className="complete-banner">
              <strong>本轮完成</strong>
              <span>
                正确 {runStats.correct}，错题 {runStats.wrong}，用时{" "}
                {formatDuration(completedElapsedMs)}
              </span>
            </div>
          )}
        </section>

        <aside className="side-panel" aria-label="课程与统计">
          <section className="lesson-list" aria-label="训练课题">
            <div className="section-title">
              <h2>课题</h2>
              <span>{LESSONS.length} 组</span>
            </div>
            <div className="lesson-buttons">
              {LESSONS.map((lesson) => {
                const lessonStats = progress.lessonStats[lesson.id];
                const lessonAccuracy = getAccuracy(
                  lessonStats?.correct ?? 0,
                  lessonStats?.attempts ?? 0,
                );

                return (
                  <button
                    className={
                      lesson.id === selectedLessonId && mode === "lesson"
                        ? "active"
                        : ""
                    }
                    key={lesson.id}
                    onClick={() => handleStartLesson(lesson.id)}
                    type="button"
                  >
                    <span>
                      <strong>{lesson.title}</strong>
                      <small>{lesson.focus}</small>
                    </span>
                    <em>
                      {lessonStats?.attempts
                        ? `${lessonAccuracy}%`
                        : lesson.level}
                    </em>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="weak-list" aria-label="薄弱项">
            <div className="section-title">
              <h2>薄弱项</h2>
              <span>{weakItems.length}</span>
            </div>
            {weakItems.length > 0 ? (
              <div className="weak-tags">
                {weakItems.slice(0, 8).map((weakItem) => {
                  const itemStats = progress.itemStats[weakItem.id];

                  return (
                    <span key={weakItem.id}>
                      {weakItem.label}
                      <small>{itemStats?.mistakes ?? 0}</small>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="empty-state">暂无错题</p>
            )}
          </section>

          <section className="history-panel" aria-label="成长曲线">
            <div className="section-title">
              <h2>近况</h2>
              <button type="button" onClick={handleResetProgress}>
                清空
              </button>
            </div>
            <div className="history-bars">
              {(progress.history.length > 0
                ? progress.history
                : [{ date: "today", attempts: 0, correct: 0, totalTimeMs: 0 }]
              ).map((day) => {
                const dayAccuracy = getAccuracy(day.correct, day.attempts);

                return (
                  <span key={day.date} title={`${day.date} ${dayAccuracy}%`}>
                    <i style={{ height: `${Math.max(8, dayAccuracy)}%` }} />
                  </span>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default App;
