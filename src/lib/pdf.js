import { degrees, PDFDocument } from "pdf-lib";
import { readFileBytes } from "./utils";
import { pdfjs } from "./pdfWorker";

export async function mergePdfs(files) {
  const output = await PDFDocument.create();

  for (const file of files) {
    const source = await PDFDocument.load(await readFileBytes(file));
    const copiedPages = await output.copyPages(source, source.getPageIndices());
    copiedPages.forEach((page) => output.addPage(page));
  }

  return output.save({ useObjectStreams: true });
}

export function parsePageSelection(input, pageCount) {
  if (!input.trim()) return [];
  const selected = new Set();

  for (const chunk of input.split(",")) {
    const part = chunk.trim();
    if (!part) continue;

    if (part.includes("-")) {
      const [startRaw, endRaw] = part.split("-");
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) continue;
      for (let page = start; page <= end; page += 1) {
        if (page >= 1 && page <= pageCount) selected.add(page - 1);
      }
    } else {
      const page = Number(part);
      if (Number.isInteger(page) && page >= 1 && page <= pageCount) {
        selected.add(page - 1);
      }
    }
  }

  return [...selected].sort((a, b) => a - b);
}

export async function splitPdf(file, selection) {
  const source = await PDFDocument.load(await readFileBytes(file));
  const output = await PDFDocument.create();
  const pageIndices = parsePageSelection(selection, source.getPageCount());

  if (pageIndices.length === 0) {
    throw new Error("Enter a valid page range such as 1-3 or 2,4,6.");
  }

  const pages = await output.copyPages(source, pageIndices);
  pages.forEach((page) => output.addPage(page));
  return output.save({ useObjectStreams: true });
}

export async function compressPdf(file, quality) {
  const buffer = await file.arrayBuffer();
  const source = await pdfjs.getDocument({ data: buffer.slice(0) }).promise;
  const output = await PDFDocument.create();
  const scale = quality >= 80 ? 1.35 : quality >= 60 ? 1.1 : 0.85;
  const jpegQuality = Math.min(0.95, Math.max(0.35, quality / 100));

  for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
    const page = await source.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const naturalViewport = page.getViewport({ scale: 1 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvasContext: context, viewport }).promise;

    const jpegBytes = await canvasToBytes(canvas, jpegQuality);
    const image = await output.embedJpg(jpegBytes);
    const outputPage = output.addPage([naturalViewport.width, naturalViewport.height]);

    outputPage.drawImage(image, {
      x: 0,
      y: 0,
      width: naturalViewport.width,
      height: naturalViewport.height,
    });
  }

  output.setCreator("DrivePDF");
  output.setProducer(`DrivePDF JPEG quality ${quality}`);

  return output.save({ useObjectStreams: true });
}

export async function rotatePdf(file, rotation) {
  const source = await PDFDocument.load(await readFileBytes(file));
  source.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
  });

  return source.save({ useObjectStreams: true });
}

export async function getPdfPageCount(file) {
  const source = await PDFDocument.load(await readFileBytes(file));
  return source.getPageCount();
}


async function canvasToBytes(canvas, quality) {
  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });

  if (!blob) {
    throw new Error("Unable to render this PDF for compression.");
  }

  return new Uint8Array(await blob.arrayBuffer());
}
