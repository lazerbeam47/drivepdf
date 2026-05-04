import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pythonDir = path.resolve(__dirname, "../python");

export async function runSinglePdfJob({ command, file, args = [] }) {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "drivepdf-"));
  const inputPath = path.join(workDir, safeName(file.originalname));
  const outputPath = path.join(workDir, outputName(file.originalname, command, "pdf"));

  try {
    await fs.writeFile(inputPath, file.buffer);
    await runPython([scriptPath(command), inputPath, outputPath, ...args], workDir);
    return {
      fileName: path.basename(outputPath),
      bytes: await fs.readFile(outputPath),
      cleanup: () => fs.rm(workDir, { recursive: true, force: true }),
    };
  } catch (err) {
    await fs.rm(workDir, { recursive: true, force: true });
    throw err;
  }
}

export async function runBatchJob({ files, operation, args = [] }) {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "drivepdf-batch-"));
  const inputDir = path.join(workDir, "input");
  const outputZipPath = path.join(workDir, "drivepdf-batch.zip");

  try {
    await fs.mkdir(inputDir, { recursive: true });
    await Promise.all(
      files.map((file, index) =>
        fs.writeFile(path.join(inputDir, `${index + 1}-${safeName(file.originalname)}`), file.buffer),
      ),
    );
    await runPython([scriptPath("batch"), inputDir, outputZipPath, operation, ...args], workDir);

    return {
      fileName: "drivepdf-batch.zip",
      bytes: await fs.readFile(outputZipPath),
      cleanup: () => fs.rm(workDir, { recursive: true, force: true }),
    };
  } catch (err) {
    await fs.rm(workDir, { recursive: true, force: true });
    throw err;
  }
}

function runPython(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(env.PYTHON_BIN, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new HttpError(504, "Premium processing timed out."));
    }, env.PREMIUM_JOB_TIMEOUT_MS);

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new HttpError(500, `Unable to start Python worker: ${err.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
        return;
      }

      const message = stderr.includes("No such file or directory")
        ? "OCRmyPDF is not installed or not available on PATH."
        : stderr.trim() || "Python processing failed.";
      reject(new HttpError(500, message));
    });
  });
}

function scriptPath(command) {
  return path.join(pythonDir, `${command}.py`);
}

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function outputName(name, command, extension) {
  const base = safeName(name).replace(/\.pdf$/i, "");
  return `${base}-${command}.${extension}`;
}
