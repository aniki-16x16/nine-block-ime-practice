import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { NineKeyKeyboard } from "../components/NineKeyKeyboard";
import { LESSONS } from "../data/lessons";
import type { LessonMode, TrainingItem } from "../data/lessons";
import { formatDuration } from "../utils/nineKey";
import {
  createPracticeTokens,
  getPreviousTokenIndexInItem,
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

const createPracticeQueue = (items: TrainingItem[], practiceSize: number) => {
  if (items.length === 0) {
    return [];
  }

  return Array.from({ length: practiceSize }, () => {
    const itemIndex = Math.floor(Math.random() * items.length);
    return items[itemIndex];
  });
};

const getTokenElementId = (tokenId: string) => `practice-token-${tokenId}`;

export function PracticePage({
  onCompleteLesson,
  onRecordAttempt,
}: PracticePageProps) {
  const { lessonId } = useParams();
  const lesson = useMemo(
    () => LESSONS.find((lessonItem) => lessonItem.id === lessonId),
    [lessonId],
  );
  const practiceItems = useMemo(
    () =>
      lesson
        ? createPracticeQueue(lesson.items, lesson.practiceSize ?? lesson.items.length)
        : [],
    [lesson],
  );
  const tokens = useMemo(
    () => (lesson ? createPracticeTokens(practiceItems, lesson.mode) : []),
    [lesson, practiceItems],
  );
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [typedValue, setTypedValue] = useState("");
  const [tokenResults, setTokenResults] = useState<Record<string, TokenResult>>(
    {},
  );
  const [runStats, setRunStats] = useState<RunStats>({ correct: 0, wrong: 0 });
  const [isRunComplete, setIsRunComplete] = useState(false);
  const [completedElapsedMs, setCompletedElapsedMs] = useState(0);
  const runStartedAtRef = useRef(0);
  const itemStartedAtRef = useRef(0);
  const currentItemHasMistakeRef = useRef(false);
  const completedItemIndicesRef = useRef(new Set<number>());

  const activeToken = tokens[currentTokenIndex];
  const completedItemCount = runStats.correct + runStats.wrong;
  const progressPercent =
    practiceItems.length > 0
      ? Math.min(100, (completedItemCount / practiceItems.length) * 100)
      : 0;

  const groupedTokens = useMemo(() => {
    if (!lesson) {
      return [];
    }

    return practiceItems.map((item, itemIndex) => ({
      item,
      tokens: tokens.filter((token) => token.itemIndex === itemIndex),
    }));
  }, [lesson, practiceItems, tokens]);

  useEffect(() => {
    if (!activeToken || isRunComplete) {
      return;
    }

    document.getElementById(getTokenElementId(activeToken.id))?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [activeToken, isRunComplete]);

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

  const recordCurrentItem = useCallback(
    (itemIndex: number) => {
      if (!lesson) {
        return;
      }

      const item = practiceItems[itemIndex];

      if (!item || completedItemIndicesRef.current.has(itemIndex)) {
        return;
      }

      const now = ensureTimers();
      const elapsedMs = now - itemStartedAtRef.current;
      const correct = !currentItemHasMistakeRef.current;

      completedItemIndicesRef.current.add(itemIndex);
      onRecordAttempt(lesson.id, item, correct, elapsedMs);
      setRunStats((currentStats) => ({
        correct: currentStats.correct + (correct ? 1 : 0),
        wrong: currentStats.wrong + (correct ? 0 : 1),
      }));
      currentItemHasMistakeRef.current = false;
      itemStartedAtRef.current = now;
    },
    [ensureTimers, lesson, onRecordAttempt, practiceItems],
  );

  const completeRun = useCallback(() => {
    if (!lesson || isRunComplete) {
      return;
    }

    const now = ensureTimers();

    setIsRunComplete(true);
    setTypedValue("");
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

      if (digit !== activeToken.expected) {
        flagMistake(activeToken);
        return;
      }

      setTypedValue("");
      markTokenCorrect(activeToken, currentTokenIndex);
    },
    [
      activeToken,
      currentTokenIndex,
      ensureTimers,
      flagMistake,
      isRunComplete,
      markTokenCorrect,
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
    if (isRunComplete || !activeToken) {
      return;
    }

    ensureTimers();
    setTypedValue("");

    if (tokenResults[activeToken.id]) {
      setTokenResults((currentResults) => {
        const nextResults = { ...currentResults };
        delete nextResults[activeToken.id];
        return nextResults;
      });
      return;
    }

    const previousTokenIndex = getPreviousTokenIndexInItem(
      tokens,
      currentTokenIndex,
    );

    if (previousTokenIndex === -1) {
      return;
    }

    const previousToken = tokens[previousTokenIndex];

    setCurrentTokenIndex(previousTokenIndex);
    setTokenResults((currentResults) => {
      const nextResults = { ...currentResults };
      delete nextResults[activeToken.id];
      delete nextResults[previousToken.id];
      return nextResults;
    });
  }, [
    activeToken,
    currentTokenIndex,
    ensureTimers,
    isRunComplete,
    tokenResults,
    tokens,
  ]);

  if (!lesson) {
    return <Navigate replace to="/" />;
  }

  return (
    <main
      className="mx-auto flex h-[100dvh] w-full max-w-5xl flex-col overflow-hidden px-3 sm:px-6"
      style={{
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))",
      }}
    >
      <header className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center border-b border-slate-200 pb-3">
        <Link
          aria-label="返回课题"
          className="grid h-11 w-11 place-items-center rounded-lg text-2xl font-black text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          to="/"
        >
          ←
        </Link>
        <h1 className="truncate text-center text-2xl font-black text-slate-950 sm:text-3xl">
          {lesson.title}
        </h1>
        <span aria-hidden="true" />
      </header>

      <section className="mt-3 shrink-0" aria-label="练习进度">
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm font-bold text-slate-500">
          <span>
            {Math.min(completedItemCount, practiceItems.length)} / {practiceItems.length}
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
          wrong={runStats.wrong}
        />
      ) : (
        <>
          <section className="mt-3 min-h-0 flex-1 overflow-hidden" aria-label="题目">
            <div className="h-full w-full overflow-y-auto overscroll-contain px-1 py-2 sm:px-2">
              <div className="flex flex-wrap items-start justify-center gap-x-0 gap-y-8">
                {groupedTokens.map(({ item, tokens: itemTokens }) => (
                  <PracticeItemCells
                    activeTokenId={activeToken?.id}
                    currentInput={typedValue}
                    itemTokens={itemTokens}
                    key={`${item.id}-${itemTokens[0]?.itemIndex ?? 0}`}
                    lessonMode={lesson.mode}
                    tokenResults={tokenResults}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="shrink-0 pt-2" aria-label="输入键盘">
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
  wrong: number;
};

function VictorySummary({
  correct,
  elapsedMs,
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
        <div className="mt-6 flex justify-center">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
            to="/"
          >
            返回课题
          </Link>
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

type PracticeItemCellsProps = {
  activeTokenId?: string;
  currentInput: string;
  itemTokens: PracticeToken[];
  lessonMode: LessonMode;
  tokenResults: Record<string, TokenResult>;
};

function PracticeItemCells({
  activeTokenId,
  currentInput,
  itemTokens,
  lessonMode,
  tokenResults,
}: PracticeItemCellsProps) {
  const charTokens = itemTokens.filter((token) => token.kind === "char");
  const spaceToken = itemTokens.find((token) => token.kind === "space");
  const syllableIndexes = [...new Set(charTokens.map((token) => token.syllableIndex))];

  return (
    <div className="inline-flex items-start gap-0">
      <span className="inline-flex items-start gap-1">
        {syllableIndexes.map((syllableIndex) => {
          const syllableTokens = charTokens.filter(
            (token) => token.syllableIndex === syllableIndex,
          );

          return (
            <SyllableCells
              activeTokenId={activeTokenId}
              currentInput={currentInput}
              key={syllableIndex}
              lessonMode={lessonMode}
              tokenResults={tokenResults}
              tokens={syllableTokens}
            />
          );
        })}
      </span>
      {spaceToken && (
        <TokenCell
          currentInput={activeTokenId === spaceToken.id ? currentInput : ""}
          isActive={activeTokenId === spaceToken.id}
          lessonMode={lessonMode}
          result={tokenResults[spaceToken.id]}
          token={spaceToken}
        />
      )}
    </div>
  );
}

type SyllableCellsProps = {
  activeTokenId?: string;
  currentInput: string;
  lessonMode: LessonMode;
  tokenResults: Record<string, TokenResult>;
  tokens: PracticeToken[];
};

function SyllableCells({
  activeTokenId,
  currentInput,
  lessonMode,
  tokenResults,
  tokens,
}: SyllableCellsProps) {
  const hanzi = tokens[0]?.hanzi;

  return (
    <span className="inline-grid justify-items-center gap-1">
      {lessonMode === "hanzi" && (
        <span className="grid h-5 place-items-center text-base font-black leading-5 text-slate-900/35 sm:h-6 sm:text-lg sm:leading-6">
          {hanzi ?? ""}
        </span>
      )}
      <span className="inline-flex gap-0.5">
        {tokens.map((token) => (
          <TokenCell
            currentInput={activeTokenId === token.id ? currentInput : ""}
            isActive={activeTokenId === token.id}
            key={token.id}
            lessonMode={lessonMode}
            result={tokenResults[token.id]}
            token={token}
          />
        ))}
      </span>
    </span>
  );
}

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
          id={getTokenElementId(token.id)}
          className={cx(
            "mx-2 h-10 w-5 rounded-md border bg-teal-50 transition sm:h-11 sm:w-6",
            isCorrect && "border-teal-400 bg-teal-100",
            isWrong && "border-rose-400 bg-rose-50",
            !result && isActive && "border-sky-500 bg-sky-200 ring-2 ring-sky-300",
            !result && !isActive && "border-slate-200",
          )}
        />
        <span className="h-4" />
      </span>
    );
  }

  return (
    <span className="inline-grid justify-items-center gap-1" title={token.pinyin}>
      <span
        id={getTokenElementId(token.id)}
        className={cx(
          "grid h-10 w-7 place-items-center rounded-md border bg-white text-base font-black leading-none tracking-normal transition sm:h-11 sm:w-8 sm:text-lg",
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
