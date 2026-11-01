import {
  detectLanguage,
  RO_ALPHABET,
  EN_ALPHABET,
  LanguageProfile,
} from "./languageDetector";

export const MIN_LETTERS_REQUIRED = 50000;

// Universal Unicode letter matching (Latin, Cyrillic, Greek, etc.)
export const LETTERS_REGEX = /\p{L}/gu;
export const SINGLE_LETTER_REGEX = /^\p{L}$/u;

export { RO_ALPHABET, EN_ALPHABET };

export interface CharacterFrequency {
  char: string;
  count: number;
  relativeFrequency: number; // percentage (e.g. 12.34)
  isLetter: boolean;
  isVowel?: boolean;
}

export interface WordFrequency {
  word: string;
  count: number;
  relativeFrequency: number; // percentage (e.g. 5.12)
}

export interface InvisibleCharDetail {
  name: string;
  code: string;
  count: number;
}

export interface DocumentAnalysis {
  fileName: string;
  fileSize: number;
  totalCharsNoSpaces: number; // characters without whitespace
  totalLetters: number; // letters matching regex
  totalDistinctChars: number; // count of distinct non-whitespace chars
  totalDistinctLetters: number; // count of distinct regex letters

  // 1. Consonants
  totalConsonants: number;
  consonantFrequency: number; // percentage related to totalLetters

  // 2. Vowels
  totalVowels: number;
  vowelFrequency: number; // percentage related to totalLetters

  // 3. Characters not appearing from the alphabet
  alphabetType: string; // e.g. "ro", "en", "de", "fr", "it", "nl", "ru", "es"
  alphabetName: string; // e.g. "Lb. română", "Lb. germană", "Lb. rusă (Chirilic)"
  alphabetTotalLetters: number;
  missingLettersCount: number;
  missingLetters: string[];

  // 4. Most and least frequent letters
  mostFrequentLetter: CharacterFrequency | null;
  leastFrequentLetter: CharacterFrequency | null;

  letterFrequencies: CharacterFrequency[]; // sorted by count desc
  allCharFrequencies: CharacterFrequency[]; // sorted by count desc

  // 5. Advanced Security & Statistical Metrics
  shannonEntropy: number; // in bits/character
  indexOfCoincidence: number; // Friedman Index of Coincidence (IoC)
  invisibleCharsCount: number;
  hasInvisibleChars: boolean;
  invisibleCharsDetails: InvisibleCharDetail[];
  totalWords: number;
  totalSentences: number;
  uniqueWordsCount: number;
  typeTokenRatio: number; // percentage (uniqueWords / totalWords * 100)
  averageWordLength: number; // average letters per word
  topWords: WordFrequency[];
  cosineSimilarityWithStandard: number; // percentage 0 - 100%
}

export const INVISIBLE_CHARS_PATTERNS: { regex: RegExp; name: string; code: string }[] = [
  { regex: /\u200B/g, name: "Zero-Width Space", code: "U+200B" },
  { regex: /\u200C/g, name: "Zero-Width Non-Joiner", code: "U+200C" },
  { regex: /\u200D/g, name: "Zero-Width Joiner", code: "U+200D" },
  { regex: /\u2060/g, name: "Word Joiner", code: "U+2060" },
  { regex: /\uFEFF/g, name: "Zero-Width No-Break Space / BOM", code: "U+FEFF" },
  { regex: /\u00AD/g, name: "Soft Hyphen", code: "U+00AD" },
  { regex: /\u200E/g, name: "Left-to-Right Mark", code: "U+200E" },
  { regex: /\u200F/g, name: "Right-to-Left Mark", code: "U+200F" },
  { regex: /[\u202A-\u202E]/g, name: "Directional Embed/Override", code: "U+202A-202E" },
  { regex: /[\u2066-\u2069]/g, name: "Directional Isolate", code: "U+2066-2069" },
];

export function computeShannonEntropy(
  charMap: Map<string, number>,
  totalCount: number
): number {
  if (totalCount <= 0) return 0;
  let entropy = 0;
  for (const count of charMap.values()) {
    if (count > 0) {
      const p = count / totalCount;
      entropy -= p * Math.log2(p);
    }
  }
  return Number(entropy.toFixed(3));
}

export function detectInvisibleCharacters(rawText: string): {
  count: number;
  hasInvisible: boolean;
  details: InvisibleCharDetail[];
} {
  const details: InvisibleCharDetail[] = [];
  let count = 0;

  for (const pattern of INVISIBLE_CHARS_PATTERNS) {
    const matches = rawText.match(pattern.regex);
    const patternCount = matches ? matches.length : 0;
    if (patternCount > 0) {
      count += patternCount;
      details.push({
        name: pattern.name,
        code: pattern.code,
        count: patternCount,
      });
    }
  }

  return {
    count,
    hasInvisible: count > 0,
    details,
  };
}

export function computeIndexOfCoincidence(
  letterFrequencies: CharacterFrequency[],
  totalLetters: number
): number {
  if (totalLetters <= 1) return 0;
  let sumProd = 0;
  for (const item of letterFrequencies) {
    if (item.count > 1) {
      sumProd += item.count * (item.count - 1);
    }
  }
  const denominator = totalLetters * (totalLetters - 1);
  return Number((sumProd / denominator).toFixed(4));
}

export function countWordsAndSentences(rawText: string): {
  totalWords: number;
  totalSentences: number;
  uniqueWordsCount: number;
  typeTokenRatio: number;
  averageWordLength: number;
  topWords: WordFrequency[];
} {
  const words = rawText.toLowerCase().match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) || [];
  const totalWords = words.length;

  const sentenceChunks = rawText
    .split(/[.!?…]+(?:\s+|$)/u)
    .filter((s) => s.trim().length > 0);
  const totalSentences =
    sentenceChunks.length > 0 ? sentenceChunks.length : totalWords > 0 ? 1 : 0;

  const wordMap = new Map<string, number>();
  let totalLettersInWords = 0;
  for (const w of words) {
    wordMap.set(w, (wordMap.get(w) || 0) + 1);
    totalLettersInWords += w.replace(/[^\p{L}\p{N}]/gu, "").length || w.length;
  }

  const uniqueWordsCount = wordMap.size;
  const typeTokenRatio =
    totalWords > 0 ? Number(((uniqueWordsCount / totalWords) * 100).toFixed(2)) : 0;
  const averageWordLength =
    totalWords > 0 ? Number((totalLettersInWords / totalWords).toFixed(2)) : 0;

  const sortedWords = Array.from(wordMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topWords: WordFrequency[] = sortedWords.map(([word, count]) => ({
    word,
    count,
    relativeFrequency: totalWords > 0 ? Number(((count / totalWords) * 100).toFixed(2)) : 0,
  }));

  return {
    totalWords,
    totalSentences,
    uniqueWordsCount,
    typeTokenRatio,
    averageWordLength,
    topWords,
  };
}

export function computeCosineSimilarity(
  vec1: Record<string, number> | Map<string, number>,
  vec2: Record<string, number> | Map<string, number>
): number {
  const getVal = (
    v: Record<string, number> | Map<string, number>,
    key: string
  ): number => {
    if (v instanceof Map) {
      return v.get(key) || 0;
    }
    return v[key] || 0;
  };

  const keys = new Set<string>();
  if (vec1 instanceof Map) {
    for (const k of vec1.keys()) keys.add(k);
  } else {
    for (const k of Object.keys(vec1)) keys.add(k);
  }

  if (vec2 instanceof Map) {
    for (const k of vec2.keys()) keys.add(k);
  } else {
    for (const k of Object.keys(vec2)) keys.add(k);
  }

  let dotProduct = 0;
  let norm1Sq = 0;
  let norm2Sq = 0;

  for (const k of keys) {
    const val1 = getVal(vec1, k);
    const val2 = getVal(vec2, k);
    dotProduct += val1 * val2;
    norm1Sq += val1 * val1;
    norm2Sq += val2 * val2;
  }

  const normProduct = Math.sqrt(norm1Sq) * Math.sqrt(norm2Sq);
  if (normProduct === 0) return 0;

  const sim = (dotProduct / normProduct) * 100;
  return Number(Math.min(100, Math.max(0, sim)).toFixed(2));
}

export function countLetters(text: string): number {
  const lower = text.toLowerCase();
  const noWhitespace = lower.replace(/\s+/g, "");
  const charMap = new Map<string, number>();
  let unicodeLetters = 0;
  for (const ch of noWhitespace) {
    charMap.set(ch, (charMap.get(ch) || 0) + 1);
    if (/^\p{L}$/u.test(ch)) {
      unicodeLetters++;
    }
  }
  const detectedLang = detectLanguage(charMap, unicodeLetters);
  const matches = lower.match(detectedLang.letterRegex);
  return matches ? matches.length : 0;
}

export function analyzeDocumentText(
  fileName: string,
  fileSize: number,
  rawText: string
): DocumentAnalysis {
  // Case-insensitive: make everything lowercase
  const lower = rawText.toLowerCase();

  // Characters without spaces, tabs, newlines, etc.
  const noWhitespace = lower.replace(/\s+/g, "");
  const totalCharsNoSpaces = noWhitespace.length;

  // Count every distinct character and total Unicode letters
  const charMap = new Map<string, number>();
  let unicodeLetters = 0;
  for (const ch of noWhitespace) {
    charMap.set(ch, (charMap.get(ch) || 0) + 1);
    if (/^\p{L}$/u.test(ch)) {
      unicodeLetters++;
    }
  }

  // 1. Dynamically detect language and alphabet
  const detectedLang: LanguageProfile = detectLanguage(charMap, unicodeLetters);
  const alphabetType = detectedLang.code;
  const alphabetName = detectedLang.name;
  const targetAlphabet = detectedLang.alphabet;
  const alphabetTotalLetters = detectedLang.alphabetLength;

  // 2. Count total letters, vowels, and consonants strictly conforming to detected language's regex
  let totalLetters = 0;
  let totalVowels = 0;
  let totalConsonants = 0;

  for (const [ch, count] of charMap.entries()) {
    if (detectedLang.singleLetterRegex.test(ch)) {
      totalLetters += count;
      if (detectedLang.vowels.has(ch)) {
        totalVowels += count;
      } else {
        totalConsonants += count;
      }
    }
  }

  // Fallback to avoid division by zero if totalLetters is 0
  const safeTotalLetters = totalLetters > 0 ? totalLetters : 1;

  const vowelFrequency = (totalVowels / safeTotalLetters) * 100;
  const consonantFrequency = (totalConsonants / safeTotalLetters) * 100;

  // 3. Check which characters from the target alphabet do NOT appear
  const missingLetters: string[] = [];
  for (const letter of targetAlphabet) {
    let presentCount = charMap.get(letter) || 0;
    if (detectedLang.code === "ro") {
      if (letter === "ș") {
        presentCount += charMap.get("ş") || 0;
      } else if (letter === "ț") {
        presentCount += charMap.get("ţ") || 0;
      }
    } else if (detectedLang.code === "el") {
      if (letter === "σ") {
        presentCount += charMap.get("ς") || 0;
      } else if (letter === "α") {
        presentCount += charMap.get("ά") || 0;
      } else if (letter === "ε") {
        presentCount += charMap.get("έ") || 0;
      } else if (letter === "η") {
        presentCount += charMap.get("ή") || 0;
      } else if (letter === "ι") {
        presentCount +=
          (charMap.get("ί") || 0) +
          (charMap.get("ϊ") || 0) +
          (charMap.get("ΐ") || 0);
      } else if (letter === "ο") {
        presentCount += charMap.get("ό") || 0;
      } else if (letter === "υ") {
        presentCount +=
          (charMap.get("ύ") || 0) +
          (charMap.get("ϋ") || 0) +
          (charMap.get("ΰ") || 0);
      } else if (letter === "ω") {
        presentCount += charMap.get("ώ") || 0;
      }
    } else if (detectedLang.code === "it") {
      if (letter === "a") {
        presentCount += charMap.get("à") || 0;
      } else if (letter === "e") {
        presentCount += (charMap.get("è") || 0) + (charMap.get("é") || 0);
      } else if (letter === "i") {
        presentCount +=
          (charMap.get("ì") || 0) +
          (charMap.get("í") || 0) +
          (charMap.get("î") || 0);
      } else if (letter === "o") {
        presentCount += (charMap.get("ò") || 0) + (charMap.get("ó") || 0);
      } else if (letter === "u") {
        presentCount += (charMap.get("ù") || 0) + (charMap.get("ú") || 0);
      }
    } else if (detectedLang.code === "sv") {
      if (letter === "e") {
        presentCount += charMap.get("é") || 0;
      }
    } else if (detectedLang.code === "he") {
      if (letter === "כ") {
        presentCount += charMap.get("ך") || 0;
      } else if (letter === "מ") {
        presentCount += charMap.get("ם") || 0;
      } else if (letter === "נ") {
        presentCount += charMap.get("ן") || 0;
      } else if (letter === "פ") {
        presentCount += charMap.get("ף") || 0;
      } else if (letter === "צ") {
        presentCount += charMap.get("ץ") || 0;
      }
    } else if (detectedLang.code === "ar") {
      if (letter === "ا") {
        presentCount +=
          (charMap.get("أ") || 0) +
          (charMap.get("إ") || 0) +
          (charMap.get("آ") || 0) +
          (charMap.get("ى") || 0) +
          (charMap.get("ٱ") || 0);
      } else if (letter === "ه") {
        presentCount += charMap.get("ة") || 0;
      } else if (letter === "و") {
        presentCount += charMap.get("ؤ") || 0;
      } else if (letter === "ي") {
        presentCount += charMap.get("ئ") || 0;
      }
    } else if (detectedLang.code === "tr") {
      if (letter === "i") {
        presentCount += charMap.get("İ") || 0;
      }
    }

    if (presentCount === 0) {
      missingLetters.push(letter);
    }
  }

  const missingLettersCount = missingLetters.length;

  // 4. Build frequency lists (filtering letters strictly conforming to detectedLang.singleLetterRegex)
  const allCharFrequencies: CharacterFrequency[] = [];
  const letterFrequencies: CharacterFrequency[] = [];

  for (const [ch, count] of charMap.entries()) {
    const isLetter = detectedLang.singleLetterRegex.test(ch);
    const isVowel = isLetter ? detectedLang.vowels.has(ch) : false;
    const relativeFrequency = (count / safeTotalLetters) * 100;

    const item: CharacterFrequency = {
      char: ch,
      count,
      relativeFrequency,
      isLetter,
      isVowel,
    };

    allCharFrequencies.push(item);
    if (isLetter) {
      letterFrequencies.push(item);
    }
  }

  // Sort frequencies descending
  letterFrequencies.sort((a, b) => b.count - a.count);
  allCharFrequencies.sort((a, b) => b.count - a.count);

  const mostFrequentLetter =
    letterFrequencies.length > 0 ? letterFrequencies[0] : null;
  const leastFrequentLetter =
    letterFrequencies.length > 0
      ? letterFrequencies[letterFrequencies.length - 1]
      : null;

  // 5. Compute Advanced Security & Statistical Metrics
  const shannonEntropy = computeShannonEntropy(charMap, totalCharsNoSpaces);
  const indexOfCoincidence = computeIndexOfCoincidence(
    letterFrequencies,
    totalLetters
  );
  const {
    count: invisibleCharsCount,
    hasInvisible: hasInvisibleChars,
    details: invisibleCharsDetails,
  } = detectInvisibleCharacters(rawText);

  const {
    totalWords,
    totalSentences,
    uniqueWordsCount,
    typeTokenRatio,
    averageWordLength,
    topWords,
  } = countWordsAndSentences(rawText);

  const observedLetterMap: Record<string, number> = {};
  for (const item of letterFrequencies) {
    observedLetterMap[item.char] = item.relativeFrequency;
  }
  const cosineSimilarityWithStandard = computeCosineSimilarity(
    observedLetterMap,
    detectedLang.standardFreq
  );

  return {
    fileName,
    fileSize,
    totalCharsNoSpaces,
    totalLetters,
    totalDistinctChars: charMap.size,
    totalDistinctLetters: letterFrequencies.length,
    totalConsonants,
    consonantFrequency,
    totalVowels,
    vowelFrequency,
    alphabetType,
    alphabetName,
    alphabetTotalLetters,
    missingLettersCount,
    missingLetters,
    mostFrequentLetter,
    leastFrequentLetter,
    letterFrequencies,
    allCharFrequencies,
    shannonEntropy,
    indexOfCoincidence,
    invisibleCharsCount,
    hasInvisibleChars,
    invisibleCharsDetails,
    totalWords,
    totalSentences,
    uniqueWordsCount,
    typeTokenRatio,
    averageWordLength,
    topWords,
    cosineSimilarityWithStandard,
  };
}

export async function parseFileText(file: File): Promise<string> {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

  if (ext === ".txt" || ext === ".md") {
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = () => reject(new Error("Eroare la citirea fișierului text"));
      reader.readAsText(file);
    });
    if (text.trim().length === 0) {
      throw new Error("Fișierul text este gol.");
    }
    return text;
  }

  if (ext === ".docx") {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value || "";
    if (text.trim().length === 0) {
      throw new Error("Fișierul .docx nu conține text.");
    }
    return text;
  }

  if (ext === ".pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
    });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ");
      fullText += pageText + " ";
    }

    const trimmed = fullText.trim();
    if (pdf.numPages > 0 && trimmed.length === 0) {
      throw new Error(
        "Documentul este un PDF scanat (doar imagine, fără strat de text digital). Pentru a fi analizat, folosiți un fișier cu text selectabil sau procesat prin OCR."
      );
    }

    return fullText;
  }

  throw new Error(`Format necunoscut sau neacceptat: ${ext}`);
}
