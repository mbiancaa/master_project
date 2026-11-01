"use client";

import { useRef, useState } from "react";
import {
  analyzeDocumentText,
  countLetters,
  type DocumentAnalysis,
  MIN_LETTERS_REQUIRED,
  parseFileText,
} from "@/lib/fileParser";
import DocumentSummary from "@/components/DocumentSummary";
import ComparativeAnalysisSection from "@/components/ComparativeAnalysisSection";
import SupportedLanguagesModal from "@/components/SupportedLanguagesModal";

const MAX_FILES = 6;

const ALLOWED_EXTENSIONS = new Set([".txt", ".docx", ".md", ".pdf"]);

interface FileInfo {
  id: string;
  file: File;
  name: string;
  size: number;
  status: "idle" | "valid" | "warning" | "invalid";
  letterCount?: number;
  errorMessage?: string;
}

interface ValidationReport {
  checked: boolean;
  allValid: boolean;
  invalidFiles: { name: string; count: number; error?: string }[];
  warningFiles: { name: string; count: number }[];
  validFiles: { name: string; count: number }[];
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function truncateName(name: string, max = 20): string {
  if (name.length <= max) return name;
  const ext = name.slice(name.lastIndexOf("."));
  return name.slice(0, max - ext.length - 1) + "…" + ext;
}

function isAllowed(file: File): boolean {
  const dot = file.name.lastIndexOf(".");
  if (dot === -1) return false;
  return ALLOWED_EXTENSIONS.has(file.name.slice(dot).toLowerCase());
}

export default function Home() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [analyses, setAnalyses] = useState<DocumentAnalysis[]>([]);
  const [isLanguagesModalOpen, setIsLanguagesModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFull = files.length >= MAX_FILES;
  const hasFiles = files.length > 0;

  const allFilesFailed =
    report?.checked === true &&
    files.length > 0 &&
    files.every((f) => f.status === "invalid");

  const isResetMode = analyses.length > 0 || allFilesFailed;

  const addFiles = (incoming: File[]) => {
    setUploadError("");
    setReport(null);
    setAnalyses([]);

    const invalid = incoming.filter((f) => !isAllowed(f));
    if (invalid.length > 0) {
      setUploadError(
        `Format neacceptat: ${invalid.map((f) => f.name).join(", ")}. Sunt permise doar: .txt · .docx · .md · .pdf`
      );
      return;
    }

    // Check for duplicate / identical files by filename
    const existingNames = new Set(files.map((f) => f.name.toLowerCase()));
    const seenIncoming = new Set<string>();
    const duplicateNames: string[] = [];

    for (const f of incoming) {
      const lowerName = f.name.toLowerCase();
      if (existingNames.has(lowerName) || seenIncoming.has(lowerName)) {
        duplicateNames.push(f.name);
      }
      seenIncoming.add(lowerName);
    }

    if (duplicateNames.length > 0) {
      setUploadError(
        `Nu puteți încărca fișiere identice (${duplicateNames.join(", ")}). Vă rugăm să selectați documente diferite.`
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFiles((prev) => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) return prev;
      const toAdd: FileInfo[] = incoming.slice(0, remaining).map((f) => ({
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
        file: f,
        name: f.name,
        size: f.size,
        status: "idle",
      }));
      return [...prev, ...toAdd];
    });

    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setUploadError("");
    setReport(null);
    setAnalyses([]);
  };

  const handleReset = () => {
    setFiles([]);
    setUploadError("");
    setReport(null);
    setAnalyses([]);
    setIsValidating(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleSubmit = async () => {
    if (!hasFiles || isValidating) return;

    setIsValidating(true);
    setUploadError("");
    setReport(null);
    setAnalyses([]);

    try {
      const computedAnalyses: DocumentAnalysis[] = [];

      const processed = await Promise.all(
        files.map(async (item) => {
          try {
            // 1. Extract raw text from .txt, .docx, .md, or .pdf
            const rawText = await parseFileText(item.file);

            // 2. Count letters
            const count = countLetters(rawText);
            if (count === 0) {
              throw new Error(
                "Documentul nu conține text analizabil (posibil imagine fără strat de text sau fișier gol)."
              );
            }
            const hasEnoughLetters = count >= MIN_LETTERS_REQUIRED;

            // Always compute analysis regardless of letter count
            const analysis = analyzeDocumentText(item.name, item.size, rawText);
            computedAnalyses.push(analysis);

            return {
              ...item,
              status: (hasEnoughLetters ? "valid" : "warning") as "valid" | "warning",
              letterCount: count,
              errorMessage: hasEnoughLetters
                ? undefined
                : `Atenție: are ${count.toLocaleString("ro-RO")} litere (sub pragul recomandat de 50.000)`,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (err: any) {
            return {
              ...item,
              status: "invalid" as const,
              letterCount: 0,
              errorMessage: err?.message || "Eroare la parsarea conținutului",
            };
          }
        })
      );

      setFiles(processed);

      const invalidList = processed
        .filter((f) => f.status === "invalid")
        .map((f) => ({
          name: f.name,
          count: f.letterCount ?? 0,
          error: f.errorMessage,
        }));

      const warningList = processed
        .filter((f) => f.status === "warning")
        .map((f) => ({
          name: f.name,
          count: f.letterCount ?? 0,
        }));

      const validList = processed
        .filter((f) => f.status === "valid")
        .map((f) => ({
          name: f.name,
          count: f.letterCount ?? 0,
        }));

      const canProceed = computedAnalyses.length > 0;

      setReport({
        checked: true,
        allValid: canProceed,
        invalidFiles: invalidList,
        warningFiles: warningList,
        validFiles: validList,
      });

      if (canProceed) {
        setAnalyses(computedAnalyses);
      }
    } catch {
      setUploadError("A apărut o eroare neașteptată la procesarea fișierelor.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <main className="gradient-bg relative flex flex-col items-center min-h-screen px-4 py-10 sm:px-6">
      {/* Absolute top-right info icon */}
      <button
        type="button"
        onClick={() => setIsLanguagesModalOpen(true)}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 group flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white text-purple-700 hover:text-purple-900 shadow-md hover:shadow-lg border border-purple-100 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95"
        title="Vezi limbile pe care le poate detecta platforma"
        aria-label="Informații limbi detectabile"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 transition-transform group-hover:rotate-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      </button>

      {/* Popup modal for detectable languages */}
      <SupportedLanguagesModal
        isOpen={isLanguagesModalOpen}
        onClose={() => setIsLanguagesModalOpen(false)}
      />

      <div
        className="relative z-10 flex flex-col items-center gap-6 w-full"
        style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 60, paddingBottom: 60 }}
      >
        <div className="text-center space-y-2 px-2 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
            Analizează documente textuale
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 select-none">
            Maxim {MAX_FILES} fișiere de tip .txt, .docx, .md sau .pdf (recomandat minim 50.000 litere)
          </p>
        </div>

        {/* Upload Card */}
        <div className="upload-card w-full max-w-xl overflow-hidden">
          {files.length > 0 && (
            <div className="docs-uploaded flex flex-wrap items-center gap-2 flex-1 min-w-0">
              {files.map((f) => {
                const isInvalid = f.status === "invalid";
                const isWarning = f.status === "warning";
                const isValid = f.status === "valid";

                return (
                  <div
                    key={f.id}
                    className={`file-chip ${isInvalid
                      ? "file-chip-invalid"
                      : isWarning
                        ? "file-chip-warning"
                        : isValid
                          ? "file-chip-valid"
                          : ""
                      }`}
                  >
                    {isInvalid ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 text-red-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </svg>
                    ) : isWarning ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 text-amber-500 flex-shrink-0"
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
                    ) : isValid ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 text-green-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 text-purple-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>
                    )}

                    <span
                      className={`text-xs leading-none ${isInvalid
                        ? "text-red-700 font-medium"
                        : isWarning
                          ? "text-amber-800 font-medium"
                          : isValid
                            ? "text-green-700 font-medium"
                            : "text-gray-600"
                        }`}
                      title={`${f.name} · ${formatSize(f.size)}${f.letterCount !== undefined
                        ? ` · ${f.letterCount.toLocaleString("ro-RO")} litere`
                        : ""
                        }`}
                    >
                      {truncateName(f.name)}
                    </span>

                    {f.letterCount !== undefined && (
                      <span
                        className={`chip-badge ${isInvalid
                          ? "chip-badge-invalid"
                          : isWarning
                            ? "chip-badge-warning"
                            : "chip-badge-valid"
                          }`}
                      >
                        {f.letterCount.toLocaleString("ro-RO")}
                      </span>
                    )}

                    <button
                      className="chip-remove"
                      onClick={() => removeFile(f.id)}
                      title={`Elimină ${f.name}`}
                      aria-label={`Elimină ${f.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div
            className={`drop-zone flex flex-col items-center justify-center gap-2 px-6 cursor-pointer ${isDragOver ? "drag-over" : ""
              } ${isFull ? "pointer-events-none" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isFull && inputRef.current?.click()}
          >
            {isValidating ? (
              <div className="flex items-center gap-2 text-purple-600 text-sm font-medium py-2">
                <svg
                  className="animate-spin w-4 h-4 text-purple-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Se analizează conținutul fișierelor...</span>
              </div>
            ) : report?.checked ? (
              report.invalidFiles.length > 0 ? (
                <div className="status-err text-xs sm:text-sm text-center space-y-1.5 py-1">
                  <p className="font-semibold text-sm text-red-600">
                    ⚠️ Următoarele fișiere nu au putut fi procesate:
                  </p>
                  <div className="space-y-0.5 text-xs text-red-500">
                    {report.invalidFiles.map((inv) => (
                      <p key={inv.name}>
                        <span className="font-medium text-red-700">{inv.name}</span>:{" "}
                        {inv.error}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="status-ok text-sm sm:text-base text-center space-y-1 py-1">
                  <p className="font-semibold text-sm text-green-600">
                    ✓ Conținutul fișierelor a fost procesat cu succes.
                  </p>
                </div>
              )
            ) : uploadError ? (
              <p className="status-err text-sm sm:text-base text-center">
                {uploadError}
              </p>
            ) : isFull ? (
              <p className="text-sm sm:text-base text-gray-400 text-center">
                Numărul maxim de fișiere a fost atins.
              </p>
            ) : (
              <p className="text-sm sm:text-base text-gray-400 text-center select-none">
                Încarcă un fișier pentru a începe analiza.
              </p>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".txt,.docx,.md,.pdf"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />

          <button
            className="btn-plus flex-shrink-0"
            disabled={isFull || isValidating}
            onClick={() => inputRef.current?.click()}
            title={
              isFull
                ? `Limita de fișiere atinsă (maxim ${MAX_FILES})`
                : "Adaugă fișier (.txt, .docx, .md, .pdf)"
            }
            aria-label="Adaugă fișier"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          <button
            className={`btn-arrow flex-shrink-0 ${isResetMode ? "btn-reset" : ""}`}
            disabled={isResetMode ? false : (!hasFiles || isValidating)}
            onClick={isResetMode ? handleReset : handleSubmit}
            title={
              isValidating
                ? "Se procesează..."
                : isResetMode
                  ? "Resetează și elimină fișierele"
                  : hasFiles
                    ? "Analizează fișierele"
                    : "Adaugă cel puțin un fișier"
            }
            aria-label={
              isResetMode ? "Resetează analiza" : "Analizează fișierele"
            }
          >
            {isValidating ? (
              <svg
                className="animate-spin w-4 h-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : isResetMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            )}
          </button>
        </div>

        {/* ── Summaries Section ── */}
        {analyses.length > 0 && (
          <section className="w-full mt-4 mb-10 space-y-6" style={{ marginTop: 0 }}>
            <div
              className={`grid grid-cols-1 ${analyses.length > 1 ? "lg:grid-cols-2" : "mx-auto"
                } gap-6 sm:gap-8 items-start`}
              style={{ marginTop: 60 }}
            >
              {analyses.map((analysis, index) => (
                <DocumentSummary
                  key={`${analysis.fileName}-${index}`}
                  analysis={analysis}
                  colorScheme="purple"
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Comparative Section (only when 2 documents analyzed) ── */}
        {analyses.length >= 2 && (
          <ComparativeAnalysisSection analyses={analyses} />
        )}
      </div>
    </main>
  );
}
