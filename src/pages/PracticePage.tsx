import { useCallback, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { NineKeyKeyboard } from "../components/NineKeyKeyboard";
import { LESSONS } from "../data/lessons";
import type { TrainingItem } from "../data/lessons";
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
    () => (lesson ? createPracticeTokens(lesson.items) : []),
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
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
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

      <section className="flex flex-1 items-center py-4" aria-label="题目">
        <div className="max-h-[48svh] w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            {groupedTokens.map(({ item, tokens: itemTokens }) => (
              <div className="inline-flex items-center gap-1" key={item.id}>
                {itemTokens.map((token) => (
                  <TokenCell
                    currentInput={
                      activeToken?.id === token.id ? typedValue : ""
                    }
                    isActive={activeToken?.id === token.id}
                    key={token.id}
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
          disabled={isRunComplete}
          onBackspace={handleBackspace}
          onDigitPress={handleDigitPress}
          onSpace={handleSpace}
        />
      </section>

      {isRunComplete && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="text-lg font-black">本课题完成</strong>
            <span className="text-sm font-bold">
              用时 {formatDuration(completedElapsedMs)} · 正确{" "}
              {runStats.correct} · 错题 {runStats.wrong}
            </span>
          </div>
        </div>
      )}
    </main>
  );
}

type TokenCellProps = {
  currentInput: string;
  isActive: boolean;
  result?: TokenResult;
  token: PracticeToken;
};

function TokenCell({ currentInput, isActive, result, token }: TokenCellProps) {
  if (token.kind === "space") {
    return (
      <span
        aria-label="空格"
        className={cx(
          "mx-1 h-12 w-5 rounded-full transition sm:h-14 sm:w-7",
          isActive && "bg-sky-200 ring-2 ring-sky-300",
          !isActive && result === "correct" && "bg-emerald-100",
          !isActive && result === "wrong" && "bg-rose-100",
          !isActive && !result && "bg-transparent",
        )}
      />
    );
  }

  return (
    <span
      className={cx(
        "relative grid h-12 w-12 place-items-center rounded-lg border text-xl font-black transition sm:h-14 sm:w-14 sm:text-2xl",
        isActive && "border-sky-500 bg-sky-50 text-sky-950 ring-2 ring-sky-300",
        !isActive &&
          result === "correct" &&
          "border-emerald-300 bg-emerald-50 text-emerald-800",
        !isActive &&
          result === "wrong" &&
          "border-rose-300 bg-rose-50 text-rose-800",
        !isActive && !result && "border-slate-200 bg-slate-50 text-slate-900",
      )}
      title={token.pinyin}
    >
      {token.label}
      {isActive && currentInput && (
        <small className="absolute -bottom-5 text-xs font-black text-sky-700">
          {currentInput}
        </small>
      )}
    </span>
  );
}
