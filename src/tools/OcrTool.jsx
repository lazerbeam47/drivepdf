import { useState } from "react";
import { Button } from "../components/Button";
import { FileDropzone } from "../components/FileDropzone";
import { PremiumGate } from "../components/PremiumGate";
import { ResultActions } from "../components/ResultActions";
import { ToolLayout } from "../components/ToolLayout";
import { useAuth } from "../hooks/useAuth";
import { premiumOcrPdf, recordPremiumUsage } from "../lib/premiumApi";

export function OcrTool() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const auth = useAuth();
  const file = files[0];

  async function handleOcr() {
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);

    try {
      await recordPremiumUsage({ token: auth.token, tool: "ocr", files });
      const output = await premiumOcrPdf({ token: auth.token, file });
      setResult(output);
    } catch (err) {
      setError(err.message || "Unable to OCR this PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolLayout
      title="OCR PDF"
      description="Create a searchable PDF from scanned pages using OCRmyPDF on the Premium backend."
    >
      <PremiumGate title="OCR is included in Premium">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <FileDropzone files={files} onFilesChange={setFiles} label="Drop one scanned PDF" />
          <aside className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold">OCR output</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Python runs OCRmyPDF with deskew, page rotation detection, and PDF optimization.
            </p>

            {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}

            <Button className="mt-6 w-full" disabled={!file || busy} onClick={handleOcr}>
              {busy ? "Running OCR..." : "Run OCR"}
            </Button>
            <ResultActions bytes={result?.bytes} fileName={result?.fileName || "drivepdf-ocr.pdf"} />
          </aside>
        </div>
      </PremiumGate>
    </ToolLayout>
  );
}
