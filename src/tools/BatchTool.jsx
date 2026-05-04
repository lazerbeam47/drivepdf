import { useState } from "react";
import { Button } from "../components/Button";
import { FileDropzone } from "../components/FileDropzone";
import { PremiumGate } from "../components/PremiumGate";
import { ResultActions } from "../components/ResultActions";
import { ToolLayout } from "../components/ToolLayout";
import { useAuth } from "../hooks/useAuth";
import { premiumBatchProcess, recordPremiumUsage } from "../lib/premiumApi";

const operations = [
  { id: "compress", label: "Advanced compression" },
  { id: "ocr", label: "Searchable OCR PDFs" },
];

export function BatchTool() {
  const [files, setFiles] = useState([]);
  const [operation, setOperation] = useState("compress");
  const [quality, setQuality] = useState(70);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const auth = useAuth();

  async function handleBatch() {
    setBusy(true);
    setError("");
    setResult(null);

    try {
      await recordPremiumUsage({ token: auth.token, tool: "batch", files, metadata: { operation } });
      const output = await premiumBatchProcess({
        token: auth.token,
        files,
        operation,
        optimizeLevel: optimizeLevelFromQuality(quality),
      });
      setResult(output);
    } catch (err) {
      setError(err.message || "Unable to finish this batch.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolLayout
      title="Batch Workflows"
      description="Send many PDFs to Python workers for OCRmyPDF compression or searchable OCR output."
    >
      <PremiumGate title="Batch workflows are included in Premium">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <FileDropzone
            files={files}
            onFilesChange={setFiles}
            multiple
            label="Drop PDFs for batch processing"
          />
          <aside className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold">Batch settings</h2>
            <div className="mt-5 grid gap-2">
              {operations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOperation(item.id)}
                  className={`h-11 rounded-lg border px-3 text-left text-sm font-medium transition ${
                    operation === item.id
                      ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                      : "border-slate-200 bg-white hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {operation === "compress" && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Quality</span>
                  <span className="text-slate-500">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="95"
                  value={quality}
                  onChange={(event) => setQuality(Number(event.target.value))}
                  className="w-full accent-slate-950 dark:accent-white"
                />
              </div>
            )}

            {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
            <Button className="mt-6 w-full" disabled={files.length === 0 || busy} onClick={handleBatch}>
              {busy ? "Processing in Python..." : "Run Python batch"}
            </Button>
          </aside>
        </div>

        {result && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold">Batch ZIP ready</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              The Python worker returned a ZIP with all processed PDFs.
            </p>
            <ResultActions bytes={result.bytes} fileName={result.fileName} downloadLabel="Download ZIP" />
          </div>
        )}
      </PremiumGate>
    </ToolLayout>
  );
}

function optimizeLevelFromQuality(quality) {
  if (quality >= 80) return "1";
  if (quality >= 55) return "2";
  return "3";
}
