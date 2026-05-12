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
  syllableIndex: number;
  letterIndex: number;
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

    const charTokens = syllables.flatMap((syllable, syllableIndex) => {
      const normalizedSyllable = normalizePinyin(syllable);

      return normalizedSyllable.split("").map((letter, letterIndex) => ({
        id: `${trainingItem.id}-${itemIndex}-${syllableIndex}-${letterIndex}-char`,
        kind: "char" as const,
        itemIndex,
        itemId: trainingItem.id,
        label: letter,
        hanzi: hanziCharacters[syllableIndex],
        pinyin: syllable,
        expected: pinyinToDigits(letter),
        syllableIndex,
        letterIndex,
      }));
    });

    if (itemIndex >= items.length - 1) {
      return charTokens;
    }

    const spaceToken: PracticeToken = {
      id: `${trainingItem.id}-${itemIndex}-space`,
      kind: "space",
      itemIndex,
      itemId: trainingItem.id,
      label: "",
      pinyin: " ",
      expected: " ",
      syllableIndex: syllables.length,
      letterIndex: 0,
    };

    return [...charTokens, spaceToken];
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

export const getPreviousTokenIndexInItem = (
  tokens: PracticeToken[],
  tokenIndex: number,
) => {
  const currentToken = tokens[tokenIndex];

  if (!currentToken) {
    return -1;
  }

  for (let index = tokenIndex - 1; index >= 0; index -= 1) {
    const token = tokens[index];

    if (token.itemIndex !== currentToken.itemIndex) {
      return -1;
    }

    if (token.kind === "char") {
      return index;
    }
  }

  return -1;
};
