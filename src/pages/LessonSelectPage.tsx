import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LESSONS } from "../data/lessons";
import type { TrainingItem } from "../data/lessons";
import { formatDuration } from "../utils/nineKey";
import type { ThemeMode } from "../utils/preferences";
import { getAccuracy } from "../utils/practice";
import type { PracticeProgress } from "../utils/storage";

type LessonSelectPageProps = {
  averageTime: number;
  onResetProgress: () => void;
  onToggleTheme: () => void;
  progress: PracticeProgress;
  themeMode: ThemeMode;
  totalAccuracy: number;
  weakItems: TrainingItem[];
};

const LESSON_LIST_SCROLL_KEY = "nine-block-ime-lesson-list-scroll-y";

export function LessonSelectPage({
  averageTime,
  onResetProgress,
  onToggleTheme,
  progress,
  themeMode,
  totalAccuracy,
  weakItems,
}: LessonSelectPageProps) {
  useEffect(() => {
    const storedTop = window.sessionStorage.getItem(LESSON_LIST_SCROLL_KEY);

    if (!storedTop) {
      return;
    }

    const nextTop = Number.parseFloat(storedTop);

    if (!Number.isFinite(nextTop)) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: nextTop, behavior: "auto" });
    });
  }, []);

  useEffect(() => {
    let frameId: number | null = null;

    const persistScrollTop = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        window.sessionStorage.setItem(
          LESSON_LIST_SCROLL_KEY,
          String(window.scrollY),
        );
        frameId = null;
      });
    };

    persistScrollTop();
    window.addEventListener("scroll", persistScrollTop, { passive: true });

    return () => {
      persistScrollTop();
      window.removeEventListener("scroll", persistScrollTop);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const lessonGroups = [
    {
      title: "拼音练习",
      lessons: LESSONS.filter((lesson) => lesson.mode === "pinyin"),
    },
    {
      title: "汉字练习",
      lessons: LESSONS.filter((lesson) => lesson.mode === "hanzi"),
    },
  ];

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-sky-700 dark:text-sky-300">
              九宫格输入训练
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl dark:text-slate-50">
              选择课题
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              aria-label={
                themeMode === "dark" ? "切换到亮色模式" : "切换到暗色模式"
              }
              className="grid h-11 w-11 place-items-center rounded-lg border border-slate-300 bg-white text-xl font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:shadow-none dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-300 dark:focus-visible:outline-sky-600"
              onClick={onToggleTheme}
              title={themeMode === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
              type="button"
            >
              <span aria-hidden="true">{themeMode === "dark" ? "☀" : "☾"}</span>
            </button>
            <Link
              aria-label="打开设置"
              className="grid h-11 w-11 place-items-center rounded-lg border border-slate-300 bg-white text-xl font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:shadow-none dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-300 dark:focus-visible:outline-sky-600"
              title="设置"
              to="/settings"
            >
              ⚙
            </Link>
          </div>
        </div>
        <button
          className="mt-3 h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:shadow-none dark:hover:border-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:focus-visible:outline-rose-900 sm:float-right sm:mt-0"
          onClick={onResetProgress}
          type="button"
        >
          清空数据
        </button>
      </header>

      <section
        className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4"
        aria-label="整体练习信息"
      >
        <InfoTile label="总正确率" value={`${totalAccuracy}%`} />
        <InfoTile label="平均用时" value={formatDuration(averageTime)} />
        <InfoTile label="最佳连击" value={`${progress.bestStreak}`} />
        <InfoTile label="已练题次" value={`${progress.totalAttempts}`} />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
        <section className="grid gap-5" aria-label="课题列表">
          {lessonGroups.map((group) => (
            <div key={group.title}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-slate-950 dark:text-slate-50">
                  {group.title}
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {group.lessons.length} 个课题
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {group.lessons.map((lesson) => {
                  const lessonStats = progress.lessonStats[lesson.id];
                  const lessonAccuracy = getAccuracy(
                    lessonStats?.correct ?? 0,
                    lessonStats?.attempts ?? 0,
                  );
                  const practiceSize =
                    lesson.practiceSize ?? lesson.items.length;

                  return (
                    <Link
                      className="group rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:border-sky-600 dark:hover:bg-slate-900/80 dark:focus-visible:outline-sky-600"
                      key={lesson.id}
                      to={`/practice/${lesson.id}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black text-sky-700 dark:text-sky-300">
                          {lesson.level}
                        </p>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {practiceSize} 题
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-base font-black text-slate-950 dark:text-slate-50">
                        {lesson.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {lesson.focus}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
                        <span className="font-bold text-slate-500 dark:text-slate-400">
                          完成 {lessonStats?.completed ?? 0} 轮
                        </span>
                        <span className="font-black text-slate-900 dark:text-slate-100">
                          {lessonStats?.attempts
                            ? `${lessonAccuracy}%`
                            : "未开始"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <aside className="grid gap-3 self-start" aria-label="辅助信息">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-950 dark:text-slate-50">
                薄弱项
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {weakItems.length}
              </span>
            </div>
            {weakItems.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {weakItems.slice(0, 10).map((item) => {
                  const itemStats = progress.itemStats[item.id];

                  return (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-sm font-black text-rose-700 dark:bg-rose-950/70 dark:text-rose-200"
                      key={item.id}
                    >
                      {item.label}
                      <small className="text-xs text-rose-500 dark:text-rose-300">
                        {itemStats?.mistakes ?? 0}
                      </small>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                暂无错题记录
              </p>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <h2 className="text-lg font-black text-slate-950 dark:text-slate-50">
              近 14 天
            </h2>
            <div className="mt-3 grid h-24 grid-cols-[repeat(14,minmax(0,1fr))] items-end gap-1">
              {(progress.history.length > 0
                ? progress.history
                : [{ date: "today", attempts: 0, correct: 0, totalTimeMs: 0 }]
              ).map((day) => {
                const dayAccuracy = getAccuracy(day.correct, day.attempts);

                return (
                  <span
                    className="flex h-full items-end rounded-full bg-slate-100 dark:bg-slate-800"
                    key={day.date}
                    title={`${day.date} ${dayAccuracy}%`}
                  >
                    <i
                      className="block w-full rounded-full bg-emerald-500"
                      style={{ height: `${Math.max(8, dayAccuracy)}%` }}
                    />
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

type InfoTileProps = {
  label: string;
  value: string;
};

function InfoTile({ label, value }: InfoTileProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <strong className="mt-1 block text-2xl font-black text-slate-950 dark:text-slate-50">
        {value}
      </strong>
    </div>
  );
}
