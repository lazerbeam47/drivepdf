# DrivePDF

DrivePDF is a privacy-first, browser-first PDF toolkit for merging, splitting, compressing, rotating and performing OCR on PDFs. The app runs most PDF operations locally in the browser; optional Premium features (OCR, advanced compression, batch jobs) run on server-side Python workers.

Key features

- Merge, split, rotate, compress PDFs in-browser
- PDF preview and page selection UI
- Optional Premium server-side features: OCR, advanced compression, batch processing
- Google Drive integration for import/export
- Usage tracking and Stripe/Razorpay-style billing hooks (Razorpay helper included)

Tech stack

- Frontend: React + Vite (ESM)
- Client PDF handling: pdf-lib + browser workers
- Backend (optional): Express.js (server/) with small Python worker scripts (server/python/)
- Python workers: OCRmyPDF, qpdf and other optional system deps for OCR/compression

Repo layout (important files)

- Frontend: `src/` (App, pages, components, lib)
  - Entry: `src/main.jsx`, `src/App.jsx`
  - Components: `src/components/`
  - Helpers: `src/lib/` (pdf utilities, premiumApi, googleDrive)
- Backend (optional): `server/`
  - API entry: `server/index.js`, `server/server.js`
  - Routes: `server/routes/`
  - Python workers: `server/python/` (ocr.py, compress.py, batch.py)
  - Services: `server/services/` (pythonJobs, razorpay, db)
- Docs: `BACKEND_API.md`, `GOOGLE_DRIVE_INTEGRATION.md`, `PREMIUM_PYTHON_WORKERS.md`

Quick start (development)

1. Install JS dependencies

   ```bash
   npm install
   ```

2. Copy environment example and edit values

   ```bash
   cp .env.example .env.local
   # Edit .env.local (Razorpay keys, Google Drive client id/secret, JWT secret, etc.)
   ```

   See `server/config/env.js` for required backend env vars.

3. Run the frontend

   ```bash
   npm run dev
   ```

4. (Optional) Run the API server

   ```bash
   npm run dev:api
   ```

5. Run frontend + API together
   ```bash
   npm run dev:full
   ```

Python / Premium worker setup (optional)

- If you plan to run Premium features, install Python deps:
  ```bash
  python3 -m pip install -r requirements.txt
  ```
- OCRmyPDF and advanced compression require system packages (Ghostscript, Tesseract, qpdf). See `PREMIUM_PYTHON_WORKERS.md` for platform-specific setup.

Build & deploy

- Build frontend for production
  ```bash
  npm run build
  ```
- Start API in production
  ```bash
  npm run start:api
  ```
- Recommended for production:
  - Use a real DB instead of the demo `server/services/db.js`
  - Securely provide JWT and payment keys via environment variables
  - Ensure Python workers and required system binaries are present if Premium features are enabled

Useful scripts (from package.json)

- `npm run dev` — start Vite dev server
- `npm run build` — build production frontend
- `npm run dev:api` — start Express API in dev mode
- `npm run dev:full` — run frontend + API for local development
- `npm run lint` — run linter

Links & docs

- Backend API reference: `BACKEND_API.md`
- Google Drive integration: `GOOGLE_DRIVE_INTEGRATION.md`
- Premium Python workers notes: `PREMIUM_PYTHON_WORKERS.md`
- Python requirements: `requirements.txt`

Contributing

- Keep UI components small and focused (see `src/components/`)
- Run lint before opening PRs: `npm run lint`
- Provide reproducible steps for bugs and include relevant logs

License & security

- This repository is provided as example/demo code. Review and replace any demo services, keys, and secrets before deploying to production.

If you want a shorter README or a version specialized for "frontend-only" or "server-only" deployment, tell me which one and I will create it.
