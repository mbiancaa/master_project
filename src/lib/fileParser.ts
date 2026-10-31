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
  };
}

export async function parseFileText(file: File): Promise<string> {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

  if (ext === ".txt" || ext === ".md") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = () => reject(new Error("Eroare la citirea fișierului text"));
      reader.readAsText(file);
    });
  }

  if (ext === ".docx") {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || "";
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

    return fullText;
  }

  throw new Error(`Format necunoscut sau neacceptat: ${ext}`);
}
