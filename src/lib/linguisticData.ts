import type { DocumentAnalysis } from "./fileParser";

// Standard linguistic frequencies (%) in Romanian language corpus
export const ROMANIAN_STANDARD_FREQ: Record<string, number> = {
  a: 8.5,
  ă: 2.8,
  â: 1.2,
  b: 1.4,
  c: 4.1,
  d: 3.3,
  e: 12.2,
  f: 1.2,
  g: 1.3,
  h: 1.1,
  i: 9.8,
  î: 1.0,
  j: 0.3,
  k: 0.1,
  l: 4.8,
  m: 2.9,
  n: 5.4,
  o: 3.9,
  p: 3.1,
  q: 0.05,
  r: 6.5,
  s: 3.8,
  ș: 2.1,
  t: 5.8,
  ț: 1.5,
  u: 5.2,
  v: 1.3,
  w: 0.1,
  x: 0.1,
  y: 0.1,
  z: 0.6,
};

// Standard linguistic frequencies (%) in English language corpus (Oxford/Brown Corpus)
export const ENGLISH_STANDARD_FREQ: Record<string, number> = {
  a: 8.2,
  ă: 0.0,
  â: 0.0,
  b: 1.5,
  c: 2.8,
  d: 4.3,
  e: 12.7,
  f: 2.2,
  g: 2.0,
  h: 6.1,
  i: 7.0,
  î: 0.0,
  j: 0.15,
  k: 0.8,
  l: 4.0,
  m: 2.4,
  n: 6.7,
  o: 7.5,
  p: 1.9,
  q: 0.1,
  r: 6.0,
  s: 6.3,
  ș: 0.0,
  t: 9.1,
  ț: 0.0,
  u: 2.8,
  v: 1.0,
  w: 2.4,
  x: 0.15,
  y: 2.0,
  z: 0.07,
};

// All 31 distinct letters (Romanian + English union)
export const ALL_COMPARED_LETTERS = [
  "a", "ă", "â", "b", "c", "d", "e", "f", "g", "h", "i", "î", "j", "k", "l",
  "m", "n", "o", "p", "q", "r", "s", "ș", "t", "ț", "u", "v", "w", "x", "y", "z",
];

export interface FileConclusions {
  fileName: string;
  isCompliant: boolean;
  lengthStatus: string;
  formatStatus: string;
  letterDensity: number;
  letterDensityDescription: string;
  diacriticsCount: number;
  diacriticsRatio: number;
  diacriticsDescription: string;
  unusualChars: string[];
  unusualCharsDescription: string;
  detectedLanguage: "romanian" | "english";
  languageDescription: string;
  textProfile: "beletristic" | "tehnic" | "juridic" | "general";
  profileTitle: string;
  profileDescription: string;
  profileReasons: string[];
  keyHighlights: string[];
}

export function generateFileConclusions(analysis: DocumentAnalysis): FileConclusions {
  const isCompliant = analysis.totalLetters >= 50000;
  const ext = analysis.fileName.slice(analysis.fileName.lastIndexOf(".")).toLowerCase();

  // 1. Length and format status
  const formatStatus = `Fișier de tip ${ext.toUpperCase() || "TEXT"} procesat cu succes fără erori de parsare.`;
  const lengthStatus = isCompliant
    ? `Textul respectă pe deplin cerința de volum: conține ${analysis.totalLetters.toLocaleString("ro-RO")} litere (față de pragul minim obligatoriu de 50.000 litere, un surplus de +${(analysis.totalLetters - 50000).toLocaleString("ro-RO")} litere).`
    : `Textul NU respectă cerința de volum: conține doar ${analysis.totalLetters.toLocaleString("ro-RO")} litere (sub minimul de 50.000).`;

  // 2. Letter density (letters vs total non-whitespace chars)
  const letterDensity =
    analysis.totalCharsNoSpaces > 0
      ? (analysis.totalLetters / analysis.totalCharsNoSpaces) * 100
      : 0;

  let letterDensityDescription = "";
  if (letterDensity >= 95) {
    letterDensityDescription = `Densitate alfabetică foarte ridicată (${letterDensity.toFixed(1)}%): textul este compus aproape exclusiv din cuvinte și litere, conținând foarte puține cifre sau simboluri speciale.`;
  } else if (letterDensity >= 88) {
    letterDensityDescription = `Densitate alfabetică standard (${letterDensity.toFixed(1)}%): text narativ sau documentar tipic, cu o proporție echilibrată de punctuație și litere.`;
  } else {
    letterDensityDescription = `Densitate alfabetică redusă (${letterDensity.toFixed(1)}%): textul conține o pondere semnificativă de cifre, tabele, paranteze sau simboluri speciale (${(100 - letterDensity).toFixed(1)}% non-litere).`;
  }

  // 3. Diacritics
  const diacriticChars = new Set(["ă", "â", "î", "ș", "ț", "ş", "ţ"]);
  let diacriticsCount = 0;
  for (const item of analysis.letterFrequencies) {
    if (diacriticChars.has(item.char)) {
      diacriticsCount += item.count;
    }
  }

  const diacriticsRatio =
    analysis.totalLetters > 0 ? (diacriticsCount / analysis.totalLetters) * 100 : 0;

  let diacriticsDescription = "";
  const detectedLanguage = analysis.alphabetType;
  let languageDescription = "";

  if (detectedLanguage === "romanian") {
    languageDescription = "Limba română (detectată prin prezența diacriticelor specifice).";
    if (diacriticsRatio >= 6.5) {
      diacriticsDescription = `Pondere optimă a diacriticelor (${diacriticsRatio.toFixed(2)}%, ${diacriticsCount.toLocaleString("ro-RO")} caractere): text redactat îngrijit, respectând normele ortografice ale limbii române.`;
    } else if (diacriticsRatio >= 2.0) {
      diacriticsDescription = `Pondere moderată a diacriticelor (${diacriticsRatio.toFixed(2)}%): text în limba română cu utilizare parțială a diacriticelor sau cu multe neologisme/termeni străini.`;
    } else {
      diacriticsDescription = `Pondere foarte redusă a diacriticelor (${diacriticsRatio.toFixed(2)}%): text scris în mare parte fără diacritice sau cu secțiuni ample preluate din alte limbi.`;
    }
  } else {
    languageDescription = "Limba engleză / alfabet latin de bază A-Z (lipsesc diacriticele românești).";
    diacriticsDescription = "Fără diacritice românești (0.00%): text redactat exclusiv în alfabetul latin standard A-Z.";
  }

  // 4. Unusual / rare characters
  const unusualChars: string[] = [];
  const rareInRo = new Set(["q", "w", "y", "x", "k"]);
  for (const item of analysis.letterFrequencies) {
    if (detectedLanguage === "romanian" && rareInRo.has(item.char) && item.count > 0) {
      unusualChars.push(`${item.char} (${item.count.toLocaleString("ro-RO")})`);
    }
  }

  let unusualCharsDescription = "";
  if (detectedLanguage === "romanian") {
    if (unusualChars.length > 0) {
      unusualCharsDescription = `Prezență de caractere împrumutate/neologice: ${unusualChars.join(", ")}. Aceste litere indică prezența numelor proprii străine sau a neologismelor recente.`;
    } else {
      unusualCharsDescription = "Fond lexical autohton: literele rare precum q, w, y nu apar sau au frecvență neglijabilă.";
    }
  } else {
    unusualCharsDescription = `Litere mai puțin frecvente în limba engleză: ${analysis.leastFrequentLetter?.char.toUpperCase() || "-"} (${analysis.leastFrequentLetter?.count.toLocaleString("ro-RO") || 0} apariții, ${analysis.leastFrequentLetter?.relativeFrequency.toFixed(3) || 0}%).`;
  }

  // 5. Text profile characterization (beletristic, tehnic, juridic)
  let textProfile: "beletristic" | "tehnic" | "juridic" | "general" = "beletristic";
  let profileTitle = "Profil Beletristic / Narativ";
  let profileDescription = "";
  const profileReasons: string[] = [];

  if (letterDensity < 88) {
    textProfile = "tehnic";
    profileTitle = "Profil Tehnic / Științific";
    profileDescription = "Document cu pronunțat caracter tehnic sau academic, marcat de prezența codurilor, numerotărilor sau termenilor specializați.";
    profileReasons.push(`Densitate alfabetică redusă (${letterDensity.toFixed(1)}%), semn al frecvenței ridicate de cifre, paranteze și simboluri.`);
    profileReasons.push("Structură densă de date, formule sau referințe tehnice interioare.");
  } else if (analysis.consonantFrequency >= 57.5) {
    textProfile = "juridic";
    profileTitle = "Profil Juridic / Administrativ / Formal";
    profileDescription = "Document formal, juridic sau administrativ, caracterizat prin sobrietate stilistică și recurență a terminologiei specializate.";
    profileReasons.push(`Frecvență ridicată a consoanelor (${analysis.consonantFrequency.toFixed(1)}%), tipică vocabularului juridico-administrativ.`);
    profileReasons.push("Formulări standardizate și densitate alfabetică formală.");
  } else {
    textProfile = "beletristic";
    profileTitle = "Profil Beletristic / Literatură Narativă";
    profileDescription = "Text cursiv de natură narativă, publicistică sau beletristică, cu o curgere armonioasă a frazelor.";
    profileReasons.push(`Raport natural și armonios între vocale (${analysis.vowelFrequency.toFixed(1)}%) și consoane (${analysis.consonantFrequency.toFixed(1)}%).`);
    profileReasons.push(`Densitate ridicată a literelor (${letterDensity.toFixed(1)}%), indicând text continuu fără enumerări tehnice dese.`);
    if (detectedLanguage === "romanian" && diacriticsRatio >= 5) {
      profileReasons.push(`Folosire consecventă a diacriticelor românești (${diacriticsRatio.toFixed(1)}%), proprie literaturii tipărite.`);
    }
  }

  // Key highlights
  const keyHighlights: string[] = [
    `Litera dominantă: ${analysis.mostFrequentLetter?.char.toUpperCase() || "-"} (${analysis.mostFrequentLetter?.relativeFrequency.toFixed(2)}%)`,
    `Raport V/C: ${analysis.vowelFrequency.toFixed(1)}% vocale / ${analysis.consonantFrequency.toFixed(1)}% consoane`,
    `Total litere distincte: ${analysis.totalDistinctLetters} din alfabetul ${detectedLanguage === "romanian" ? "român (31)" : "englez (26)"}`,
  ];

  return {
    fileName: analysis.fileName,
    isCompliant,
    lengthStatus,
    formatStatus,
    letterDensity,
    letterDensityDescription,
    diacriticsCount,
    diacriticsRatio,
    diacriticsDescription,
    unusualChars,
    unusualCharsDescription,
    detectedLanguage,
    languageDescription,
    textProfile,
    profileTitle,
    profileDescription,
    profileReasons,
    keyHighlights,
  };
}
