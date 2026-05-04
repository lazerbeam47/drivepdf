import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { FileDropzone } from "../components/FileDropzone";
import { PdfPreview } from "../components/PdfPreview";
import { ResultActions } from "../components/ResultActions";
import { ToolLayout } from "../components/ToolLayout";
import { useUsageTracker } from "../hooks/useUsageTracker";
import { getPdfPageCount, splitPdf } from "../lib/pdf";

export function SplitTool() {
  const [files, setFiles] = useState([]);
  const [selection, setSelection] = useState("1-3");
  const [pageCount, setPageCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const { recordUsage, usageError } = useUsageTracker();
  const file = files[0];

  useEffect(() => {
    if (!file) {
      setPageCount(0);
      return;
    }
    getPdfPageCount(file).then(setPageCount).catch(() => setPageCount(0));
  }, [file]);

  async function handleSplit() {
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      await recordUsage({ tool: "split", files, durationMs: 0, metadata: { selection } });
      const bytes = await splitPdf(file, selection);
      setResult(bytes);
    } catch (err) {
      setError(err.message || "Unable to split this PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract page ranges such as 1-3 or specific pages such as 2,4,6."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <FileDropzone files={files} onFilesChange={setFiles} label="Drop one PDF to split" />
          <PdfPreview file={file} />
        </div>
        <aside className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold">Pages</h2>
          <label className="mt-5 block text-sm font-medium" htmlFor="pages">
            Range or pages
          </label>
          <input
            id="pages"
            value={selection}
            onChange={(event) => setSelection(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-white"
            placeholder="1-3,5"
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {pageCount ? `${pageCount} pages detected.` : "Add a PDF to detect pages."}
          </p>
          {(error || usageError) && <p className="mt-4 text-sm text-rose-500">{error || usageError}</p>}
          <Button className="mt-6 w-full" disabled={!file || busy} onClick={handleSplit}>
            {busy ? "Extracting..." : "Extract pages"}
          </Button>
          <ResultActions bytes={result} fileName="drivepdf-extracted.pdf" />
        </aside>
      </div>
    </ToolLayout>
  );
}
