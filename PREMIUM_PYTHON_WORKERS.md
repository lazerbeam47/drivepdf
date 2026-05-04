# Premium Python Workers

DrivePDF uses Python only for the heavy Premium features:

- OCR to searchable PDF
- Advanced/high-quality compression
- Heavy batch processing

The Express API receives PDF uploads and calls scripts in `server/python/`. Those scripts call `ocrmypdf`.

## Install System Dependencies

OCRmyPDF depends on external tools such as Ghostscript, Tesseract OCR, and qpdf. On macOS:

```bash
brew install ocrmypdf
```

Or install Python dependencies from this repo:

```bash
python3 -m pip install -r requirements.txt
```

If you use pip, make sure OCRmyPDF’s system dependencies are also installed.

## Environment

```bash
PYTHON_BIN=python3
PREMIUM_JOB_TIMEOUT_MS=300000
```

## API Endpoints

All endpoints require a JWT for a user with `plan: "premium"`.

`POST /api/premium/ocr`

- Multipart field: `file`
- Returns: searchable PDF
- Worker: `server/python/ocr.py`

`POST /api/premium/compress`

- Multipart field: `file`
- Multipart field: `optimizeLevel`, one of `1`, `2`, `3`
- Returns: compressed PDF
- Worker: `server/python/compress.py`

`POST /api/premium/batch`

- Multipart field: `files`
- Multipart field: `operation`, one of `ocr`, `compress`
- Multipart field: `optimizeLevel`, one of `1`, `2`, `3`
- Returns: ZIP of processed PDFs
- Worker: `server/python/batch.py`

## Notes

The browser keeps the Free tools client-side. Premium workloads are routed to Python because OCR, compression, and multi-file processing are CPU-heavy and need reliable native PDF tooling.
