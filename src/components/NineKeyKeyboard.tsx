import { useCallback } from "react";
import { NINE_KEYS } from "../utils/nineKey";
import { cx } from "../utils/className";

type NineKeyKeyboardProps = {
  disabled?: boolean;
  onDigitPress: (digit: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
};

const keyByDigit = new Map(NINE_KEYS.map((key) => [key.digit, key]));

const cellClass =
  "min-h-16 rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm transition hover:border-sky-400 hover:bg-sky-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-20";

const keySoundSources = [
  "/soun1.mp3",
  "/soun2.mp3",
  "/soun3.mp3",
  "/soun4.mp3",
  "/soun5.mp3",
];

export function NineKeyKeyboard({
  disabled = false,
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
      playRandomKeySound();
      action();
    },
    [playRandomKeySound],
  );

  const renderDigit = (digit: string) => {
    const key = keyByDigit.get(digit);

    if (!key) {
      return null;
    }

    return (
      <button
        className={cx(cellClass, "grid place-items-center p-2")}
        aria-label={key.letters ? `${key.letters} 键` : "空白键位"}
        disabled={disabled || !key.enabled}
        key={digit}
        onClick={() => handleKeyboardPress(() => onDigitPress(digit))}
        type="button"
      >
        {key.letters && (
          <span className="text-xl font-black leading-none tracking-normal sm:text-2xl">
            {key.letters}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      className="mx-auto grid w-full max-w-xl grid-cols-5 gap-2 sm:gap-3"
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
        className={cx(cellClass, "text-3xl font-black")}
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
          "col-span-3 px-3 text-base font-black text-slate-700",
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
