export type NineKey = {
  digit: string;
  letters: string;
  enabled: boolean;
};

export const NINE_KEYS: NineKey[] = [
  { digit: "1", letters: "", enabled: false },
  { digit: "2", letters: "ABC", enabled: true },
  { digit: "3", letters: "DEF", enabled: true },
  { digit: "4", letters: "GHI", enabled: true },
  { digit: "5", letters: "JKL", enabled: true },
  { digit: "6", letters: "MNO", enabled: true },
  { digit: "7", letters: "PQRS", enabled: true },
  { digit: "8", letters: "TUV", enabled: true },
  { digit: "9", letters: "WXYZ", enabled: true },
];

const digitByLetter = new Map<string, string>();

for (const key of NINE_KEYS) {
  for (const letter of key.letters.toLowerCase()) {
    digitByLetter.set(letter, key.digit);
  }
}

export const normalizePinyin = (pinyin: string) =>
  pinyin
    .toLowerCase()
    .replaceAll("ü", "v")
    .replaceAll("u:", "v")
    .replace(/[^a-z]/g, "");

export const pinyinToDigits = (pinyin: string) =>
  normalizePinyin(pinyin)
    .split("")
    .map((letter) => digitByLetter.get(letter) ?? "")
    .join("");

export const formatDuration = (milliseconds: number) => {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return "0.0s";
  }

  return `${(milliseconds / 1000).toFixed(1)}s`;
};

export const formatPinyin = (pinyin: string, displayPinyin?: string) =>
  displayPinyin ?? pinyin.replaceAll("v", "ü");
