import { useMemo, useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "./Button";
import "../lib/pdfWorker";

export function PdfPreview({ file, title = "Preview" }) {
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const source = useMemo(() => file || null, [file]);

  if (!source) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-400">
        Add a PDF to preview it.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {pages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Prev
            </Button>
            <span className="w-16 text-center text-xs text-slate-500">
              {page} / {pages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      <div className="pdf-page flex min-h-72 justify-center overflow-hidden rounded-lg bg-slate-100 p-3 dark:bg-zinc-900">
        <Document
          file={source}
          onLoadSuccess={({ numPages }) => {
            setPages(numPages);
            setPage(1);
          }}
          loading={<p className="self-center text-sm text-slate-500">Loading preview...</p>}
          error={<p className="self-center text-sm text-rose-500">Preview unavailable.</p>}
        >
          <Page pageNumber={page} width={360} />
        </Document>
      </div>
    </div>
  );
}
