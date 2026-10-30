"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Chart as ChartType } from "chart.js";
import Chart from "chart.js/auto";
import type { DocumentAnalysis } from "@/lib/fileParser";
import { ALL_COMPARED_LETTERS } from "@/lib/linguisticData";

interface ComparativeAnalysisSectionProps {
  analyses: DocumentAnalysis[];
}

export default function ComparativeAnalysisSection({
  analyses,
}: ComparativeAnalysisSectionProps) {
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartType | null>(null);

  const file1: DocumentAnalysis | undefined = analyses[0];
  const file2: DocumentAnalysis | undefined = analyses[1];

  const roFile = analyses.find((a) => a.alphabetType === "romanian");
  const enFile = analyses.find((a) => a.alphabetType === "english");

  const targetRo: DocumentAnalysis | undefined = roFile || file1;
  const targetEn: DocumentAnalysis | undefined =
    enFile && enFile !== targetRo ? enFile : file2 || file1;

  const roData = useMemo(() => {
    if (!targetRo) return ALL_COMPARED_LETTERS.map(() => 0);

    const freqMap = new Map<string, number>();
    for (const item of targetRo.letterFrequencies) {
      freqMap.set(item.char, item.relativeFrequency);
    }

    return ALL_COMPARED_LETTERS.map((letter) => {
      let val = freqMap.get(letter) || 0;
      if (letter === "ș") val += freqMap.get("ş") || 0;
      if (letter === "ț") val += freqMap.get("ţ") || 0;
      return Number(val.toFixed(3));
    });
  }, [targetRo]);

  const enData = useMemo(() => {
    if (!targetEn) return ALL_COMPARED_LETTERS.map(() => 0);

    const freqMap = new Map<string, number>();
    for (const item of targetEn.letterFrequencies) {
      freqMap.set(item.char, item.relativeFrequency);
    }

    return ALL_COMPARED_LETTERS.map((letter) => {
      const val = freqMap.get(letter) || 0;
      return Number(val.toFixed(3));
    });
  }, [targetEn]);

  const roLabel = `(${targetRo.fileName})`;

  const enLabel = `(${targetEn.fileName})`;

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
        labels: ALL_COMPARED_LETTERS,
        datasets: [
          {
            label: roLabel,
            data: roData,
            backgroundColor: "rgba(139, 92, 246, 0.8)", // Purple
            borderColor: "#8b5cf6",
            borderWidth: 1.5,
            borderRadius: 4,
            barPercentage: 0.85,
            categoryPercentage: 0.8,
          },
          {
            label: enLabel,
            data: enData,
            backgroundColor: "rgba(14, 165, 233, 0.8)", // Sky blue
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
                  const valRo = Number(context[0].parsed.y);
                  const valEn = Number(context[1].parsed.y);
                  const diff = valRo - valEn;
                  const sign = diff >= 0 ? "+" : "";
                  return `Diferență: ${sign}${diff.toFixed(3)}%`;
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
  }, [enData, enLabel, roData, roLabel]);

  if (analyses.length < 2) {
    return null;
  }

  return (
    <section className="w-full mt-10 mb-16 space-y-8">
      <div className="summary-card p-6 sm:p-8 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-xl space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 flex items-center gap-2">
            Frecvențele comparative ale literelor din ambele documente
          </h3>
        </div>

        <div className="h-80 sm:h-96 w-full p-2 bg-gradient-to-b from-white/80 to-purple-50/20 rounded-xl border border-purple-50">
          <canvas ref={chartCanvasRef} />
        </div>
      </div>
    </section>
  );
}
