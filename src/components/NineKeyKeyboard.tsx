import { useCallback } from "react";
import { NINE_KEYS } from "../utils/nineKey";
import { cx } from "../utils/className";
import { triggerVibration } from "../utils/haptics";
import type { VibrationIntensity } from "../utils/preferences";

type NineKeyKeyboardProps = {
  disabled?: boolean;
  vibrationIntensity: VibrationIntensity;
  onDigitPress: (digit: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
};

const keyByDigit = new Map(NINE_KEYS.map((key) => [key.digit, key]));

const cellClass =
  "h-[clamp(2.6rem,8vh,4.5rem)] rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-100 ease-out hover:border-sky-400 hover:bg-sky-50 active:translate-y-0.5 active:scale-[0.97] active:shadow-inner focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:shadow-none dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:focus-visible:outline-sky-600";

const keySoundSources = [
  "/soun1.mp3",
  "/soun2.mp3",
  "/soun3.mp3",
  "/soun4.mp3",
  "/soun5.mp3",
];

export function NineKeyKeyboard({
  disabled = false,
  vibrationIntensity,
  onDigitPress,
  onBackspace,
  onSpace,
}: NineKeyKeyboardProps) {
  const playRandomKeySound = useCallback(() => {
    const sourceIndex = Math.floor(Math.random() * keySoundSources.length);
    const audio = new Audio(keySoundSources[sourceIndex]);
    audio.volume = 0.65;
    void audio.play().catch(() => undefined);
  }, []);

  const handleKeyboardPress = useCallback(
    (action: () => void) => {
      triggerVibration(vibrationIntensity);
      playRandomKeySound();
      action();
    },
    [playRandomKeySound, vibrationIntensity],
  );

  const renderDigit = (digit: string) => {
    const key = keyByDigit.get(digit);

    if (!key) {
      return null;
    }

    return (
      <button
        className={cx(cellClass, "grid place-items-center p-1.5 sm:p-2")}
        aria-label={key.letters ? `${key.letters} 键` : "空白键位"}
        disabled={disabled || !key.enabled}
        key={digit}
        onClick={() => handleKeyboardPress(() => onDigitPress(digit))}
        type="button"
      >
        {key.letters && (
          <span className="max-w-full break-all text-center text-sm font-black leading-[1.1] tracking-tight sm:text-base">
            {key.letters}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      className="mx-auto grid w-full max-w-xl grid-cols-[0.7fr_1fr_1fr_1fr_0.7fr] gap-1.5 sm:gap-2"
      aria-label="九宫格键盘"
    >
      <button
        aria-hidden="true"
        className={cx(cellClass, "row-span-4 pointer-events-none")}
        disabled
        tabIndex={-1}
        type="button"
      />
      {renderDigit("1")}
      {renderDigit("2")}
      {renderDigit("3")}
      <button
        aria-label="退格"
        className={cx(cellClass, "text-2xl font-black sm:text-3xl")}
        disabled={disabled}
        onClick={() => handleKeyboardPress(onBackspace)}
        type="button"
      >
        ⌫
      </button>

      {renderDigit("4")}
      {renderDigit("5")}
      {renderDigit("6")}
      <div aria-hidden="true" />

      {renderDigit("7")}
      {renderDigit("8")}
      {renderDigit("9")}
      <div aria-hidden="true" />

      <button
        className={cx(
          cellClass,
          "col-span-3 px-2 text-sm font-black text-slate-700 sm:text-base dark:text-slate-200",
        )}
        disabled={disabled}
        onClick={() => handleKeyboardPress(onSpace)}
        type="button"
      >
        空格
      </button>
      <div aria-hidden="true" />
    </div>
  );
}
