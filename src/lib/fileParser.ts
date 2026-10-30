// Helper to extract text and compute character frequency analysis

export const MIN_LETTERS_REQUIRED = 50000;

// Romanian and English letters regex
// Standard diacritics (ă, â, î, ș, ț) and legacy cedilla variants (ş, ţ)
export const LETTERS_REGEX = /[a-zăâîșțşţ]/g;
export const SINGLE_LETTER_REGEX = /^[a-zăâîșțşţ]$/;

// Vowels in Romanian and English
export const VOWELS_SET = new Set(["a", "ă", "â", "e", "i", "î", "o", "u"]);
export const ROMANIAN_SPECIAL_SET = new Set(["ă", "â", "î", "ș", "ț", "ş", "ţ"]);

export const EN_ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
export const RO_ALPHABET = [
  "a", "ă", "â", "b", "c", "d", "e", "f", "g", "h", "i", "î", "j", "k", "l",
  "m", "n", "o", "p", "q", "r", "s", "ș", "t", "ț", "u", "v", "w", "x", "y", "z",
];

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
  alphabetType: "romanian" | "english";
  alphabetName: string;
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
  const matches = lower.match(LETTERS_REGEX);
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

  // Count every distinct character
  const charMap = new Map<string, number>();
  for (const ch of noWhitespace) {
    charMap.set(ch, (charMap.get(ch) || 0) + 1);
  }

  // Count total regex letters, vowels, and consonants
  let totalLetters = 0;
  let totalVowels = 0;
  let totalConsonants = 0;

  for (const [ch, count] of charMap.entries()) {
    if (SINGLE_LETTER_REGEX.test(ch)) {
      totalLetters += count;
      if (VOWELS_SET.has(ch)) {
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

  // Check if text has any Romanian-specific characters
  const hasRomanianSpecial = Array.from(charMap.keys()).some((ch) =>
    ROMANIAN_SPECIAL_SET.has(ch)
  );

  const alphabetType = hasRomanianSpecial
    ? ("romanian" as const)
    : ("english" as const);
  const alphabetName = hasRomanianSpecial
    ? "Lb. română"
    : "Lb. engleză";
  const targetAlphabet = hasRomanianSpecial ? RO_ALPHABET : EN_ALPHABET;
  const alphabetTotalLetters = targetAlphabet.length;

  // Check which characters from the target alphabet do NOT appear
  const missingLetters: string[] = [];
  for (const letter of targetAlphabet) {
    let presentCount = charMap.get(letter) || 0;
    if (letter === "ș") {
      presentCount += charMap.get("ş") || 0;
    } else if (letter === "ț") {
      presentCount += charMap.get("ţ") || 0;
    }

    if (presentCount === 0) {
      missingLetters.push(letter);
    }
  }

  const missingLettersCount = missingLetters.length;

  // Build full frequency list
  const allCharFrequencies: CharacterFrequency[] = [];
  const letterFrequencies: CharacterFrequency[] = [];

  for (const [ch, count] of charMap.entries()) {
    const isLetter = SINGLE_LETTER_REGEX.test(ch);
    const isVowel = isLetter ? VOWELS_SET.has(ch) : false;
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
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ");
      fullText += pageText + " ";
    }

    return fullText;
  }

  throw new Error(`Format necunoscut sau neacceptat: ${ext}`);
}
