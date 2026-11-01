export interface LanguageProfile {
  code: string;
  name: string;
  alphabet: string[];
  alphabetLength: number;
  specificChars: string;
  description: string;
  letterRegex: RegExp;
  singleLetterRegex: RegExp;
  vowels: Set<string>;
  specialMarkers: Set<string>;
  standardFreq: Record<string, number>;
}

// 1. ROMÂNĂ (31 litere)
export const RO_ALPHABET = [
  "a", "ă", "â", "b", "c", "d", "e", "f", "g", "h", "i", "î", "j", "k", "l",
  "m", "n", "o", "p", "q", "r", "s", "ș", "t", "ț", "u", "v", "w", "x", "y", "z",
];
const RO_VOWELS = new Set(["a", "ă", "â", "e", "i", "î", "o", "u"]);
const RO_SPECIAL = new Set(["ă", "â", "î", "ș", "ț", "ş", "ţ"]);
const RO_FREQ: Record<string, number> = {
  a: 8.5, ă: 2.8, â: 1.2, b: 1.4, c: 4.1, d: 3.3, e: 12.2, f: 1.2, g: 1.3,
  h: 1.1, i: 9.8, î: 1.0, j: 0.3, k: 0.1, l: 4.8, m: 2.9, n: 5.4, o: 3.9,
  p: 3.1, q: 0.05, r: 6.5, s: 3.8, ș: 2.1, t: 5.8, ț: 1.5, u: 5.2, v: 1.3,
  w: 0.1, x: 0.1, y: 0.1, z: 0.6,
};

// 2. ENGLEZĂ (26 litere)
export const EN_ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const EN_VOWELS = new Set(["a", "e", "i", "o", "u"]);
const EN_SPECIAL = new Set<string>();
const EN_FREQ: Record<string, number> = {
  a: 8.2, b: 1.5, c: 2.8, d: 4.3, e: 12.7, f: 2.2, g: 2.0, h: 6.1, i: 7.0,
  j: 0.15, k: 0.8, l: 4.0, m: 2.4, n: 6.7, o: 7.5, p: 1.9, q: 0.1, r: 6.0,
  s: 6.3, t: 9.1, u: 2.8, v: 1.0, w: 2.4, x: 0.15, y: 2.0, z: 0.07,
};

// 3. GERMANĂ (30 caractere: a-z + ä, ö, ü, ß)
export const DE_ALPHABET = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
  "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "ä", "ö", "ü", "ß",
];
const DE_VOWELS = new Set(["a", "e", "i", "o", "u", "ä", "ö", "ü"]);
const DE_SPECIAL = new Set(["ä", "ö", "ü", "ß"]);
const DE_FREQ: Record<string, number> = {
  a: 6.5, b: 1.9, c: 3.1, d: 5.1, e: 16.4, f: 1.7, g: 3.0, h: 4.6, i: 7.6,
  j: 0.3, k: 1.2, l: 3.4, m: 2.5, n: 9.8, o: 2.5, p: 0.8, q: 0.02, r: 7.0,
  s: 7.3, t: 6.1, u: 4.4, v: 0.7, w: 1.9, x: 0.03, y: 0.04, z: 1.1,
  ä: 0.5, ö: 0.4, ü: 0.7, ß: 0.3,
};

// 4. FRANCEZĂ (42 de caractere/semne: 26 de bază + 14 diacritice + 2 ligaturi)
export const FR_ALPHABET = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
  "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "à", "â", "ç", "é", "è", "ê", "ë", "î", "ï", "ô", "ù", "û", "ü", "ÿ",
  "œ", "æ",
];
const FR_VOWELS = new Set([
  "a", "e", "i", "o", "u", "y", "à", "â", "é", "è", "ê", "ë", "î", "ï", "ô",
  "ù", "û", "ü", "ÿ", "œ", "æ",
]);
const FR_SPECIAL = new Set(["ç", "œ", "æ", "è", "é", "ê", "ë", "à", "â", "î", "ï", "ô", "ù", "û", "ü", "ÿ"]);
const FR_FREQ: Record<string, number> = {
  a: 7.6, b: 0.9, c: 3.3, d: 3.7, e: 14.7, f: 1.1, g: 0.9, h: 0.7, i: 7.5,
  j: 0.6, k: 0.1, l: 5.5, m: 3.0, n: 7.1, o: 5.8, p: 2.5, q: 1.4, r: 6.7,
  s: 7.9, t: 7.2, u: 6.3, v: 1.8, w: 0.1, x: 0.4, y: 0.3, z: 0.3,
  é: 1.9, è: 0.3, ê: 0.2, à: 0.5, ç: 0.1,
};

// 5. ITALIANĂ (21 de litere standard de bază + 5 de origine străină: j, k, w, x, y = 26 de litere)
export const IT_ALPHABET = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
  "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
];
const IT_VOWELS = new Set(["a", "e", "i", "o", "u", "à", "è", "é", "ì", "í", "î", "ò", "ó", "ù", "ú"]);
const IT_SPECIAL = new Set(["à", "è", "é", "ì", "í", "î", "ò", "ó", "ù", "ú"]);
const IT_FREQ: Record<string, number> = {
  a: 11.7, b: 0.9, c: 4.5, d: 3.7, e: 11.8, f: 1.2, g: 1.6, h: 0.6, i: 11.3,
  j: 0.01, k: 0.01, l: 6.5, m: 2.5, n: 6.9, o: 9.8, p: 3.1, q: 0.5, r: 6.4,
  s: 5.0, t: 5.6, u: 3.0, v: 2.1, w: 0.01, x: 0.01, y: 0.01, z: 1.2,
};

// 6. OLANDEZĂ (26 litere)
export const NL_ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const NL_VOWELS = new Set(["a", "e", "i", "o", "u", "y", "ĳ", "ë", "é"]);
const NL_SPECIAL = new Set(["ĳ"]);
const NL_FREQ: Record<string, number> = {
  a: 7.5, b: 1.6, c: 1.2, d: 5.9, e: 18.9, f: 0.8, g: 3.4, h: 2.4, i: 6.5,
  j: 1.5, k: 2.8, l: 3.6, m: 2.2, n: 10.0, o: 6.1, p: 1.6, q: 0.01, r: 6.4,
  s: 3.7, t: 6.8, u: 2.0, v: 2.9, w: 1.5, x: 0.04, y: 0.04, z: 1.4,
};

// 7. RUSĂ (Chirilic - 33 litere)
export const RU_ALPHABET = [
  "а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н",
  "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь",
  "э", "ю", "я",
];
const RU_VOWELS = new Set(["а", "е", "ё", "и", "о", "у", "ы", "э", "ю", "я"]);
const RU_SPECIAL = new Set(RU_ALPHABET);
const RU_FREQ: Record<string, number> = {
  о: 10.97, е: 8.45, а: 8.01, и: 7.35, н: 6.70, т: 6.26, с: 5.47, р: 4.73,
  в: 4.54, л: 4.40, к: 3.49, m: 3.21, д: 2.98, п: 2.81, у: 2.62, я: 2.01,
  ы: 1.90, ь: 1.74, г: 1.70, з: 1.65, б: 1.59, ч: 1.44, й: 1.21, х: 0.97,
  ж: 0.94, ш: 0.73, ю: 0.64, ц: 0.48, щ: 0.36, э: 0.32, ф: 0.26, ъ: 0.04,
  ё: 0.04,
};

// 8. SPANIOLĂ (27 litere)
export const ES_ALPHABET = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "ñ",
  "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
];
const ES_VOWELS = new Set(["a", "e", "i", "o", "u", "á", "é", "í", "ó", "ú", "ü"]);
const ES_SPECIAL = new Set(["ñ", "á", "é", "í", "ó", "ú", "ü"]);
const ES_FREQ: Record<string, number> = {
  a: 12.5, b: 1.4, c: 4.7, d: 5.9, e: 13.7, f: 0.7, g: 1.0, h: 0.7, i: 6.2,
  j: 0.4, k: 0.01, l: 5.0, m: 3.1, n: 6.7, o: 8.7, p: 2.5, q: 0.9, r: 6.9,
  s: 8.0, t: 4.6, u: 3.9, v: 0.9, w: 0.01, x: 0.2, y: 0.9, z: 0.5,
  ñ: 0.3,
};

// 9. GREACĂ (24 de litere: Alfa - Omega)
export const EL_ALPHABET = [
  "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ο",
  "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω",
];
const EL_VOWELS = new Set([
  "α", "ε", "η", "ι", "ο", "υ", "ω",
  "ά", "έ", "ή", "ί", "ό", "ύ", "ώ", "ϊ", "ϋ", "ΐ", "ΰ",
]);
const EL_SPECIAL = new Set(EL_ALPHABET);
const EL_FREQ: Record<string, number> = {
  α: 12.0, ε: 8.9, ο: 8.8, ι: 8.5, τ: 7.7, ν: 6.8, σ: 6.8, ρ: 4.7,
  π: 4.0, κ: 3.8, υ: 3.8, η: 3.5, μ: 3.2, λ: 2.8, δ: 1.9, ω: 1.8,
  γ: 1.7, θ: 1.3, χ: 1.2, β: 0.9, ζ: 0.5, φ: 0.5, ξ: 0.5, ψ: 0.2,
};

// 10. SUEDEZĂ (29 de litere: a-z + å, ä, ö)
export const SV_ALPHABET = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
  "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "å", "ä", "ö",
];
const SV_VOWELS = new Set(["a", "e", "i", "o", "u", "y", "å", "ä", "ö", "é"]);
const SV_SPECIAL = new Set(["å", "ä", "ö"]);
const SV_FREQ: Record<string, number> = {
  a: 9.38, b: 1.25, c: 1.49, d: 4.70, e: 10.15, f: 1.97, g: 2.86, h: 2.09,
  i: 5.82, j: 0.61, k: 3.14, l: 5.28, m: 3.47, n: 8.54, o: 4.48, p: 1.25,
  q: 0.02, r: 8.43, s: 6.59, t: 8.44, u: 1.92, v: 2.42, w: 0.14, x: 0.16,
  y: 0.71, z: 0.07, å: 1.34, ä: 1.80, ö: 1.31,
};

// 11. POLONEZĂ (32 de litere)
export const PL_ALPHABET = [
  "a", "ą", "b", "c", "ć", "d", "e", "ę", "f", "g", "h", "i", "j", "k", "l",
  "ł", "m", "n", "ń", "o", "ó", "p", "r", "s", "ś", "t", "u", "w", "y", "z",
  "ź", "ż",
];
const PL_VOWELS = new Set(["a", "ą", "e", "ę", "i", "o", "ó", "u", "y"]);
const PL_SPECIAL = new Set(["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"]);
const PL_FREQ: Record<string, number> = {
  a: 8.91, i: 8.21, o: 7.75, e: 7.66, z: 5.64, n: 5.52, r: 4.69, w: 4.65,
  s: 4.32, t: 3.98, c: 3.96, y: 3.76, k: 3.51, d: 3.25, p: 3.13, m: 2.80,
  u: 2.50, j: 2.28, l: 2.10, ł: 1.82, b: 1.47, g: 1.42, ę: 1.11, h: 1.08,
  ą: 0.99, ó: 0.85, ż: 0.83, ś: 0.66, ć: 0.40, f: 0.30, ń: 0.20, ź: 0.06,
};

// 12. TURCĂ (29 de litere)
export const TR_ALPHABET = [
  "a", "b", "c", "ç", "d", "e", "f", "g", "ğ", "h", "ı", "i", "j", "k", "l",
  "m", "n", "o", "ö", "p", "r", "s", "ş", "t", "u", "ü", "v", "y", "z",
];
const TR_VOWELS = new Set(["a", "e", "ı", "i", "o", "ö", "u", "ü"]);
const TR_SPECIAL = new Set(["ç", "ğ", "ı", "ö", "ş", "ü", "İ"]);
const TR_FREQ: Record<string, number> = {
  a: 11.92, e: 8.91, i: 8.67, n: 7.48, r: 6.72, l: 5.92, ı: 5.11, d: 4.74,
  k: 4.68, m: 3.75, y: 3.33, t: 3.31, u: 3.23, s: 3.01, b: 2.84, o: 2.47,
  ü: 1.85, ş: 1.78, z: 1.50, ç: 1.26, g: 1.25, h: 1.21, ğ: 1.13, v: 0.98,
  c: 0.96, p: 0.88, ö: 0.77, f: 0.46, j: 0.05,
};

// 13. EBRAICĂ (22 de litere consonatice: Alef - Tav)
export const HE_ALPHABET = [
  "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס",
  "ע", "פ", "צ", "ק", "ר", "ש", "ת",
];
const HE_VOWELS = new Set(["א", "ה", "ו", "י"]); // Matres lectionis (folosite și cu valoare vocalică)
const HE_SPECIAL = new Set([...HE_ALPHABET, "ך", "ם", "ן", "ף", "ץ"]);
const HE_FREQ: Record<string, number> = {
  י: 11.5, ו: 10.2, ה: 8.5, ל: 7.4, מ: 6.3, ת: 5.6, ב: 5.1, ר: 4.8, א: 4.5,
  ש: 4.2, ע: 3.5, נ: 3.4, d: 3.0, כ: 2.8, ק: 2.2, פ: 1.9, ח: 1.8, ס: 1.5,
  צ: 1.3, ט: 1.1, ז: 0.9, ג: 0.8,
};

// 14. ARABĂ (28 de litere: Alif - Ya)
export const AR_ALPHABET = [
  "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض",
  "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",
];
const AR_VOWELS = new Set(["ا", "و", "ي", "أ", "إ", "آ", "ى", "ؤ", "ئ"]);
const AR_SPECIAL = new Set([...AR_ALPHABET, "أ", "إ", "آ", "ة", "ى", "ء", "ئ", "ؤ"]);
const AR_FREQ: Record<string, number> = {
  ا: 12.5, ل: 10.8, م: 7.2, ي: 6.9, ו: 6.2, ن: 5.9, ر: 5.3, ب: 4.8, ت: 4.5,
  ه: 3.6, ع: 3.4, د: 3.2, س: 2.8, ف: 2.7, ك: 2.4, ق: 2.3, ح: 2.1, ج: 1.8,
  ص: 1.6, ش: 1.4, ض: 1.1, ط: 1.0, خ: 0.9, ذ: 0.8, ث: 0.7, ز: 0.6, ظ: 0.3,
  غ: 0.3,
};

export const SUPPORTED_LANGUAGES: LanguageProfile[] = [
  {
    code: "ro",
    name: "Lb. română",
    alphabet: RO_ALPHABET,
    alphabetLength: 31,
    specificChars: "ă, â, î, ș, ț",
    description: "Alfabetul latin standard completat cu 5 litere cu semne diacritice.",
    letterRegex: /[a-zăâîșțşţ]/gi,
    singleLetterRegex: /^[a-zăâîșțşţ]$/i,
    vowels: RO_VOWELS,
    specialMarkers: RO_SPECIAL,
    standardFreq: RO_FREQ,
  },
  {
    code: "en",
    name: "Lb. engleză",
    alphabet: EN_ALPHABET,
    alphabetLength: 26,
    specificChars: "a – z",
    description: "Alfabetul latin modern clasic de 26 de litere, fără diacritice.",
    letterRegex: /[a-z]/gi,
    singleLetterRegex: /^[a-z]$/i,
    vowels: EN_VOWELS,
    specialMarkers: EN_SPECIAL,
    standardFreq: EN_FREQ,
  },
  {
    code: "de",
    name: "Lb. germană",
    alphabet: DE_ALPHABET,
    alphabetLength: 30,
    specificChars: "ä, ö, ü, ß",
    description: "Literele de bază a–z, la care se adaugă cele 3 Umlaut-uri și ligatura Eszett.",
    letterRegex: /[a-zäöüß]/gi,
    singleLetterRegex: /^[a-zäöüß]$/i,
    vowels: DE_VOWELS,
    specialMarkers: DE_SPECIAL,
    standardFreq: DE_FREQ,
  },
  {
    code: "fr",
    name: "Lb. franceză",
    alphabet: FR_ALPHABET,
    alphabetLength: 42,
    specificChars: "à, â, ç, é, è, ê, ë, î, ï, ô, ù, û, ü, ÿ, œ, æ",
    description: "26 de litere standard, 14 litere cu accente și 2 ligaturi (œ, æ).",
    letterRegex: /[a-zàâçéèêëîïôùûüÿœæ]/gi,
    singleLetterRegex: /^[a-zàâçéèêëîïôùûüÿœæ]$/i,
    vowels: FR_VOWELS,
    specialMarkers: FR_SPECIAL,
    standardFreq: FR_FREQ,
  },
  {
    code: "it",
    name: "Lb. italiană",
    alphabet: IT_ALPHABET,
    alphabetLength: 26,
    specificChars: "a – z (21 de bază + j, k, w, x, y)",
    description: "21 de litere tradiționale italiene + 5 litere pentru neologisme și împrumuturi.",
    letterRegex: /[a-zàèéìíîòóùú]/gi,
    singleLetterRegex: /^[a-zàèéìíîòóùú]$/i,
    vowels: IT_VOWELS,
    specialMarkers: IT_SPECIAL,
    standardFreq: IT_FREQ,
  },
  {
    code: "nl",
    name: "Lb. olandeză",
    alphabet: NL_ALPHABET,
    alphabetLength: 26,
    specificChars: "a – z, ĳ",
    description: "Alfabetul latin clasic, recunoaștere pentru digraful olandez ij și vocale cu tremă.",
    letterRegex: /[a-z]/gi,
    singleLetterRegex: /^[a-z]$/i,
    vowels: NL_VOWELS,
    specialMarkers: NL_SPECIAL,
    standardFreq: NL_FREQ,
  },
  {
    code: "ru",
    name: "Lb. rusă (Chirilic)",
    alphabet: RU_ALPHABET,
    alphabetLength: 33,
    specificChars: "а, б, в, г ... э, ю, я",
    description: "33 de litere chirilice, incluzând litera ё, semnul tare (ъ) și semnul moale (ь).",
    letterRegex: /[а-яё]/gi,
    singleLetterRegex: /^[а-яё]$/i,
    vowels: RU_VOWELS,
    specialMarkers: RU_SPECIAL,
    standardFreq: RU_FREQ,
  },
  {
    code: "el",
    name: "Lb. greacă",
    alphabet: EL_ALPHABET,
    alphabetLength: 24,
    specificChars: "α, β, γ, δ ... ψ, ω, ς",
    description: "24 de litere de la Alfa (α) la Omega (ω), sigma final (ς) și accente tonos.",
    letterRegex: /[α-ωάέήίόύώϊϋΐΰς]/gi,
    singleLetterRegex: /^[α-ωάέήίόύώϊϋΐΰς]$/i,
    vowels: EL_VOWELS,
    specialMarkers: EL_SPECIAL,
    standardFreq: EL_FREQ,
  },
  {
    code: "es",
    name: "Lb. spaniolă",
    alphabet: ES_ALPHABET,
    alphabetLength: 27,
    specificChars: "ñ, á, é, í, ó, ú",
    description: "Alfabetul latin completat cu litera distinctă eñe (ñ) și vocalele cu accent ascuțit.",
    letterRegex: /[a-zñáéíóúü]/gi,
    singleLetterRegex: /^[a-zñáéíóúü]$/i,
    vowels: ES_VOWELS,
    specialMarkers: ES_SPECIAL,
    standardFreq: ES_FREQ,
  },
  {
    code: "sv",
    name: "Lb. suedeză",
    alphabet: SV_ALPHABET,
    alphabetLength: 29,
    specificChars: "å, ä, ö",
    description: "Alfabetul latin standard urmat de cele 3 litere scandinave specifice la final.",
    letterRegex: /[a-zåäöé]/gi,
    singleLetterRegex: /^[a-zåäöé]$/i,
    vowels: SV_VOWELS,
    specialMarkers: SV_SPECIAL,
    standardFreq: SV_FREQ,
  },
  {
    code: "pl",
    name: "Lb. poloneză",
    alphabet: PL_ALPHABET,
    alphabetLength: 32,
    specificChars: "ą, ć, ę, ł, ń, ó, ś, ź, ż",
    description: "32 de litere (fără q, v, x în alfabetul standard), cu 9 litere specifice poloneze.",
    letterRegex: /[a-ząćęłńóśźż]/gi,
    singleLetterRegex: /^[a-ząćęłńóśźż]$/i,
    vowels: PL_VOWELS,
    specialMarkers: PL_SPECIAL,
    standardFreq: PL_FREQ,
  },
  {
    code: "tr",
    name: "Lb. turcă",
    alphabet: TR_ALPHABET,
    alphabetLength: 29,
    specificChars: "ç, ğ, ı, ö, ş, ü, İ",
    description: "29 de litere (fără q, w, x), conținând litere specifice și distincția strictă ı vs i.",
    letterRegex: /[a-zçğışöüİ]/gi,
    singleLetterRegex: /^[a-zçğışöüİ]$/i,
    vowels: TR_VOWELS,
    specialMarkers: TR_SPECIAL,
    standardFreq: TR_FREQ,
  },
  {
    code: "he",
    name: "Lb. ebraică",
    alphabet: HE_ALPHABET,
    alphabetLength: 22,
    specificChars: "א, ב, ג, ד ... ש, ת (+ ך, ם, ן, ף, ץ)",
    description: "22 de litere consonatice de la Alef (א) la Tav (ת), agregând cele 5 forme finale (sofit).",
    letterRegex: /[\p{Script=Hebrew}]/gu,
    singleLetterRegex: /^[\p{Script=Hebrew}]$/u,
    vowels: HE_VOWELS,
    specialMarkers: HE_SPECIAL,
    standardFreq: HE_FREQ,
  },
  {
    code: "ar",
    name: "Lb. arabă",
    alphabet: AR_ALPHABET,
    alphabetLength: 28,
    specificChars: "ا, ب, ت, ث ... و, ي (+ أ, إ, آ, ة, ى, ئ, ؤ)",
    description: "28 de litere de bază de la Alif (ا) la Ya (ي), cu maparea formelor Hamza și Ta Marbuta.",
    letterRegex: /[\p{Script=Arabic}]/gu,
    singleLetterRegex: /^[\p{Script=Arabic}]$/u,
    vowels: AR_VOWELS,
    specialMarkers: AR_SPECIAL,
    standardFreq: AR_FREQ,
  },
];

/**
 * Calculates Cosine Similarity between observed text letter frequencies and a reference profile
 */
function computeCosineSimilarity(
  observedFreqs: Map<string, number>,
  standardFreq: Record<string, number>
): number {
  let dotProduct = 0;
  let normObservedSq = 0;
  let normRefSq = 0;

  for (const [char, refVal] of Object.entries(standardFreq)) {
    const obsVal = observedFreqs.get(char) || 0;
    dotProduct += obsVal * refVal;
    normRefSq += refVal * refVal;
  }

  for (const obsVal of observedFreqs.values()) {
    normObservedSq += obsVal * obsVal;
  }

  if (normObservedSq === 0 || normRefSq === 0) return 0;
  return dotProduct / (Math.sqrt(normObservedSq) * Math.sqrt(normRefSq));
}

/**
 * Dynamically detects language and alphabet from text content and character counts
 */
export function detectLanguage(
  charMap: Map<string, number>,
  totalLetters: number
): LanguageProfile {
  if (totalLetters === 0) {
    // Default fallback: English
    return SUPPORTED_LANGUAGES[1];
  }

  // 1. Script checks: Arabic, Hebrew, Greek, and Cyrillic
  let arabicCount = 0;
  let hebrewCount = 0;
  let greekCount = 0;
  let cyrillicCount = 0;
  let latinCount = 0;

  for (const [char, count] of charMap.entries()) {
    if (/^[\p{Script=Arabic}]$/u.test(char)) {
      arabicCount += count;
    } else if (/^[\p{Script=Hebrew}]$/u.test(char)) {
      hebrewCount += count;
    } else if (/^[\p{Script=Greek}]$/u.test(char)) {
      greekCount += count;
    } else if (/^[\p{Script=Cyrillic}]$/u.test(char)) {
      cyrillicCount += count;
    } else if (/^[\p{Script=Latin}]$/u.test(char)) {
      latinCount += count;
    }
  }

  if (arabicCount > latinCount && arabicCount > 10) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === "ar")!;
  }

  if (hebrewCount > latinCount && hebrewCount > 10) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === "he")!;
  }

  if (greekCount > latinCount && greekCount > 10) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === "el")!;
  }

  if (cyrillicCount > latinCount && cyrillicCount > 10) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === "ru")!;
  }

  // 2. Compute relative letter frequencies in %
  const observedFreqs = new Map<string, number>();
  for (const [char, count] of charMap.entries()) {
    observedFreqs.set(char, (count / totalLetters) * 100);
  }

  // 3. Diacritic / Characteristic Marker Densities
  // To avoid misclassifying English texts with isolated foreign names (e.g. "François", "Cărtărescu", "Schrödinger"),
  // markers must satisfy both an absolute threshold and a minimum percentage of the total letters.
  const minMarkerPercentage = totalLetters > 2000 ? 0.006 : 0.012; // 0.6% - 1.2%
  const minAbsoluteMarkers = totalLetters > 2000 ? 12 : 3;

  const roScore =
    (charMap.get("ă") || 0) +
    (charMap.get("â") || 0) +
    (charMap.get("î") || 0) +
    (charMap.get("ș") || 0) +
    (charMap.get("ț") || 0) +
    (charMap.get("ş") || 0) +
    (charMap.get("ţ") || 0);

  const deScore =
    (charMap.get("ä") || 0) +
    (charMap.get("ö") || 0) +
    (charMap.get("ü") || 0) +
    (charMap.get("ß") || 0);

  const esScore =
    (charMap.get("ñ") || 0) +
    (charMap.get("á") || 0) +
    (charMap.get("í") || 0) +
    (charMap.get("ó") || 0) +
    (charMap.get("ú") || 0);

  const frScore =
    (charMap.get("ç") || 0) +
    (charMap.get("œ") || 0) +
    (charMap.get("æ") || 0) +
    (charMap.get("é") || 0) +
    (charMap.get("è") || 0) +
    (charMap.get("ê") || 0) +
    (charMap.get("ë") || 0) +
    (charMap.get("ù") || 0) +
    (charMap.get("û") || 0);

  const svScore =
    (charMap.get("å") || 0) +
    (charMap.get("ä") || 0) +
    (charMap.get("ö") || 0);
  const aRingCount = charMap.get("å") || 0;

  const plScore =
    (charMap.get("ą") || 0) +
    (charMap.get("ć") || 0) +
    (charMap.get("ę") || 0) +
    (charMap.get("ł") || 0) +
    (charMap.get("ń") || 0) +
    (charMap.get("ś") || 0) +
    (charMap.get("ź") || 0) +
    (charMap.get("ż") || 0);

  const trScore =
    (charMap.get("ı") || 0) +
    (charMap.get("ğ") || 0) +
    (charMap.get("ş") || 0) +
    (charMap.get("ç") || 0) +
    (charMap.get("İ") || 0);

  // Check if markers are statistically significant for each language
  const hasSignificantRo =
    roScore >= minAbsoluteMarkers && roScore / totalLetters >= minMarkerPercentage;
  const hasSignificantDe =
    deScore >= minAbsoluteMarkers && deScore / totalLetters >= minMarkerPercentage;
  const hasSignificantFr =
    frScore >= minAbsoluteMarkers && frScore / totalLetters >= minMarkerPercentage;
  const hasSignificantEs =
    esScore >= minAbsoluteMarkers && esScore / totalLetters >= minMarkerPercentage;
  const hasSignificantSv =
    svScore >= minAbsoluteMarkers && svScore / totalLetters >= minMarkerPercentage;
  const hasSignificantPl =
    plScore >= minAbsoluteMarkers && plScore / totalLetters >= minMarkerPercentage;
  const hasSignificantTr =
    trScore >= minAbsoluteMarkers && trScore / totalLetters >= minMarkerPercentage;

  // Turkish check: Dotless I (ı) or yumuşak g (ğ) or ş
  if (
    hasSignificantTr &&
    ((charMap.get("ı") || 0) > 0 || (charMap.get("ğ") || 0) > 0) &&
    trScore > roScore &&
    trScore > deScore
  ) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === "tr")!;
  }

  // Polish check: ł, ą, ę, ż, etc.
  if (
    hasSignificantPl &&
    ((charMap.get("ł") || 0) > 0 || (charMap.get("ą") || 0) > 0 || (charMap.get("ę") || 0) > 0 || (charMap.get("ż") || 0) > 0) &&
    plScore > roScore &&
    plScore > deScore
  ) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === "pl")!;
  }

  // Swedish check: Å is uniquely Scandinavian and never in German
  if (
    hasSignificantSv &&
    aRingCount > 0 &&
    (charMap.get("ß") || 0) === 0 &&
    (charMap.get("ü") || 0) === 0 &&
    svScore > roScore &&
    svScore > frScore &&
    svScore > esScore
  ) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === "sv")!;
  }

  // Romanian check
  if (
    hasSignificantRo &&
    roScore > deScore &&
    roScore > frScore &&
    roScore > esScore &&
    roScore > svScore &&
    roScore > plScore &&
    roScore > trScore
  ) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === "ro")!;
  }

  // German check
  if (
    hasSignificantDe &&
    deScore > roScore &&
    deScore > frScore &&
    deScore > esScore &&
    (deScore > svScore || (charMap.get("ß") || 0) > 0 || (charMap.get("ü") || 0) > 0)
  ) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === "de")!;
  }

  // French check
  if (
    hasSignificantFr &&
    frScore > roScore &&
    frScore > deScore &&
    frScore > esScore &&
    frScore > svScore
  ) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === "fr")!;
  }

  // Spanish check
  if (
    hasSignificantEs &&
    esScore > roScore &&
    esScore > deScore &&
    esScore > frScore &&
    esScore > svScore
  ) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === "es")!;
  }

  // 4. Statistical Letter Profile Comparison (Cosine Similarity) with soft marker weighting
  let bestLang = SUPPORTED_LANGUAGES[1]; // default English
  let highestScore = -1;

  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang.code === "ru" || lang.code === "el" || lang.code === "he" || lang.code === "ar") continue; // only evaluated if specific script

    const sim = computeCosineSimilarity(observedFreqs, lang.standardFreq);

    // Add a proportional bonus if significant markers are present
    let score = sim;
    if (lang.code === "ro" && roScore > 0) {
      score += Math.min(0.2, (roScore / totalLetters) * 5);
    } else if (lang.code === "de" && deScore > 0) {
      score += Math.min(0.2, (deScore / totalLetters) * 5);
    } else if (lang.code === "fr" && frScore > 0) {
      score += Math.min(0.2, (frScore / totalLetters) * 5);
    } else if (lang.code === "es" && esScore > 0) {
      score += Math.min(0.2, (esScore / totalLetters) * 5);
    } else if (lang.code === "sv" && svScore > 0) {
      score += Math.min(0.2, (svScore / totalLetters) * 5);
    } else if (lang.code === "pl" && plScore > 0) {
      score += Math.min(0.2, (plScore / totalLetters) * 5);
    } else if (lang.code === "tr" && trScore > 0) {
      score += Math.min(0.2, (trScore / totalLetters) * 5);
    }

    if (score > highestScore) {
      highestScore = score;
      bestLang = lang;
    }
  }

  return bestLang;
}
