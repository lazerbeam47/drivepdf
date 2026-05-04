import { Cloud, ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/Button";
import { PremiumGate } from "../components/PremiumGate";
import { useGoogleDrive } from "../hooks/useGoogleDrive";
import { formatBytes } from "../lib/utils";

export function DriveSync() {
  const drive = useGoogleDrive();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  async function handleSync() {
    setError("");
    try {
      setFiles(await drive.listPdfFiles());
    } catch (err) {
      setError(err.message || "Unable to sync Google Drive.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Drive Sync</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Sync DrivePDF with PDFs available to the app in your Google Drive account.
        </p>
      </div>

      <PremiumGate title="Full Drive sync is included in Premium">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-900">
                <Cloud size={21} />
              </span>
              <div>
                <h2 className="font-semibold">Google Drive PDFs</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Uses the same private Drive connection as import and save-back.
                </p>
              </div>
            </div>
            <Button disabled={!drive.configured || drive.busy} onClick={handleSync}>
              <RefreshCw size={16} />
              {drive.busy ? "Syncing..." : "Sync Drive"}
            </Button>
          </div>

          {(error || drive.error) && (
            <p className="mt-4 text-sm text-rose-500">{error || drive.error}</p>
          )}

          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file) => (
              <a
                key={file.id}
                href={file.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-medium">{file.name}</p>
                  <ExternalLink className="shrink-0 text-slate-500" size={16} />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {file.size ? formatBytes(Number(file.size)) : "Size unavailable"} ·{" "}
                  {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : "Recent"}
                </p>
              </a>
            ))}
          </div>

          {files.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-zinc-700 dark:text-slate-400">
              Sync to show PDFs created by or opened with DrivePDF.
            </div>
          )}
        </div>
      </PremiumGate>
    </main>
  );
}
