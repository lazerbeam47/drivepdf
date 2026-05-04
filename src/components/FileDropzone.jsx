import { AlertCircle, FileText, Trash2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { cn, formatBytes } from "../lib/utils";
import { Button } from "./Button";
import { GoogleDriveImportButton } from "./GoogleDriveButtons";
import "../lib/pdfWorker";

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024;

export function FileDropzone({
  files,
  onFilesChange,
  multiple = false,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  label = "Drop PDFs here",
  description = "Files stay in your browser.",
  showGoogleDrive = true,
}) {
  const [dragging, setDragging] = useState(false);
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);

  const mergeFiles = useCallback(
    (incoming) => {
      onFilesChange(multiple ? [...files, ...incoming] : incoming.slice(0, 1));
    },
    [files, multiple, onFilesChange],
  );

  const addFiles = useCallback(
    (fileList) => {
      const nextMessages = [];
      const incoming = [...fileList].filter((file) => {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

        if (!isPdf) {
          nextMessages.push(`${file.name} was skipped because it is not a PDF.`);
          return false;
        }

        if (file.size > maxSizeBytes) {
          nextMessages.push(
            `${file.name} is larger than ${formatBytes(maxSizeBytes)} and may process slowly.`,
          );
        }

        return true;
      });

      setMessages(nextMessages);
      if (incoming.length === 0) return;
      mergeFiles(incoming);
    },
    [maxSizeBytes, mergeFiles],
  );

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "group relative flex min-h-56 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed p-6 text-center transition sm:p-8",
          dragging
            ? "border-slate-950 bg-slate-100 shadow-sm ring-4 ring-slate-200 dark:border-white dark:bg-zinc-900 dark:ring-zinc-800"
            : "border-slate-300 bg-white hover:border-slate-500 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500 dark:hover:bg-zinc-900/70",
        )}
      >
        <span
          className={cn(
            "mb-4 flex size-14 items-center justify-center rounded-xl transition",
            dragging
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "bg-slate-100 text-slate-900 group-hover:bg-white dark:bg-zinc-900 dark:text-slate-100 dark:group-hover:bg-zinc-800",
          )}
        >
          <Upload size={24} />
        </span>
        <span className="text-lg font-semibold">{dragging ? "Release to add PDFs" : label}</span>
        <span className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </span>
        <span className="mt-4 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 dark:border-zinc-800 dark:text-slate-400">
          PDF only · Max recommended {formatBytes(maxSizeBytes)}
        </span>
        {showGoogleDrive && (
          <span className="mt-4" onClick={(event) => event.stopPropagation()}>
            <GoogleDriveImportButton multiple={multiple} onFilesImported={mergeFiles} />
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {messages.length > 0 && (
        <div className="mt-4 space-y-2">
          {messages.map((message) => (
            <div
              key={message}
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200"
            >
              <AlertCircle className="mt-0.5 shrink-0" size={16} />
              <span>{message}</span>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold">
                {files.length} {files.length === 1 ? "file" : "files"} ready
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatBytes(files.reduce((total, file) => total + file.size, 0))} selected
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                setMessages([]);
                onFilesChange([]);
              }}
            >
              <Trash2 size={15} />
              Clear all
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {files.map((file, index) => {
              const overSize = file.size > maxSizeBytes;

              return (
                <div
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className="grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/70"
                >
                  <PdfThumbnail file={file} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatBytes(file.size)}</span>
                      {overSize && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                          Large file
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    aria-label={`Remove ${file.name}`}
                    variant="ghost"
                    size="sm"
                    className="w-9 px-0"
                    onClick={() =>
                      onFilesChange(files.filter((_, fileIndex) => fileIndex !== index))
                    }
                  >
                    <X size={16} />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PdfThumbnail({ file }) {
  return (
    <div className="flex h-20 w-[72px] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <Document
        file={file}
        loading={<FileText className="text-slate-400" size={22} />}
        error={<FileText className="text-slate-400" size={22} />}
      >
        <Page
          pageNumber={1}
          width={58}
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      </Document>
    </div>
  );
}
