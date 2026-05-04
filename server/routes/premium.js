import { Router } from "express";
import { z } from "zod";
import { requireAuth, requirePremium } from "../middleware/auth.js";
import { HttpError } from "../middleware/errors.js";
import { premiumUpload } from "../middleware/upload.js";
import { runBatchJob, runSinglePdfJob } from "../services/pythonJobs.js";

export const premiumRouter = Router();

const compressionSchema = z.object({
  optimizeLevel: z.enum(["1", "2", "3"]).default("3"),
});

const batchSchema = z.object({
  operation: z.enum(["ocr", "compress"]),
  optimizeLevel: z.enum(["1", "2", "3"]).default("3"),
});

premiumRouter.use(requireAuth, requirePremium);

premiumRouter.post("/ocr", premiumUpload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, "PDF file is required.");
    const result = await runSinglePdfJob({ command: "ocr", file: req.file });
    sendDownload(res, result, "application/pdf");
  } catch (err) {
    next(err);
  }
});

premiumRouter.post("/compress", premiumUpload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, "PDF file is required.");
    const input = compressionSchema.parse(req.body);
    const result = await runSinglePdfJob({
      command: "compress",
      file: req.file,
      args: [input.optimizeLevel],
    });
    sendDownload(res, result, "application/pdf");
  } catch (err) {
    next(formatZodError(err));
  }
});

premiumRouter.post("/batch", premiumUpload.array("files", 50), async (req, res, next) => {
  try {
    if (!req.files?.length) throw new HttpError(400, "At least one PDF file is required.");
    const input = batchSchema.parse(req.body);
    const result = await runBatchJob({
      files: req.files,
      operation: input.operation,
      args: [input.optimizeLevel],
    });
    sendDownload(res, result, "application/zip");
  } catch (err) {
    next(formatZodError(err));
  }
});

function sendDownload(res, result, contentType) {
  res.setHeader("content-type", contentType);
  res.setHeader("content-disposition", `attachment; filename="${result.fileName}"`);
  res.on("finish", result.cleanup);
  res.send(result.bytes);
}

function formatZodError(err) {
  if (err instanceof z.ZodError) {
    return new HttpError(400, "Invalid request body.", err.flatten().fieldErrors);
  }

  return err;
}
