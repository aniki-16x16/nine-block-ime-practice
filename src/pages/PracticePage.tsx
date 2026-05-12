import { useCallback, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { NineKeyKeyboard } from "../components/NineKeyKeyboard";
import { LESSONS } from "../data/lessons";
import type { LessonMode, TrainingItem } from "../data/lessons";
import { formatDuration } from "../utils/nineKey";
import {
  createPracticeTokens,
  getFirstTokenIndexAfterItem,
} from "../utils/practice";
import type { PracticeToken, TokenResult } from "../utils/practice";
import { cx } from "../utils/className";

type PracticePageProps = {
  onCompleteLesson: (lessonId: string) => void;
  onRecordAttempt: (
    lessonId: string,
    item: TrainingItem,
    correct: boolean,
    elapsedMs: number,
  ) => void;
};

type RunStats = {
  correct: number;
  wrong: number;
};

type FeedbackTone = "idle" | "good" | "bad" | "done";

export function PracticePage({
  onCompleteLesson,
  onRecordAttempt,
}: PracticePageProps) {
  const { lessonId } = useParams();
  const lesson = useMemo(
    () => LESSONS.find((lessonItem) => lessonItem.id === lessonId),
    [lessonId],
  );
  const tokens = useMemo(
    () => (lesson ? createPracticeTokens(lesson.items, lesson.mode) : []),
    [lesson],
  );
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [typedValue, setTypedValue] = useState("");
  const [tokenResults, setTokenResults] = useState<Record<string, TokenResult>>(
    {},
  );
  const [runStats, setRunStats] = useState<RunStats>({ correct: 0, wrong: 0 });
  const [feedback, setFeedback] = useState<{
    tone: FeedbackTone;
    text: string;
  }>({
    tone: "idle",
    text: "准备",
  });
  const [isRunComplete, setIsRunComplete] = useState(false);
  const [completedElapsedMs, setCompletedElapsedMs] = useState(0);
  const runStartedAtRef = useRef(0);
  const itemStartedAtRef = useRef(0);
  const currentItemHasMistakeRef = useRef(false);
  const completedItemIdsRef = useRef(new Set<string>());

  const activeToken = tokens[currentTokenIndex];
  const completedTokenCount = Object.keys(tokenResults).length;
  const progressPercent =
    tokens.length > 0
      ? Math.min(100, (completedTokenCount / tokens.length) * 100)
      : 0;

  const groupedTokens = useMemo(() => {
    if (!lesson) {
      return [];
    }

    return lesson.items.map((item, itemIndex) => ({
      item,
      tokens: tokens.filter((token) => token.itemIndex === itemIndex),
    }));
  }, [lesson, tokens]);

  const ensureTimers = useCallback(() => {
    const now = performance.now();

    if (runStartedAtRef.current === 0) {
      runStartedAtRef.current = now;
    }

    if (itemStartedAtRef.current === 0) {
      itemStartedAtRef.current = now;
    }

    return now;
  }, []);

  const resetRun = useCallback(() => {
    const now = performance.now();

    setCurrentTokenIndex(0);
    setTypedValue("");
    setTokenResults({});
    setRunStats({ correct: 0, wrong: 0 });
    setFeedback({ tone: "idle", text: "准备" });
    setIsRunComplete(false);
    setCompletedElapsedMs(0);
    runStartedAtRef.current = now;
    itemStartedAtRef.current = now;
    currentItemHasMistakeRef.current = false;
    completedItemIdsRef.current = new Set<string>();
  }, []);

  const recordCurrentItem = useCallback(
    (itemIndex: number) => {
      if (!lesson) {
        return;
      }

      const item = lesson.items[itemIndex];

      if (!item || completedItemIdsRef.current.has(item.id)) {
        return;
      }

      const now = ensureTimers();
      const elapsedMs = now - itemStartedAtRef.current;
      const correct = !currentItemHasMistakeRef.current;

      completedItemIdsRef.current.add(item.id);
      onRecordAttempt(lesson.id, item, correct, elapsedMs);
      setRunStats((currentStats) => ({
        correct: currentStats.correct + (correct ? 1 : 0),
        wrong: currentStats.wrong + (correct ? 0 : 1),
      }));
      currentItemHasMistakeRef.current = false;
      itemStartedAtRef.current = now;
    },
    [ensureTimers, lesson, onRecordAttempt],
  );

  const completeRun = useCallback(() => {
    if (!lesson || isRunComplete) {
      return;
    }

    const now = ensureTimers();

    setIsRunComplete(true);
    setTypedValue("");
    setFeedback({ tone: "done", text: "完成" });
    setCompletedElapsedMs(now - runStartedAtRef.current);
    onCompleteLesson(lesson.id);
  }, [ensureTimers, isRunComplete, lesson, onCompleteLesson]);

  const advanceFromToken = useCallback(
    (tokenIndex: number) => {
      const completedToken = tokens[tokenIndex];
      const nextTokenIndex = tokenIndex + 1;
      const nextToken = tokens[nextTokenIndex];

      if (!completedToken) {
        return;
      }

      if (!nextToken || nextToken.itemIndex !== completedToken.itemIndex) {
        recordCurrentItem(completedToken.itemIndex);
      }

      if (!nextToken) {
        completeRun();
        return;
      }

      setCurrentTokenIndex(nextTokenIndex);
      setTypedValue("");
      setFeedback({
        tone: "idle",
        text: nextToken.kind === "space" ? "空格" : "继续",
      });
    },
    [completeRun, recordCurrentItem, tokens],
  );

  const markTokenCorrect = useCallback(
    (token: PracticeToken, tokenIndex: number) => {
      setTokenResults((currentResults) => ({
        ...currentResults,
        [token.id]: "correct",
      }));
      advanceFromToken(tokenIndex);
    },
    [advanceFromToken],
  );

  const flagMistake = useCallback((token: PracticeToken) => {
    currentItemHasMistakeRef.current = true;
    setTokenResults((currentResults) => ({
      ...currentResults,
      [token.id]: "wrong",
    }));
    setFeedback({
      tone: "bad",
      text: token.kind === "space" ? "需要空格" : "按键不匹配",
    });
  }, []);

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (!activeToken || isRunComplete || digit === "1") {
        return;
      }

      ensureTimers();

      if (activeToken.kind === "space") {
        flagMistake(activeToken);
        return;
      }

      const nextValue = typedValue + digit;

      if (!activeToken.expected.startsWith(nextValue)) {
        flagMistake(activeToken);
        return;
      }

      if (nextValue.length === activeToken.expected.length) {
        setTypedValue("");
        setFeedback({ tone: "good", text: "正确" });
        markTokenCorrect(activeToken, currentTokenIndex);
        return;
      }

      setTypedValue(nextValue);
      setFeedback({ tone: "idle", text: "继续" });
    },
    [
      activeToken,
      currentTokenIndex,
      ensureTimers,
      flagMistake,
      isRunComplete,
      markTokenCorrect,
      typedValue,
    ],
  );

  const handleSpace = useCallback(() => {
    if (!activeToken || isRunComplete) {
      return;
    }

    ensureTimers();

    if (activeToken.kind !== "space") {
      flagMistake(activeToken);
      return;
    }

    setFeedback({ tone: "good", text: "空格" });
    markTokenCorrect(activeToken, currentTokenIndex);
  }, [
    activeToken,
    currentTokenIndex,
    ensureTimers,
    flagMistake,
    isRunComplete,
    markTokenCorrect,
  ]);

  const handleBackspace = useCallback(() => {
    if (isRunComplete || !typedValue) {
      return;
    }

    setTypedValue((currentValue) => currentValue.slice(0, -1));
    setFeedback({ tone: "idle", text: "调整" });
  }, [isRunComplete, typedValue]);

  const handleSkipCurrent = useCallback(() => {
    if (!lesson || !activeToken || isRunComplete) {
      return;
    }

    ensureTimers();
    currentItemHasMistakeRef.current = true;
    setTokenResults((currentResults) => {
      const nextResults = { ...currentResults };

      for (const token of tokens) {
        if (token.itemIndex === activeToken.itemIndex) {
          nextResults[token.id] = "wrong";
        }
      }

      return nextResults;
    });
    recordCurrentItem(activeToken.itemIndex);

    const nextTokenIndex = getFirstTokenIndexAfterItem(
      tokens,
      activeToken.itemIndex,
    );

    if (nextTokenIndex === -1) {
      completeRun();
      return;
    }

    setCurrentTokenIndex(nextTokenIndex);
    setTypedValue("");
    setFeedback({ tone: "bad", text: "已跳过" });
  }, [
    activeToken,
    completeRun,
    ensureTimers,
    isRunComplete,
    lesson,
    recordCurrentItem,
    tokens,
  ]);

  if (!lesson) {
    return <Navigate replace to="/" />;
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-3 py-4 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="min-w-0">
          <Link
            className="text-sm font-black text-sky-700 hover:text-sky-800"
            to="/"
          >
            返回课题
          </Link>
          <h1 className="mt-1 truncate text-2xl font-black text-slate-950 sm:text-3xl">
            {lesson.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cx(
              "rounded-full px-3 py-1 text-sm font-black",
              feedback.tone === "good" && "bg-emerald-100 text-emerald-700",
              feedback.tone === "bad" && "bg-rose-100 text-rose-700",
              feedback.tone === "done" && "bg-sky-100 text-sky-700",
              feedback.tone === "idle" && "bg-slate-100 text-slate-600",
            )}
          >
            {feedback.text}
          </span>
          <button
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={isRunComplete}
            onClick={handleSkipCurrent}
            type="button"
          >
            跳过
          </button>
          <button
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            onClick={resetRun}
            type="button"
          >
            重练
          </button>
        </div>
      </header>

      <section className="mt-3" aria-label="练习进度">
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm font-bold text-slate-500">
          <span>
            {Math.min(completedTokenCount, tokens.length)} / {tokens.length}
          </span>
          <span>
            正确 {runStats.correct} · 错题 {runStats.wrong}
          </span>
        </div>
      </section>

      {isRunComplete ? (
        <VictorySummary
          correct={runStats.correct}
          elapsedMs={completedElapsedMs}
          onRetry={resetRun}
          wrong={runStats.wrong}
        />
      ) : (
        <>
          <section className="flex flex-1 items-center py-4" aria-label="题目">
            <div className="max-h-[50svh] w-full overflow-y-auto px-1 py-3 sm:px-2">
              <div className="flex flex-wrap items-start justify-center gap-x-5 gap-y-8 sm:gap-x-7">
                {groupedTokens.map(({ item, tokens: itemTokens }) => (
                  <div className="inline-flex items-start gap-1" key={item.id}>
                    {itemTokens.map((token) => (
                      <TokenCell
                        currentInput={
                          activeToken?.id === token.id ? typedValue : ""
                        }
                        isActive={activeToken?.id === token.id}
                        key={token.id}
                        lessonMode={lesson.mode}
                        result={tokenResults[token.id]}
                        token={token}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="pb-2" aria-label="输入键盘">
            <NineKeyKeyboard
              onBackspace={handleBackspace}
              onDigitPress={handleDigitPress}
              onSpace={handleSpace}
            />
          </section>
        </>
      )}
    </main>
  );
}

type VictorySummaryProps = {
  correct: number;
  elapsedMs: number;
  onRetry: () => void;
  wrong: number;
};

function VictorySummary({
  correct,
  elapsedMs,
  onRetry,
  wrong,
}: VictorySummaryProps) {
  return (
    <section
      className="flex flex-1 items-center justify-center py-8 text-center"
      aria-label="完成结算"
    >
      <div className="w-full max-w-md">
        <div className="relative mx-auto grid h-28 w-28 place-items-center rounded-full bg-emerald-100 text-emerald-800 shadow-inner">
          <span className="absolute left-1/2 top-0 h-5 w-1 -translate-x-1/2 -translate-y-3 rounded-full bg-sky-400" />
          <span className="absolute right-2 top-5 h-4 w-1 rotate-45 rounded-full bg-amber-400" />
          <span className="absolute bottom-3 right-0 h-5 w-1 rotate-90 rounded-full bg-rose-400" />
          <span className="absolute bottom-2 left-3 h-4 w-1 -rotate-45 rounded-full bg-sky-500" />
          <span className="absolute left-0 top-8 h-5 w-1 rotate-90 rounded-full bg-amber-500" />
          <strong className="text-2xl font-black">完成</strong>
        </div>
        <h2 className="mt-5 text-3xl font-black text-slate-950">课题完成</h2>
        <p className="mt-2 text-sm font-bold text-slate-500">
          用时 {formatDuration(elapsedMs)} · 正确 {correct} · 错题 {wrong}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-lg border border-emerald-200 bg-white p-4">
            <p className="text-sm font-bold text-slate-500">正确题项</p>
            <strong className="mt-1 block text-2xl font-black text-emerald-700">
              {correct}
            </strong>
          </div>
          <div className="rounded-lg border border-rose-200 bg-white p-4">
            <p className="text-sm font-bold text-slate-500">错题回收</p>
            <strong className="mt-1 block text-2xl font-black text-rose-700">
              {wrong}
            </strong>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
            to="/"
          >
            返回课题
          </Link>
          <button
            className="h-11 rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            onClick={onRetry}
            type="button"
          >
            再练一次
          </button>
        </div>
      </div>
    </section>
  );
}

type TokenCellProps = {
  currentInput: string;
  isActive: boolean;
  lessonMode: LessonMode;
  result?: TokenResult;
  token: PracticeToken;
};

function TokenCell({
  currentInput,
  isActive,
  lessonMode,
  result,
  token,
}: TokenCellProps) {
  const isCorrect = result === "correct";
  const isWrong = result === "wrong";

  if (token.kind === "space") {
    return (
      <span className="inline-grid justify-items-center gap-1">
        {lessonMode === "hanzi" && <span className="h-5 sm:h-6" />}
        <span
          aria-label="空格"
          className={cx(
            "mx-1 h-10 w-3 rounded-full border transition sm:h-11 sm:w-4",
            isCorrect && "border-emerald-300 bg-emerald-200",
            isWrong && "border-rose-300 bg-rose-200",
            !result && isActive && "border-sky-300 bg-sky-200 ring-2 ring-sky-300",
            !result && !isActive && "border-transparent bg-slate-200/70",
          )}
        />
        <span className="h-4" />
      </span>
    );
  }

  return (
    <span className="inline-grid justify-items-center gap-1" title={token.pinyin}>
      {lessonMode === "hanzi" && (
        <span className="grid h-5 place-items-center text-base font-black leading-5 text-slate-900/35 sm:h-6 sm:text-lg sm:leading-6">
          {token.hanzi ?? ""}
        </span>
      )}
      <span
        className={cx(
          "grid h-10 min-w-12 place-items-center rounded-md border bg-white px-2 text-base font-black leading-none tracking-normal transition sm:h-11 sm:min-w-14 sm:text-lg",
          isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-800",
          isWrong && "border-rose-400 bg-rose-50 text-rose-800",
          !result &&
            isActive &&
            "border-sky-500 text-sky-950 ring-2 ring-sky-300",
          !result && !isActive && "border-slate-200 text-slate-900",
        )}
      >
        {token.label}
      </span>
      <span className="h-4 text-xs font-black leading-4 text-sky-700">
        {isActive ? currentInput : ""}
      </span>
    </span>
  );
}
