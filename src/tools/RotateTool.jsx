import { useState } from "react";
import { Button } from "../components/Button";
import { FileDropzone } from "../components/FileDropzone";
import { PdfPreview } from "../components/PdfPreview";
import { ResultActions } from "../components/ResultActions";
import { ToolLayout } from "../components/ToolLayout";
import { useUsageTracker } from "../hooks/useUsageTracker";
import { rotatePdf } from "../lib/pdf";

const rotations = [90, 180, 270];

export function RotateTool() {
  const [files, setFiles] = useState([]);
  const [rotation, setRotation] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const { recordUsage, usageError } = useUsageTracker();
  const file = files[0];

  async function handleRotate() {
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      await recordUsage({ tool: "rotate", files, durationMs: 0, metadata: { rotation } });
      const bytes = await rotatePdf(file, rotation);
      setResult(bytes);
    } catch (err) {
      setError(err.message || "Unable to rotate this PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolLayout
      title="Rotate Pages"
      description="Rotate every page in a PDF clockwise and download the updated file."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <FileDropzone files={files} onFilesChange={setFiles} label="Drop one PDF to rotate" />
          <PdfPreview file={file} />
        </div>
        <aside className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold">Rotation</h2>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {rotations.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRotation(value)}
                className={`h-11 rounded-lg border text-sm font-medium transition ${
                  rotation === value
                    ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-200 dark:hover:bg-zinc-900"
                }`}
              >
                {value} deg
              </button>
            ))}
          </div>
          {(error || usageError) && <p className="mt-4 text-sm text-rose-500">{error || usageError}</p>}
          <Button className="mt-6 w-full" disabled={!file || busy} onClick={handleRotate}>
            {busy ? "Rotating..." : "Rotate PDF"}
          </Button>
          <ResultActions bytes={result} fileName="drivepdf-rotated.pdf" />
        </aside>
      </div>
    </ToolLayout>
  );
}
