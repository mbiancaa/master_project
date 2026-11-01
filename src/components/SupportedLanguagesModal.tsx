"use client";

import { useEffect } from "react";
import { SUPPORTED_LANGUAGES } from "@/lib/languageDetector";

interface SupportedLanguagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportedLanguagesModal({
  isOpen,
  onClose,
}: SupportedLanguagesModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-purple-100/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 15 }}
      >
        <div style={{ paddingBottom: 20 }} className="p-5 sm:p-6 border-b border-gray-100 from-purple-50/60 via-indigo-50/40 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2
                id="modal-title"
                className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight"
              >
                Limbi detectabile
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Total {SUPPORTED_LANGUAGES.length} limbi cu alfabete și frecvențe lingvistice complet configurate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors"
            title="Închide fereastra"
            aria-label="Închide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 sm:px-6 py-3 overflow-y-auto space-y-2.5 flex-1 divide-y divide-gray-100">

          {SUPPORTED_LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-purple-50/20 p-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100/70 text-purple-800 font-bold font-mono text-xs flex-shrink-0 uppercase shadow-xs">
                  {lang.code}
                </span>
                <div className="min-w-0" style={{ padding: 10 }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-gray-900">{lang.name}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 text-purple-700">
                      ({lang.alphabetLength} {lang.alphabetLength === 1 ? "literă" : "litere"})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {lang.description}
                  </p>
                  {lang.specificChars && (
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-purple-900/80">
                      <span className="font-semibold text-gray-400 text-[10px] uppercase">
                        Specific:
                      </span>
                      <span className="font-mono px-1.5 py-0.5 font-medium">
                        {lang.specificChars}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
}
