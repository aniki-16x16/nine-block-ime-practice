import type { LessonMode, TrainingItem } from "../data/lessons";
import { normalizePinyin, pinyinToDigits } from "./nineKey";

export type PracticeToken = {
  id: string;
  kind: "char" | "space";
  itemIndex: number;
  itemId: string;
  label: string;
  hanzi?: string;
  pinyin: string;
  expected: string;
};

export type TokenResult = "correct" | "wrong";

export const splitPinyin = (pinyin: string) =>
  pinyin.trim().split(/\s+/).filter(Boolean);

export const createPracticeTokens = (
  items: TrainingItem[],
  mode: LessonMode = "pinyin",
) =>
  items.flatMap((trainingItem, itemIndex) => {
    const syllables = splitPinyin(trainingItem.pinyin);
    const labelCharacters = Array.from(trainingItem.label);
    const hanziCharacters =
      mode === "hanzi" && labelCharacters.length === syllables.length
        ? labelCharacters
        : [];

    return syllables.flatMap((syllable, syllableIndex) => {
      const tokenBaseId = `${trainingItem.id}-${syllableIndex}`;
      const charToken: PracticeToken = {
        id: `${tokenBaseId}-char`,
        kind: "char",
        itemIndex,
        itemId: trainingItem.id,
        label: normalizePinyin(syllable),
        hanzi: hanziCharacters[syllableIndex],
        pinyin: syllable,
        expected: pinyinToDigits(syllable),
      };

      const spaceToken: PracticeToken = {
        id: `${tokenBaseId}-space`,
        kind: "space",
        itemIndex,
        itemId: trainingItem.id,
        label: "",
        pinyin: " ",
        expected: " ",
      };

      return [charToken, spaceToken];
    });
  });

export const getAccuracy = (correct: number, attempts: number) => {
  if (attempts === 0) {
    return 0;
  }

  return Math.round((correct / attempts) * 100);
};

export const getFirstTokenIndexForItem = (
  tokens: PracticeToken[],
  itemIndex: number,
) => tokens.findIndex((token) => token.itemIndex === itemIndex);

export const getFirstTokenIndexAfterItem = (
  tokens: PracticeToken[],
  itemIndex: number,
) => tokens.findIndex((token) => token.itemIndex > itemIndex);
