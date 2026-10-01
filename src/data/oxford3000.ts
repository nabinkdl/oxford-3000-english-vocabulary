import { WordItem } from '../types/vocab';
import { RAW_A, RAW_B, RAW_C, RAW_D, RAW_E, RAW_F } from './lettersA_F';
import { RAW_G, RAW_H, RAW_I, RAW_J, RAW_K, RAW_L, RAW_M } from './lettersG_M';
import { RAW_N, RAW_O, RAW_P, RAW_Q, RAW_R, RAW_S } from './lettersN_S';
import { RAW_T, RAW_U, RAW_V, RAW_W, RAW_X, RAW_Y, RAW_Z } from './lettersT_Z';

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const RAW_DICT: Record<string, string> = {
  A: RAW_A,
  B: RAW_B,
  C: RAW_C,
  D: RAW_D,
  E: RAW_E,
  F: RAW_F,
  G: RAW_G,
  H: RAW_H,
  I: RAW_I,
  J: RAW_J,
  K: RAW_K,
  L: RAW_L,
  M: RAW_M,
  N: RAW_N,
  O: RAW_O,
  P: RAW_P,
  Q: RAW_Q,
  R: RAW_R,
  S: RAW_S,
  T: RAW_T,
  U: RAW_U,
  V: RAW_V,
  W: RAW_W,
  X: RAW_X,
  Y: RAW_Y,
  Z: RAW_Z,
};

export const VOCAB_BY_LETTER: Record<string, WordItem[]> = {};
export const ALL_WORDS: WordItem[] = [];

LETTERS.forEach((letter) => {
  VOCAB_BY_LETTER[letter] = [];
  const text = RAW_DICT[letter] || '';
  if (!text.trim()) return;

  const lines = text.split('\n');
  lines.forEach((line, index) => {
    const parts = line.split('|');
    if (parts.length >= 5) {
      const item: WordItem = {
        id: `${letter}-${index}`,
        word: parts[0].trim(),
        type: parts[1].trim(),
        level: parts[2].trim(),
        english: parts[3].trim(),
        nepali: parts[4].replace(/[`\r\n;]/g, '').trim(),
        letter,
      };
      VOCAB_BY_LETTER[letter].push(item);
      ALL_WORDS.push(item);
    }
  });
});

export const TOTAL_WORD_COUNT = ALL_WORDS.length;
