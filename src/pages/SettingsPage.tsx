import { useState } from "react";
import type { ChangeEvent, KeyboardEvent, PointerEvent } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import type { VibrationIntensity } from "../utils/preferences";
import { cx } from "../utils/className";

type SettingsPageProps = {
  onChangeVibrationIntensity: (intensity: VibrationIntensity) => void;
  onPreviewVibration: (intensity: VibrationIntensity) => void;
  onResetProgress: () => void;
  vibrationIntensity: VibrationIntensity;
};

const vibrationOptions: Array<{
  label: string;
  value: VibrationIntensity;
}> = [
  { label: "无", value: 0 },
  { label: "弱", value: 1 },
  { label: "强", value: 2 },
];

const parseVibrationIntensity = (value: string): VibrationIntensity => {
  const numericValue = Number(value);

  if (numericValue === 2) {
    return 2;
  }

  if (numericValue === 1) {
    return 1;
  }

  return 0;
};

export function SettingsPage({
  onChangeVibrationIntensity,
  onPreviewVibration,
  onResetProgress,
  vibrationIntensity,
}: SettingsPageProps) {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const currentOption =
    vibrationOptions.find((option) => option.value === vibrationIntensity) ??
    vibrationOptions[0];

  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeVibrationIntensity(
      parseVibrationIntensity(event.currentTarget.value),
    );
  };

  const previewRangeValue = (inputElement: HTMLInputElement) => {
    const nextIntensity = parseVibrationIntensity(inputElement.value);
    onChangeVibrationIntensity(nextIntensity);
    onPreviewVibration(nextIntensity);
  };

  const handleRangePointerUp = (event: PointerEvent<HTMLInputElement>) => {
    previewRangeValue(event.currentTarget);
  };

  const handleRangeKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      previewRangeValue(event.currentTarget);
    }
  };

  const handleConfirmReset = () => {
    onResetProgress();
    setIsResetConfirmOpen(false);
  };

  return (
    <main
      className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-4 py-5 sm:px-6 lg:px-8"
      style={{
        paddingTop: "max(1.25rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
      }}
    >
      <header className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center border-b border-slate-200 pb-4 dark:border-slate-800">
        <Link
          aria-label="返回课题"
          className="grid h-11 w-11 place-items-center rounded-lg text-2xl font-black text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-300 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:outline-sky-600"
          to="/"
        >
          ←
        </Link>
        <h1 className="truncate text-center text-2xl font-black text-slate-950 sm:text-3xl dark:text-slate-50">
          设置
        </h1>
        <span aria-hidden="true" />
      </header>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="flex items-center justify-between gap-4">
          <label
            className="text-base font-black text-slate-950 dark:text-slate-50"
            htmlFor="vibration-intensity"
          >
            震动强度
          </label>
          <strong className="rounded-full bg-sky-50 px-3 py-1 text-sm font-black text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            {currentOption.label}
          </strong>
        </div>

        <input
          aria-valuetext={currentOption.label}
          className="mt-5 w-full accent-sky-500 dark:accent-sky-400"
          id="vibration-intensity"
          max={2}
          min={0}
          onChange={handleRangeChange}
          onKeyUp={handleRangeKeyUp}
          onPointerUp={handleRangePointerUp}
          step={1}
          type="range"
          value={vibrationIntensity}
        />

        <div className="mt-2 grid grid-cols-3 text-xs font-black text-slate-500 dark:text-slate-400">
          {vibrationOptions.map((option) => (
            <span
              className={cx(
                option.value === vibrationIntensity &&
                  "text-sky-700 dark:text-sky-300",
                option.value === 1 && "text-center",
                option.value === 2 && "text-right",
              )}
              key={option.value}
            >
              {option.label}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <h2 className="text-base font-black text-slate-950 dark:text-slate-50">
          数据管理
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          清空后将移除练习进度、统计和错题记录，且不可恢复。
        </p>
        <button
          className="mt-4 block h-12 w-full rounded-lg bg-rose-600 px-4 text-sm font-black text-white transition hover:bg-rose-500 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-300 active:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 dark:focus-visible:outline-rose-500 dark:active:bg-rose-800"
          onClick={() => setIsResetConfirmOpen(true)}
          type="button"
        >
          清空所有练习数据
        </button>
      </section>

      <ConfirmDialog
        cancelText="取消"
        confirmText="确认清空"
        description="此操作不可恢复，你的练习进度与统计记录将被永久删除。"
        isOpen={isResetConfirmOpen}
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="确认清空数据？"
      />
    </main>
  );
}
