"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Chart as ChartType } from "chart.js";
import Chart from "chart.js/auto";
import { type DocumentAnalysis } from "@/lib/fileParser";
import { SUPPORTED_LANGUAGES } from "@/lib/languageDetector";

interface ComparativeAnalysisSectionProps {
  analyses: DocumentAnalysis[];
}

export const DOC_PALETTES = [
  {
    solid: "#8b5cf6",
    border: "#7c3aed",
    bg: "rgba(139, 92, 246, 0.85)",
    text: "text-purple-700",
    bgBadge: "bg-purple-100 text-purple-800 border-purple-200",
    dot: "bg-purple-500",
  },
  {
    solid: "#0284c7",
    border: "#0369a1",
    bg: "rgba(14, 165, 233, 0.85)",
    text: "text-sky-700",
    bgBadge: "bg-sky-100 text-sky-800 border-sky-200",
    dot: "bg-sky-500",
  },
  {
    solid: "#059669",
    border: "#047857",
    bg: "rgba(16, 185, 129, 0.85)",
    text: "text-emerald-700",
    bgBadge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    solid: "#d97706",
    border: "#b45309",
    bg: "rgba(245, 158, 11, 0.85)",
    text: "text-amber-700",
    bgBadge: "bg-amber-100 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  {
    solid: "#e11d48",
    border: "#be123c",
    bg: "rgba(244, 63, 94, 0.85)",
    text: "text-rose-700",
    bgBadge: "bg-rose-100 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
  },
  {
    solid: "#4f46e5",
    border: "#4338ca",
    bg: "rgba(99, 102, 241, 0.85)",
    text: "text-indigo-700",
    bgBadge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    dot: "bg-indigo-500",
  },
];

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

  const allComparedLetters = useMemo(() => {
    if (!analyses || analyses.length === 0) return [];

    const set = new Set<string>();

    for (const doc of analyses) {
      for (const item of doc.letterFrequencies) {
        set.add(item.char);
      }
      const lang = SUPPORTED_LANGUAGES.find((l) => l.code === doc.alphabetType);
      if (lang) {
        for (const ch of lang.alphabet) {
          set.add(ch);
        }
      }
    }

    const nonLatinCodes = new Set(["ru", "el", "he", "ar"]);
    const hasLatin = analyses.some((doc) => !nonLatinCodes.has(doc.alphabetType));

    if (hasLatin) {
      for (const ch of "abcdefghijklmnopqrstuvwxyz") set.add(ch);
      if (analyses.some((d) => d.alphabetType === "ro")) {
        for (const ch of ["ă", "â", "î", "ș", "ț"]) set.add(ch);
      }
      if (analyses.some((d) => d.alphabetType === "de")) {
        for (const ch of ["ä", "ö", "ü", "ß"]) set.add(ch);
      }
      if (analyses.some((d) => d.alphabetType === "fr")) {
        for (const ch of [
          "à", "â", "ç", "é", "è", "ê", "ë", "î", "ï", "ô", "ù", "û", "ü", "ÿ", "œ", "æ",
        ]) set.add(ch);
      }
      if (analyses.some((d) => d.alphabetType === "es")) set.add("ñ");
      if (analyses.some((d) => d.alphabetType === "sv")) {
        for (const ch of ["å", "ä", "ö"]) set.add(ch);
      }
      if (analyses.some((d) => d.alphabetType === "pl")) {
        for (const ch of ["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"]) set.add(ch);
      }
      if (analyses.some((d) => d.alphabetType === "tr")) {
        for (const ch of ["ç", "ğ", "ı", "ö", "ş", "ü"]) set.add(ch);
      }
    }

    if (analyses.some((d) => d.alphabetType === "el")) {
      for (const ch of [
        "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ο",
        "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω",
      ]) set.add(ch);
    }

    if (analyses.some((d) => d.alphabetType === "ru")) {
      for (const ch of [
        "а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н",
        "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь",
        "э", "ю", "я",
      ]) set.add(ch);
    }

    if (analyses.some((d) => d.alphabetType === "he")) {
      for (const ch of [
        "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס",
        "ע", "פ", "צ", "ק", "ר", "ש", "ת",
      ]) set.add(ch);
    }

    if (analyses.some((d) => d.alphabetType === "ar")) {
      for (const ch of [
        "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض",
        "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",
      ]) set.add(ch);
    }

    const allHebrew = analyses.every((d) => d.alphabetType === "he");
    const allArabic = analyses.every((d) => d.alphabetType === "ar");
    const allGreek = analyses.every((d) => d.alphabetType === "el");
    const allRussian = analyses.every((d) => d.alphabetType === "ru");

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

    if (allHebrew) {
      return Array.from(set).sort((a, b) => {
        const ia = HE_ORDER.indexOf(a);
        const ib = HE_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return a.localeCompare(b);
      });
    }
    if (allArabic) {
      return Array.from(set).sort((a, b) => {
        const ia = AR_ORDER.indexOf(a);
        const ib = AR_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return a.localeCompare(b);
      });
    }
    if (allGreek) {
      return Array.from(set).sort((a, b) => {
        const ia = EL_ORDER.indexOf(a);
        const ib = EL_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return a.localeCompare(b);
      });
    }
    if (allRussian) {
      return Array.from(set).sort((a, b) => {
        const ia = RU_ORDER.indexOf(a);
        const ib = RU_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return a.localeCompare(b);
      });
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b, "ro"));
  }, [analyses]);

  // Letters common to ALL documents
  const commonLetters = useMemo(() => {
    return allComparedLetters.filter((char) => {
      return analyses.every((doc) => {
        const s = getLetterStats(doc, char);
        return s.count > 0;
      });
    });
  }, [allComparedLetters, analyses]);

  // Letters unique to each document
  const docOnlyLetters = useMemo(() => {
    return analyses.map((doc, docIdx) => {
      return allComparedLetters.filter((char) => {
        const myStat = getLetterStats(doc, char);
        if (myStat.count === 0) return false;
        return analyses.every((otherDoc, otherIdx) => {
          if (docIdx === otherIdx) return true;
          return getLetterStats(otherDoc, char).count === 0;
        });
      });
    });
  }, [allComparedLetters, analyses]);

  const [selectedFilterView, setSelectedFilterView] = useState<string>("common");
  const filterView =
    selectedFilterView === "common" && commonLetters.length === 0
      ? "all"
      : selectedFilterView;

  const chartLetters = useMemo(() => {
    if (filterView === "common") return commonLetters;
    if (filterView.startsWith("doc_")) {
      const idx = parseInt(filterView.replace("doc_", ""), 10);
      if (!isNaN(idx) && docOnlyLetters[idx]) {
        return docOnlyLetters[idx];
      }
    }
    return allComparedLetters;
  }, [filterView, commonLetters, docOnlyLetters, allComparedLetters]);

  const chartDatasets = useMemo(() => {
    return analyses.map((doc, idx) => {
      const palette = DOC_PALETTES[idx % DOC_PALETTES.length];
      const data = chartLetters.map((char) => getLetterStats(doc, char).freq);
      return {
        label: `${doc.fileName} (${doc.alphabetName})`,
        data,
        backgroundColor: palette.bg,
        borderColor: palette.border,
        borderWidth: 1.5,
        borderRadius: 4,
        barPercentage: analyses.length <= 2 ? 0.85 : 0.9,
        categoryPercentage: analyses.length <= 2 ? 0.8 : 0.9,
      };
    });
  }, [analyses, chartLetters]);

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
        datasets: chartDatasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              padding: 12,
              font: { size: 11, weight: "bold" },
              color: "#374151",
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return ` ${context.dataset.label}: ${Number(context.parsed.y).toFixed(3)}%`;
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
  }, [chartLetters, chartDatasets]);

  if (analyses.length < 2) {
    return null;
  }

  return (
    <section className="w-full mt-10 mb-16 space-y-6">
      <div className="summary-card p-6 sm:p-8 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-xl space-y-6">
        <div className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 flex items-center gap-2">
              Frecvențele comparative ale documentelor ({analyses.length} documente)
            </h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="inline-flex rounded-lg p-1 bg-gray-100 text-xs font-medium flex-wrap gap-1" style={{ margin: '25px auto 15px auto' }}>
            <button
              style={{ padding: "4px 8px" }}
              onClick={() => setSelectedFilterView("common")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${filterView === "common"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <span>Caractere comune ({commonLetters.length})</span>
            </button>

            <button
              style={{ padding: "4px 8px" }}
              onClick={() => setSelectedFilterView("all")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${filterView === "all"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <span>Toate caracterele ({allComparedLetters.length})</span>
            </button>

            {analyses.map((doc, idx) => {
              const onlyCount = docOnlyLetters[idx]?.length || 0;
              if (onlyCount === 0) return null;
              const palette = DOC_PALETTES[idx % DOC_PALETTES.length];
              const isSelected = filterView === `doc_${idx}`;

              return (
                <button
                  key={doc.fileName + idx}
                  style={{ padding: "4px 8px" }}
                  onClick={() => setSelectedFilterView(`doc_${idx}`)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${isSelected
                    ? `bg-white ${palette.text} shadow-sm`
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${palette.dot}`} />
                  <span>Doar în Doc {idx + 1} ({onlyCount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Canvas Grafic Multi-Document */}
        <div className="h-96 sm:h-[460px] w-full p-2 bg-gradient-to-b from-white/90 to-purple-50/20 rounded-xl border border-purple-50">
          <canvas ref={chartCanvasRef} />
        </div>
      </div>
    </section>
  );
}
