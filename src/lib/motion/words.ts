const ARABIC = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
const LATIN_START = /^[\p{Script=Latin}\d]/u;
const LATIN_END = /[\p{Script=Latin}\d]$/u;

export function hasArabic(text: string): boolean {
  return ARABIC.test(text);
}

/**
 * Splits text into the units a word-by-word reveal animates. In Arabic text,
 * runs of consecutive Latin words ("Clean Architecture") stay together: each
 * unit is laid out on its own, so splitting them would let the right-to-left
 * line reverse their order. A unit may start in Arabic ("وClean"); the
 * browser's bidi handles direction inside it.
 */
export function revealWords(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!hasArabic(text)) return words;

  const units: string[] = [];
  for (const word of words) {
    const previous = units.at(-1);
    // "وClean" + "Architecture" → "وClean Architecture": the Latin run continues.
    if (previous !== undefined && LATIN_END.test(previous) && LATIN_START.test(word)) {
      units[units.length - 1] = `${previous} ${word}`;
    } else {
      units.push(word);
    }
  }
  return units;
}
