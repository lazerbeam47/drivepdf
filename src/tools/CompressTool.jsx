import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { FileDropzone } from "../components/FileDropzone";
import { PdfPreview } from "../components/PdfPreview";
import { ResultActions } from "../components/ResultActions";
import { ToolLayout } from "../components/ToolLayout";
import { useAuth } from "../hooks/useAuth";
import { useUsageTracker } from "../hooks/useUsageTracker";
import { compressPdf } from "../lib/pdf";
import { premiumCompressPdf, recordPremiumUsage } from "../lib/premiumApi";
import { formatBytes } from "../lib/utils";

export function CompressTool() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(70);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [compressed, setCompressed] = useState(null);
  const { recordUsage, usageError } = useUsageTracker();
  const auth = useAuth();
  const file = files[0];

  const compressedFile = useMemo(() => {
    if (!compressed) return null;
    return new File([compressed.bytes], "drivepdf-compressed.pdf", {
      type: "application/pdf",
    });
  }, [compressed]);

  useEffect(() => {
    setCompressed(null);
    setError("");
  }, [file, quality]);

  async function handleCompress() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      if (auth.isPremium) {
        await recordPremiumUsage({ token: auth.token, tool: "compress", files, metadata: { quality } });
        const output = await premiumCompressPdf({
          token: auth.token,
          file,
          optimizeLevel: optimizeLevelFromQuality(quality),
        });
        setCompressed({ bytes: output.bytes, size: output.bytes.byteLength, fileName: output.fileName });
      } else {
        await recordUsage({ tool: "compress", files, durationMs: 0, metadata: { quality } });
        const bytes = await compressPdf(file, quality);
        setCompressed({ bytes, size: bytes.byteLength, fileName: "drivepdf-compressed.pdf" });
      }
    } catch (err) {
      setError(err.message || "Unable to compress this PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolLayout
      title="Compress PDF"
      description="Choose a quality target and preview the before and after file in the browser."
    >
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <FileDropzone files={files} onFilesChange={setFiles} label="Drop one PDF to compress" />
          <aside className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">{auth.isPremium ? "Advanced quality" : "Quality"}</h2>
              <span className="text-sm text-slate-500">{quality}%</span>
            </div>
            <input
              type="range"
              min="35"
              max="95"
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
              className="mt-5 w-full accent-slate-950 dark:accent-white"
            />
            <div className="mt-5 rounded-lg bg-slate-50 p-3 text-sm dark:bg-zinc-900">
              <p>Original: {file ? formatBytes(file.size) : "0 B"}</p>
              <p className="mt-1">
                Optimized: {compressed ? formatBytes(compressed.size) : "Run compression"}
              </p>
            </div>
            {(error || usageError) && <p className="mt-4 text-sm text-rose-500">{error || usageError}</p>}
            <Button className="mt-6 w-full" disabled={!file || busy} onClick={handleCompress}>
              {busy
                ? "Compressing..."
                : auth.isPremium
                  ? "Run Python compression"
                  : "Compress PDF"}
            </Button>
            <ResultActions
              bytes={compressed?.bytes}
              fileName={compressed?.fileName || "drivepdf-compressed.pdf"}
            />
          </aside>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PdfPreview file={file} title="Before" />
          <PdfPreview file={compressedFile} title="After" />
        </div>
      </div>
    </ToolLayout>
  );
}

function optimizeLevelFromQuality(quality) {
  if (quality >= 80) return "1";
  if (quality >= 55) return "2";
  return "3";
}
