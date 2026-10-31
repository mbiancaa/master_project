"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Chart as ChartType } from "chart.js";
import Chart from "chart.js/auto";
import type { DocumentAnalysis } from "@/lib/fileParser";
import { SUPPORTED_LANGUAGES } from "@/lib/languageDetector";

interface ComparativeAnalysisSectionProps {
  analyses: DocumentAnalysis[];
}

interface LetterComparisonRow {
  char: string;
  isVowel: boolean;
  isCommon: boolean;
  freq1: number;
  count1: number;
  freq2: number;
  count2: number;
  diff: number; // freq1 - freq2
  absDiff: number;
}

function getLetterStats(
  analysis: DocumentAnalysis | undefined,
  letter: string
): { freq: number; count: number; isVowel: boolean } {
  if (!analysis) return { freq: 0, count: 0, isVowel: false };

  const freqMap = new Map<string, number>();
  const countMap = new Map<string, number>();
  for (const item of analysis.letterFrequencies) {
    freqMap.set(item.char, item.relativeFrequency);
    countMap.set(item.char, item.count);
  }

  let freq = freqMap.get(letter) || 0;
  let count = countMap.get(letter) || 0;

  // Accents / variants aggregation
  if (letter === "ș") {
    freq += freqMap.get("ş") || 0;
    count += countMap.get("ş") || 0;
  }
  if (letter === "ț") {
    freq += freqMap.get("ţ") || 0;
    count += countMap.get("ţ") || 0;
  }
  if (letter === "σ") {
    freq += freqMap.get("ς") || 0;
    count += countMap.get("ς") || 0;
  }
  if (letter === "כ") {
    freq += freqMap.get("ך") || 0;
    count += countMap.get("ך") || 0;
  }
  if (letter === "מ") {
    freq += freqMap.get("ם") || 0;
    count += countMap.get("ם") || 0;
  }
  if (letter === "נ") {
    freq += freqMap.get("ן") || 0;
    count += countMap.get("ן") || 0;
  }
  if (letter === "פ") {
    freq += freqMap.get("ף") || 0;
    count += countMap.get("ף") || 0;
  }
  if (letter === "צ") {
    freq += freqMap.get("ץ") || 0;
    count += countMap.get("ץ") || 0;
  }
  if (letter === "ا") {
    for (const v of ["أ", "إ", "آ", "ى", "ٱ"]) {
      freq += freqMap.get(v) || 0;
      count += countMap.get(v) || 0;
    }
  }
  if (letter === "ه") {
    freq += freqMap.get("ة") || 0;
    count += countMap.get("ة") || 0;
  }
  if (letter === "و") {
    freq += freqMap.get("ؤ") || 0;
    count += countMap.get("ؤ") || 0;
  }
  if (letter === "ي") {
    freq += freqMap.get("ئ") || 0;
    count += countMap.get("ئ") || 0;
  }
  if (letter === "i") {
    freq += freqMap.get("İ") || 0;
    count += countMap.get("İ") || 0;
  }

  const langProfile = SUPPORTED_LANGUAGES.find(
    (l) => l.code === analysis.alphabetType
  );
  const isVowel = langProfile ? langProfile.vowels.has(letter) : false;

  return { freq: Number(freq.toFixed(3)), count, isVowel };
}

export default function ComparativeAnalysisSection({
  analyses,
}: ComparativeAnalysisSectionProps) {
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartType | null>(null);

  const target1: DocumentAnalysis | undefined = analyses[0];
  const target2: DocumentAnalysis | undefined = analyses[1];

  const lang1 = useMemo(
    () => SUPPORTED_LANGUAGES.find((l) => l.code === target1?.alphabetType),
    [target1?.alphabetType]
  );
  const lang2 = useMemo(
    () => SUPPORTED_LANGUAGES.find((l) => l.code === target2?.alphabetType),
    [target2?.alphabetType]
  );

  const alphaSet1 = useMemo(() => {
    const set = new Set<string>(lang1?.alphabet || []);
    if (target1) {
      for (const item of target1.letterFrequencies) set.add(item.char);
    }
    return set;
  }, [lang1, target1]);

  const alphaSet2 = useMemo(() => {
    const set = new Set<string>(lang2?.alphabet || []);
    if (target2) {
      for (const item of target2.letterFrequencies) set.add(item.char);
    }
    return set;
  }, [lang2, target2]);

  const allComparedLetters = useMemo(() => {
    if (!target1 || !target2) return [];

    const set = new Set<string>();

    for (const item of target1.letterFrequencies) set.add(item.char);
    for (const item of target2.letterFrequencies) set.add(item.char);

    const nonLatinCodes = ["ru", "el", "he", "ar"];
    const isTarget1Latin = !nonLatinCodes.includes(target1.alphabetType);
    const isTarget2Latin = !nonLatinCodes.includes(target2.alphabetType);

    if (isTarget1Latin || isTarget2Latin) {
      for (const ch of "abcdefghijklmnopqrstuvwxyz") set.add(ch);
      if (target1.alphabetType === "ro" || target2.alphabetType === "ro") {
        for (const ch of ["ă", "â", "î", "ș", "ț"]) set.add(ch);
      }
      if (target1.alphabetType === "de" || target2.alphabetType === "de") {
        for (const ch of ["ä", "ö", "ü", "ß"]) set.add(ch);
      }
      if (target1.alphabetType === "fr" || target2.alphabetType === "fr") {
        for (const ch of [
          "à", "â", "ç", "é", "è", "ê", "ë", "î", "ï", "ô", "ù", "û", "ü", "ÿ", "œ", "æ",
        ]) set.add(ch);
      }
      if (target1.alphabetType === "es" || target2.alphabetType === "es") set.add("ñ");
      if (target1.alphabetType === "sv" || target2.alphabetType === "sv") {
        for (const ch of ["å", "ä", "ö"]) set.add(ch);
      }
      if (target1.alphabetType === "pl" || target2.alphabetType === "pl") {
        for (const ch of ["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"]) set.add(ch);
      }
      if (target1.alphabetType === "tr" || target2.alphabetType === "tr") {
        for (const ch of ["ç", "ğ", "ı", "ö", "ş", "ü"]) set.add(ch);
      }
    }

    if (target1.alphabetType === "el" || target2.alphabetType === "el") {
      for (const ch of [
        "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ο",
        "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω",
      ]) set.add(ch);
    }

    if (target1.alphabetType === "ru" || target2.alphabetType === "ru") {
      for (const ch of [
        "а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н",
        "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь",
        "э", "ю", "я",
      ]) set.add(ch);
    }

    if (target1.alphabetType === "he" || target2.alphabetType === "he") {
      for (const ch of [
        "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס",
        "ע", "פ", "צ", "ק", "ר", "ש", "ת",
      ]) set.add(ch);
    }

    if (target1.alphabetType === "ar" || target2.alphabetType === "ar") {
      for (const ch of [
        "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض",
        "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",
      ]) set.add(ch);
    }

    const isBothHebrew = target1.alphabetType === "he" && target2.alphabetType === "he";
    const isBothArabic = target1.alphabetType === "ar" && target2.alphabetType === "ar";
    const isBothGreek = target1.alphabetType === "el" && target2.alphabetType === "el";
    const isBothRussian = target1.alphabetType === "ru" && target2.alphabetType === "ru";

    const HE_ORDER = [
      "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס",
      "ע", "פ", "צ", "ק", "ר", "ש", "ת",
    ];
    const AR_ORDER = [
      "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض",
      "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",
    ];
    const EL_ORDER = [
      "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ο",
      "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω",
    ];
    const RU_ORDER = [
      "а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н",
      "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь",
      "э", "ю", "я",
    ];

    if (isBothHebrew) {
      return Array.from(set).sort((a, b) => {
        const ia = HE_ORDER.indexOf(a);
        const ib = HE_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return a.localeCompare(b);
      });
    }
    if (isBothArabic) {
      return Array.from(set).sort((a, b) => {
        const ia = AR_ORDER.indexOf(a);
        const ib = AR_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return a.localeCompare(b);
      });
    }
    if (isBothGreek) {
      return Array.from(set).sort((a, b) => {
        const ia = EL_ORDER.indexOf(a);
        const ib = EL_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return a.localeCompare(b);
      });
    }
    if (isBothRussian) {
      return Array.from(set).sort((a, b) => {
        const ia = RU_ORDER.indexOf(a);
        const ib = RU_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return a.localeCompare(b);
      });
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b, "ro"));
  }, [target1, target2]);

  const comparisonRows = useMemo<LetterComparisonRow[]>(() => {
    if (!target1 || !target2) return [];

    return allComparedLetters.map((char) => {
      const s1 = getLetterStats(target1, char);
      const s2 = getLetterStats(target2, char);

      // Character is common if it belongs to both alphabets OR appears in both documents
      const isCommon =
        (alphaSet1.has(char) && alphaSet2.has(char)) ||
        (s1.count > 0 && s2.count > 0);

      const diff = Number((s1.freq - s2.freq).toFixed(3));
      const absDiff = Math.abs(diff);

      return {
        char,
        isVowel: s1.isVowel || s2.isVowel,
        isCommon,
        freq1: s1.freq,
        count1: s1.count,
        freq2: s2.freq,
        count2: s2.count,
        diff,
        absDiff,
      };
    });
  }, [allComparedLetters, target1, target2, alphaSet1, alphaSet2]);

  const commonRows = useMemo(
    () => comparisonRows.filter((r) => r.isCommon),
    [comparisonRows]
  );
  const doc1OnlyRows = useMemo(
    () => comparisonRows.filter((r) => !r.isCommon && (alphaSet1.has(r.char) || r.count1 > 0)),
    [comparisonRows, alphaSet1]
  );
  const doc2OnlyRows = useMemo(
    () => comparisonRows.filter((r) => !r.isCommon && (alphaSet2.has(r.char) || r.count2 > 0)),
    [comparisonRows, alphaSet2]
  );

  const [selectedFilterView, setSelectedFilterView] = useState<"common" | "all" | "doc1" | "doc2">("common");
  const filterView =
    selectedFilterView === "common" && commonRows.length === 0
      ? "all"
      : selectedFilterView;

  const label1 = target1
    ? `${target1.alphabetName} (${target1.fileName})`
    : "Document 1";

  const label2 = target2
    ? `${target2.alphabetName} (${target2.fileName})`
    : "Document 2";

  const chartLetters = useMemo(() => {
    if (filterView === "common") return commonRows.map((r) => r.char);
    if (filterView === "doc1") return doc1OnlyRows.map((r) => r.char);
    if (filterView === "doc2") return doc2OnlyRows.map((r) => r.char);
    return allComparedLetters;
  }, [filterView, commonRows, doc1OnlyRows, doc2OnlyRows, allComparedLetters]);

  const chartData1 = useMemo(() => {
    return chartLetters.map((char) => getLetterStats(target1, char).freq);
  }, [chartLetters, target1]);

  const chartData2 = useMemo(() => {
    return chartLetters.map((char) => getLetterStats(target2, char).freq);
  }, [chartLetters, target2]);

  useEffect(() => {
    if (!chartCanvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const ctx = chartCanvasRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartLetters,
        datasets: [
          {
            label: label1,
            data: chartData1,
            backgroundColor: "rgba(139, 92, 246, 0.85)", // Purple
            borderColor: "#8b5cf6",
            borderWidth: 1.5,
            borderRadius: 4,
            barPercentage: 0.85,
            categoryPercentage: 0.8,
          },
          {
            label: label2,
            data: chartData2,
            backgroundColor: "rgba(14, 165, 233, 0.85)", // Sky blue
            borderColor: "#0ea5e9",
            borderWidth: 1.5,
            borderRadius: 4,
            barPercentage: 0.85,
            categoryPercentage: 0.8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 14,
              boxHeight: 14,
              padding: 14,
              font: { size: 12, weight: "bold" },
              color: "#374151",
            },
          },
          tooltip: {
            callbacks: {
              afterBody: (context) => {
                if (context.length >= 2) {
                  const val1 = Number(context[0].parsed.y);
                  const val2 = Number(context[1].parsed.y);
                  const diff = val1 - val2;
                  const sign = diff >= 0 ? "+" : "";
                  return `Diferență (Doc 1 - Doc 2): ${sign}${diff.toFixed(3)}%`;
                }
                return "";
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11, family: "monospace", weight: "bold" },
              color: "#4b5563",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => `${val}%`,
              font: { size: 11 },
              color: "#6b7280",
            },
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [chartLetters, chartData1, chartData2, label1, label2]);

  if (analyses.length < 2) {
    return null;
  }


  return (
    <section className="w-full mt-10 mb-16 space-y-6">
      <div className="summary-card p-6 sm:p-8 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-xl space-y-6">
        <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 flex items-center gap-2" style={{ marginBottom: 40 }}>
              Frecvențele comparative ale documentelor
            </h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="inline-flex rounded-xl p-1 bg-gray-100 text-xs font-medium flex-wrap gap-1">
            <button
              style={{ padding: '4px 6px' }}
              onClick={() => setSelectedFilterView("common")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${filterView === "common"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <span>Caractere comune</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterView === "common"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-200 text-gray-700"
                  }`}
              >
                {commonRows.length}
              </span>
            </button>

            <button
              style={{ padding: '4px 6px' }}
              onClick={() => setSelectedFilterView("all")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${filterView === "all"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <span>Toate caracterele</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterView === "all"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-200 text-gray-700"
                  }`}
              >
                {comparisonRows.length}
              </span>
            </button>

            {doc1OnlyRows.length > 0 && (
              <button
                style={{ padding: '4px 6px' }}
                onClick={() => setSelectedFilterView("doc1")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${filterView === "doc1"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <span>Doar în {target1?.alphabetName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterView === "doc1"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-200 text-gray-700"
                    }`}
                >
                  {doc1OnlyRows.length}
                </span>
              </button>
            )}

            {doc2OnlyRows.length > 0 && (
              <button
                style={{ padding: '4px 6px' }}
                onClick={() => setSelectedFilterView("doc2")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${filterView === "doc2"
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <span>Doar în {target2?.alphabetName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterView === "doc2"
                    ? "bg-sky-100 text-sky-800"
                    : "bg-gray-200 text-gray-700"
                    }`}
                >
                  {doc2OnlyRows.length}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="h-80 sm:h-96 w-full p-2 bg-gradient-to-b from-white/90 to-purple-50/20 rounded-xl border border-purple-50">
          <canvas ref={chartCanvasRef} />
        </div>
      </div>
    </section>
  );
}
