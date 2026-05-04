import { useState } from "react";
import { Button } from "../components/Button";
import { FileDropzone } from "../components/FileDropzone";
import { ResultActions } from "../components/ResultActions";
import { ToolLayout } from "../components/ToolLayout";
import { useUsageTracker } from "../hooks/useUsageTracker";
import { mergePdfs } from "../lib/pdf";

export function MergeTool() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const { recordUsage, usageError } = useUsageTracker();

  async function handleMerge() {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      await recordUsage({ tool: "merge", files, durationMs: 0 });
      const bytes = await mergePdfs(files);
      setResult(bytes);
    } catch (err) {
      setError(err.message || "Unable to merge these PDFs.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolLayout
      title="Merge PDFs"
      description="Combine multiple PDFs into one file. The merge happens locally in your browser."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <FileDropzone files={files} onFilesChange={setFiles} multiple label="Drop PDFs to merge" />
        <aside className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold">Output</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Files are merged in the order shown. Remove and re-add files to change the order.
          </p>
          {(error || usageError) && <p className="mt-4 text-sm text-rose-500">{error || usageError}</p>}
          <Button className="mt-6 w-full" disabled={files.length < 2 || busy} onClick={handleMerge}>
            {busy ? "Merging..." : "Merge PDFs"}
          </Button>
          <ResultActions bytes={result} fileName="drivepdf-merged.pdf" />
        </aside>
      </div>
    </ToolLayout>
  );
}
