"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Chart as ChartType } from "chart.js";
import Chart from "chart.js/auto";
import type { DocumentAnalysis } from "@/lib/fileParser";

interface DocumentSummaryProps {
  analysis: DocumentAnalysis;
  colorScheme?: "purple";
}

export default function DocumentSummary({
  analysis,
  colorScheme = "purple",
}: DocumentSummaryProps) {
  const [filterMode, setFilterMode] = useState<"letters" | "vowels" | "consonants" | "all">("letters");
  const [sortBy, setSortBy] = useState<"count" | "alpha">("count");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pieCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const barChartInstance = useRef<ChartType | null>(null);
  const pieChartInstance = useRef<ChartType | null>(null);

  const componentId = useId();

  const displayedItems = useMemo(() => {
    let list = [...analysis.allCharFrequencies];

    if (filterMode === "letters") {
      list = [...analysis.letterFrequencies];
    } else if (filterMode === "vowels") {
      list = analysis.letterFrequencies.filter((item) => item.isVowel);
    } else if (filterMode === "consonants") {
      list = analysis.letterFrequencies.filter((item) => !item.isVowel);
    }

    list.sort((a, b) => {
      if (sortBy === "count") {
        return sortOrder === "desc" ? b.count - a.count : a.count - b.count;
      }
      return sortOrder === "desc"
        ? b.char.localeCompare(a.char, "ro")
        : a.char.localeCompare(b.char, "ro");
    });

    return list;
  }, [analysis, filterMode, sortBy, sortOrder]);

  const primaryColor = "#8b5cf6";
  const primaryColorLight = "rgba(139, 92, 246, 0.65)";

  useEffect(() => {
    if (!barCanvasRef.current) return;

    if (barChartInstance.current) {
      barChartInstance.current.destroy();
      barChartInstance.current = null;
    }

    const itemsForBar =
      filterMode === "all"
        ? analysis.allCharFrequencies.slice(0, 30)
        : filterMode === "vowels"
          ? analysis.letterFrequencies.filter((i) => i.isVowel)
          : filterMode === "consonants"
            ? analysis.letterFrequencies.filter((i) => !i.isVowel)
            : analysis.letterFrequencies;

    const labels = itemsForBar.map((item) =>
      item.char === " " ? "spațiu" : item.char
    );
    const data = itemsForBar.map((item) =>
      Number(item.relativeFrequency.toFixed(3))
    );

    const ctx = barCanvasRef.current.getContext("2d");
    if (!ctx) return;

    barChartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Frecvență relativă (%)",
            data,
            backgroundColor: primaryColorLight,
            borderColor: primaryColor,
            borderWidth: 1.5,
            borderRadius: 6,
            hoverBackgroundColor: primaryColor,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const item = itemsForBar[context.dataIndex];
                return [
                  ` Frecvență: ${item.relativeFrequency.toFixed(3)}%`,
                  ` Apariții: ${item.count.toLocaleString("ro-RO")}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11, family: "monospace" },
              color: "#6b7280",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => `${val}%`,
              font: { size: 10 },
              color: "#9ca3af",
            },
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
        },
      },
    });

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
        barChartInstance.current = null;
      }
    };
  }, [analysis, filterMode, primaryColor, primaryColorLight, isFullscreen]);

  useEffect(() => {
    if (!pieCanvasRef.current) return;

    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
      pieChartInstance.current = null;
    }

    const sourceList =
      filterMode === "all"
        ? analysis.allCharFrequencies
        : filterMode === "vowels"
          ? analysis.letterFrequencies.filter((i) => i.isVowel)
          : filterMode === "consonants"
            ? analysis.letterFrequencies.filter((i) => !i.isVowel)
            : analysis.letterFrequencies;

    const labels = sourceList.map((item) =>
      item.char === " " ? "spațiu" : item.char
    );
    const data = sourceList.map((item) =>
      Number(item.relativeFrequency.toFixed(3))
    );

    const bgColors = sourceList.map((_, i) => {
      const hue = Math.round((i * 137.508) % 360);
      return `hsl(${hue}, 70%, 60%)`;
    });

    const ctx = pieCanvasRef.current.getContext("2d");
    if (!ctx) return;

    pieChartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: bgColors,
            borderColor: "#ffffff",
            borderWidth: 1.5,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              padding: 5,
              font: { size: 9, family: "monospace" },
              color: "#4b5563",
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || "";
                const val = context.parsed || 0;
                const item = sourceList[context.dataIndex];
                return [
                  ` Literă: ${label}`,
                  ` Frecvență: ${val.toFixed(3)}%`,
                  ` Apariții: ${item?.count.toLocaleString("ro-RO") || 0}`,
                ];
              },
            },
          },
        },
        cutout: "45%",
      },
    });

    return () => {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
        pieChartInstance.current = null;
      }
    };
  }, [analysis, filterMode, isFullscreen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      barChartInstance.current?.resize();
      pieChartInstance.current?.resize();
    }, 80);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md p-3 sm:p-6 lg:p-10 flex justify-center items-start"
          : "contents"
      }
      onClick={(e) => {
        if (e.target === e.currentTarget && isFullscreen) {
          setIsFullscreen(false);
        }
      }}
    >
      <div
        className={`summary-card flex flex-col gap-6 p-6 sm:p-7 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-xl transition-all duration-300 ${isFullscreen
          ? "w-full max-w-6xl my-auto max-h-[92vh] overflow-y-auto ring-1 ring-black/10 shadow-2xl expanded-summary-card"
          : "overflow-hidden"
          }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorScheme === "purple"
                ? "bg-purple-100 text-purple-600"
                : "bg-blue-100 text-blue-600"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h3
                className="font-bold text-base sm:text-lg text-gray-900 truncate"
                title={analysis.fileName}
              >
                {analysis.fileName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
            <button
              style={{ padding: 10 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100/90 hover:bg-purple-100 text-gray-700 hover:text-purple-700 transition-all duration-200  cursor-pointer"
              title={
                isFullscreen
                  ? "Ieși din modul ecran complet (Esc)"
                  : "Extinde rezumatul pe tot ecranul"
              }
              aria-label={
                isFullscreen ? "Restrânge rezumatul" : "Extinde pe tot ecranul"
              }
            >
              {isFullscreen ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
                    />
                  </svg>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition-transform group-hover:scale-110"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {analysis.totalLetters < 50000 ? (
            <div className="warning-summary mt-1 flex items-center gap-1.5 text-xs text-amber-800 font-medium px-2.5 py-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-amber-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <span className="font-bold text-xs sm:text-sm">
                Atenție: fișierul are mai puține litere decât pragul recomandat de 50.000.
              </span>
            </div>
          ) : (
            <div className="warning-summary mt-1 flex items-center gap-1.5 text-xs text-emerald-900 font-medium px-2.5 py-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold">
                ✓
              </span>
              <span className="font-bold text-xs sm:text-sm">
                Fișierul este conform pragului minim recomandat de 50.000.
              </span>
            </div>
          )}

          <div
            className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${analysis.hasInvisibleChars
              ? "text-rose-900"
              : "text-emerald-900"
              }`}
          >
            <div className="space-y-0.5 warning-summary" style={{ margin: '5px 0' }}>
              <div className="flex items-center gap-1.5">
                {analysis.hasInvisibleChars ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-200 text-rose-800 text-xs font-bold">
                    !
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold">
                    ✓
                  </span>
                )}
                <span className="font-bold text-xs sm:text-sm">
                  {analysis.hasInvisibleChars
                    ? `S-au detectat ${analysis.invisibleCharsCount} caractere invizibile în document!`
                    : "Nu s-au identificat caractere invizibile / zero-width."}
                </span>
              </div>
              <p className="text-[11px] opacity-90" style={{ marginLeft: 27, marginTop: 3 }}>
                {analysis.hasInvisibleChars
                  ? `Identificate: ${analysis.invisibleCharsDetails
                    .map((d) => `${d.name} (${d.code}) × ${d.count}`)
                    .join(", ")}. Atenție la posibile tehnici de steganografie sau injectare ascunsă.`
                  : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ margin: '15px 0 0 0' }}>
            <div className="stat-box p-3.5 rounded-xl bg-purple-50/60 border border-purple-100/60">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                Total caractere fără spații
              </span>
              <span className="font-extrabold text-base sm:text-lg text-purple-700 block mt-0.5">
                {analysis.totalCharsNoSpaces.toLocaleString("ro-RO")}
              </span>
            </div>

            <div className="stat-box p-3.5 rounded-xl bg-purple-50/60 border border-purple-100/60">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                Total litere din alfabet ({analysis.alphabetName})
              </span>
              <span className="font-extrabold text-base sm:text-lg text-purple-700 block mt-0.5">
                {analysis.totalLetters.toLocaleString("ro-RO")}
              </span>
            </div>

            <div className="stat-box p-3.5 rounded-xl bg-purple-50/60 border border-purple-100/60">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                Total caractere distincte
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg text-purple-700">
                  {analysis.totalDistinctChars}
                </span>
                <span
                  className="text-xs text-gray-500 font-medium"
                  title={`Alfabetul ${analysis.alphabetName} conține ${analysis.alphabetTotalLetters} litere conform regex`}
                >
                  ({analysis.alphabetTotalLetters} litere cf. regex-ul alfabetului)
                </span>
              </div>
            </div>


            <div className="stat-box p-3.5 rounded-xl bg-purple-50/60 border border-purple-100/60">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                Similaritate Cosinus cu Limba Detectată
              </span>
              <span className="font-extrabold text-base sm:text-lg text-purple-700 block mt-0.5">
                {analysis.cosineSimilarityWithStandard.toFixed(2)}%
              </span>
            </div>

            <div className="stat-box p-3.5 rounded-xl bg-purple-50/60 border border-purple-100/60">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                Entropia Shannon (H)
              </span>
              <span className="font-extrabold text-base sm:text-lg text-purple-700 block mt-0.5">
                {analysis.shannonEntropy.toFixed(3)} <span className="text-xs text-gray-500 font-medium"> biți / car.</span>
              </span>
              <p className="text-[10px] text-gray-500 mt-1.5 leading-snug">
                {analysis.shannonEntropy < 3.0
                  ? "Entropie scăzută: grad ridicat de redundanță / structură repetitivă."
                  : analysis.shannonEntropy <= 4.8
                    ? "Entropie specifică limbajului natural autentic."
                    : "Entropie ridicată: posibile date criptate, comprimate sau aleatoare."}
              </p>
            </div>

            <div className="stat-box p-3.5 rounded-xl bg-purple-50/60 border border-purple-100/60">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                Index de Coincidență Friedman (IoC)
              </span>
              <span className="font-extrabold text-base sm:text-lg text-purple-700 block mt-0.5">
                {analysis.indexOfCoincidence.toFixed(4)}
              </span>
              <p className="text-[10px] text-gray-500 mt-1.5 leading-snug">
                {analysis.indexOfCoincidence >= 0.065
                  ? "Distribuție monoalfabetică normală (specifică limbajului natural)."
                  : analysis.indexOfCoincidence >= 0.045
                    ? "Valoare intermediară (posibil text tehnic sau scurt)."
                    : "Distribuție aplatizată (indiciu cifru polialfabetic / aleator)."}
              </p>
            </div>


            <div className="stat-box p-3 rounded-xl bg-purple-50/60 border border-purple-100/80">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
                Număr Cuvinte
              </span>
              <span className="font-extrabold text-base sm:text-lg text-purple-700 block mt-0.5 truncate">
                {analysis.totalWords.toLocaleString("ro-RO")}
              </span>
            </div>

            <div className="stat-box p-3 rounded-xl bg-purple-50/60 border border-purple-100/80">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
                Număr Propoziții
              </span>
              <span className="font-extrabold text-base sm:text-lg text-purple-700 block mt-0.5 truncate">
                {analysis.totalSentences.toLocaleString("ro-RO")}
              </span>
            </div>

            <div className="stat-box p-3 rounded-xl bg-purple-50/60 border border-purple-100/80">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
                Medie Litere / Cuvânt
              </span>
              <span className="font-extrabold text-base sm:text-lg text-purple-700 block mt-0.5 truncate">
                {analysis.averageWordLength.toFixed(2)}
              </span>
            </div>

            <div className="stat-box p-3 rounded-xl bg-purple-50/60 border border-purple-100/80">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
                Diversitate lexicală (Cuvinte Unice / Total)
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-extrabold text-base sm:text-lg text-purple-700">
                  {analysis.typeTokenRatio.toFixed(1)}%
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  ({analysis.uniqueWordsCount}/{analysis.totalWords})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-1 border-t border-purple-100/60">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="stat-box p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100/70">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider">
                  Consoane
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700" style={{ padding: 4 }}>
                  {analysis.consonantFrequency.toFixed(2)}%
                </span>
              </div>
              <span className="font-extrabold text-lg text-indigo-700 block mt-1">
                {analysis.totalConsonants.toLocaleString("ro-RO")}
              </span>
              <span className="text-[11px] text-gray-500 block mt-0.5">
                din {analysis.totalLetters.toLocaleString("ro-RO")} litere
              </span>
            </div>

            <div className="stat-box p-3.5 rounded-xl bg-pink-50/60 border border-pink-100/70">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-pink-900 uppercase tracking-wider">
                  Vocale
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-pink-100 text-pink-700" style={{ padding: 4 }}>
                  {analysis.vowelFrequency.toFixed(2)}%
                </span>
              </div>
              <span className="font-extrabold text-lg text-pink-700 block mt-1">
                {analysis.totalVowels.toLocaleString("ro-RO")}
              </span>
              <span className="text-[11px] text-gray-500 block mt-0.5">
                din {analysis.totalLetters.toLocaleString("ro-RO")} litere
              </span>
            </div>

            <div className="stat-box p-3.5 rounded-xl bg-amber-50/60 border border-amber-100/70">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
                  Litere absente
                </span>
                <span
                  style={{ padding: 4 }}
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 truncate max-w-[120px]"
                  title={`Alfabet detectat: ${analysis.alphabetName}`}
                >
                  {analysis.alphabetName}
                </span>
              </div>
              <span className="font-extrabold text-lg text-amber-700 block mt-1">
                {analysis.missingLettersCount}{" "}
                <span className="text-xs font-normal text-gray-500">
                  din {analysis.alphabetTotalLetters}
                </span>
              </span>
              <span
                className="text-[11px] text-gray-600 truncate block mt-0.5"
                title={
                  analysis.missingLetters.length > 0
                    ? `Litere care nu apar: ${analysis.missingLetters.join(", ")}`
                    : "Toate literele din alfabet apar în text"
                }
              >
                {analysis.missingLetters.length > 0 ? (
                  <>
                    Absente:{" "}
                    <span className="font-mono font-medium text-amber-900">
                      {analysis.missingLetters.join(", ")}
                    </span>
                  </>
                ) : (
                  <span className="text-green-600 font-medium">✓ Alfabet complet</span>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl" style={{ marginTop: 30 }}>
            <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
              <span className="flex items-center gap-1.5 text-pink-700">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
                Vocale: {analysis.vowelFrequency.toFixed(1)}% ({analysis.totalVowels.toLocaleString("ro-RO")})
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700">
                Consoane: {analysis.consonantFrequency.toFixed(1)}% ({analysis.totalConsonants.toLocaleString("ro-RO")})
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden flex">
              <div
                className="h-full bg-pink-500 transition-all duration-500"
                style={{ width: `${analysis.vowelFrequency}%` }}
                title={`Vocale: ${analysis.vowelFrequency.toFixed(2)}%`}
              />
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${analysis.consonantFrequency}%` }}
                title={`Consoane: ${analysis.consonantFrequency.toFixed(2)}%`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1 border-t border-purple-100/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="stat-box p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100/80 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider block">
                  Cea mai frecventă literă
                </span>
                {analysis.mostFrequentLetter ? (
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-mono font-extrabold text-2xl text-emerald-700">
                      {analysis.mostFrequentLetter.char.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      {analysis.mostFrequentLetter.relativeFrequency.toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
                <span className="text-[11px] text-gray-500 block">
                  {analysis.mostFrequentLetter?.count.toLocaleString("ro-RO")} apariții
                </span>
              </div>
            </div>

            <div className="stat-box p-3.5 rounded-xl bg-rose-50/70 border border-rose-100/80 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-rose-900 uppercase tracking-wider block">
                  Cea mai rară literă
                </span>
                {analysis.leastFrequentLetter ? (
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-mono font-extrabold text-2xl text-rose-700">
                      {analysis.leastFrequentLetter.char.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-rose-800">
                      {analysis.leastFrequentLetter.relativeFrequency.toFixed(3)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
                <span className="text-[11px] text-gray-500 block">
                  {analysis.leastFrequentLetter?.count.toLocaleString("ro-RO")} apariții
                </span>
              </div>
            </div>
          </div>
        </div>


        <div className="space-y-3 pt-3">
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between" style={{ marginBottom: 15 }}>
              <h4 className="font-bold text-sm text-gray-900">
                Top 10 cele mai frecvente cuvinte
              </h4>
            </div>

            {analysis.topWords.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                {analysis.topWords.map((item, idx) => (
                  <div
                    key={`${componentId}-word-${idx}-${item.word}`}
                    style={{ padding: '6px 10px' }}
                    className="flex items-center justify-between p-2.5 rounded bg-purple-50/40 border border-purple-100/60 hover:bg-purple-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0 w-5 h-5 rounded-md text-purple-800 text-[10px] font-extrabold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                        {item.word}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 flex-shrink-0 text-right">
                      <span className="text-xs font-bold text-purple-700">
                        {item.count.toLocaleString("ro-RO")}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500">
                        ({item.relativeFrequency.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic p-3 text-center bg-gray-50 rounded-xl">
                Nu au fost identificate cuvinte în text.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div style={{ marginBottom: 15 }}>
              <h4 className="font-bold text-sm text-gray-900">
                Frecvența caracterelor
              </h4>
              <p className="text-xs text-gray-500">
                În raport cu totalul de{" "}
                {analysis.totalLetters.toLocaleString("ro-RO")} litere
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="inline-flex rounded-lg p-0.5 bg-gray-100 text-xs flex-wrap">
                <button
                  className={`px-2 py-1 rounded-md transition-all font-medium ${filterMode === "letters"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                    }`}
                  style={{ padding: "4px 6px" }}
                  onClick={() => setFilterMode("letters")}
                >
                  Litere ({analysis.totalDistinctLetters})
                </button>
                <button
                  className={`px-2 py-1 rounded-md transition-all font-medium ${filterMode === "vowels"
                    ? "bg-white text-pink-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                    }`}
                  style={{ padding: "4px 6px" }}
                  onClick={() => setFilterMode("vowels")}
                >
                  Vocale
                </button>
                <button
                  className={`px-2 py-1 rounded-md transition-all font-medium ${filterMode === "consonants"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                    }`}
                  style={{ padding: "4px 6px" }}
                  onClick={() => setFilterMode("consonants")}
                >
                  Consoane
                </button>
                <button
                  className={`px-2 py-1 rounded-md transition-all font-medium ${filterMode === "all"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                    }`}
                  style={{ padding: "4px 6px" }}
                  onClick={() => setFilterMode("all")}
                >
                  Toate ({analysis.totalDistinctChars})
                </button>
              </div>
            </div>
          </div>

          <div className="border border-gray-200/80 rounded-xl overflow-hidden overflow-y-auto bg-white/70" style={{ maxHeight: 450, overflow: 'scroll' }}>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-gray-50/95 backdrop-blur border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-purple-600 select-none"
                    onClick={() => {
                      if (sortBy === "alpha") {
                        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                      } else {
                        setSortBy("alpha");
                        setSortOrder("asc");
                      }
                    }}
                    title="Sortează după caracter"
                  >
                    <div className="flex items-center gap-1">
                      <span>Caracter</span>
                      {sortBy === "alpha" && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>

                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-purple-600 select-none"
                    onClick={() => {
                      if (sortBy === "count") {
                        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                      } else {
                        setSortBy("count");
                        setSortOrder("desc");
                      }
                    }}
                    title="Sortează după număr apariții"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Apariții</span>
                      {sortBy === "count" && (
                        <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-purple-600 select-none whitespace-nowrap"
                    onClick={() => {
                      if (sortBy === "count") {
                        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                      } else {
                        setSortBy("count");
                        setSortOrder("desc");
                      }
                    }}
                    title="f_char"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>f_char</span>
                      {sortBy === "count" && (
                        <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                      )}
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-right min-w-[130px]">
                    Frecvență relativă (%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedItems.map((item, idx) => {
                  const safeTotal =
                    analysis.totalLetters > 0 ? analysis.totalLetters : 1;
                  const fChar = item.count / safeTotal;

                  return (
                    <tr
                      key={`${componentId}-${item.char}-${idx}`}
                      className="hover:bg-purple-50/40 transition-colors"
                    >
                      <td className="py-2 px-3 text-center text-gray-400 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-sm text-gray-900">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-gray-100 text-purple-900 border border-gray-200/60 min-w-[24px] text-center">
                          {item.char}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-purple-700">
                        {item.count.toLocaleString("ro-RO")}
                      </td>
                      <td
                        className="py-2 px-3 text-right text-xs font-semibold whitespace-nowrap"
                        title={`f_Char = Nx (${item.count.toLocaleString("ro-RO")}) / Ntotal (${analysis.totalLetters.toLocaleString("ro-RO")}) = ${(item.count / safeTotal).toFixed(6)}`}
                      >
                        <span className="inline-block px-1.5 py-0.5 text-purple-700">
                          {fChar.toFixed(5)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-semibold text-purple-700 w-14 text-right">
                            {item.relativeFrequency.toFixed(3)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5" style={{ marginBottom: 15 }}>
              Frecvența relativă (%)
            </h4>
            <span className="text-[11px] text-gray-400">
              {filterMode === "all"
                ? "Top 30 caractere"
                : filterMode === "vowels"
                  ? "Toate vocalele"
                  : filterMode === "consonants"
                    ? "Toate consoanele"
                    : "Toate literele"}
            </span>
          </div>
          <div className="h-56 sm:h-64 w-full bg-white/60 p-3 rounded-xl border border-gray-100">
            <canvas ref={barCanvasRef} />
          </div>
        </div>

        <div className="space-y-2 pt-2 ">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5" style={{ marginBottom: 15 }}>
              Distribuția completă
            </h4>
            <span className="text-[11px] text-purple-600 font-medium">
              Toate cele {displayedItems.length} litere afișate individual
            </span>
          </div>
          <div className="h-72 sm:h-80 w-full bg-white/60 p-3 rounded-xl border border-gray-100">
            <canvas ref={pieCanvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
