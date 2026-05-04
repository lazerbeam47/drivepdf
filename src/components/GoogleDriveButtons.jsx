import { Cloud, CloudUpload } from "lucide-react";
import { useState } from "react";
import { useGoogleDrive } from "../hooks/useGoogleDrive";
import { Button } from "./Button";

export function GoogleDriveImportButton({ multiple, onFilesImported }) {
  const drive = useGoogleDrive();

  async function handleImport() {
    try {
      const files = await drive.importPdfFiles({ multiple });
      if (files.length > 0) onFilesImported(files);
    } catch {
      // The provider exposes the user-facing error state.
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={!drive.configured || drive.busy}
      onClick={handleImport}
      title={drive.configured ? "Import PDFs from Google Drive" : "Configure Google Drive env vars"}
    >
      <Cloud size={16} />
      {drive.connected ? "Import from Drive" : "Connect Drive"}
    </Button>
  );
}

export function SaveToDriveButton({ bytes, fileName }) {
  const drive = useGoogleDrive();
  const [savedFile, setSavedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!bytes) return;
    setSaving(true);
    setSavedFile(null);
    try {
      const result = await drive.savePdfFile({ bytes, name: fileName });
      setSavedFile(result);
    } catch {
      // The provider exposes the user-facing error state.
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3">
      <Button
        className="w-full"
        variant="secondary"
        disabled={!bytes || !drive.configured || drive.busy || saving}
        onClick={handleSave}
        title={drive.configured ? "Save PDF to Google Drive" : "Configure Google Drive env vars"}
      >
        <CloudUpload size={16} />
        {saving ? "Saving..." : "Save to Google Drive"}
      </Button>
      {savedFile?.webViewLink && (
        <a
          className="mt-2 block truncate text-xs font-medium text-slate-600 underline underline-offset-4 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          href={savedFile.webViewLink}
          target="_blank"
          rel="noreferrer"
        >
          Open {savedFile.name} in Drive
        </a>
      )}
      {drive.error && (
        <p className="mt-2 text-xs text-rose-500">
          {drive.error}
        </p>
      )}
    </div>
  );
}
