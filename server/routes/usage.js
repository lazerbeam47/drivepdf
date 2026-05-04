import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errors.js";
import { getUsageSummary, recordUsage } from "../services/usage.js";

export const usageRouter = Router();

const usageSchema = z.object({
  tool: z.enum(["merge", "split", "compress", "rotate", "ocr", "batch"]),
  fileCount: z.number().int().positive().max(100),
  fileSizeBytes: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

usageRouter.use(requireAuth);

usageRouter.get("/summary", async (req, res, next) => {
  try {
    res.json({ usage: await getUsageSummary(req.user.id, req.user.plan) });
  } catch (err) {
    next(err);
  }
});

usageRouter.post("/events", async (req, res, next) => {
  try {
    const input = usageSchema.parse(req.body);
    const result = await recordUsage(req.user, input);

    if (!result.allowed) {
      throw new HttpError(402, result.reason, result.summary);
    }

    res.status(201).json({
      usageEvent: result.event,
      usage: result.summary,
    });
  } catch (err) {
    next(formatZodError(err));
  }
});

function formatZodError(err) {
  if (err instanceof z.ZodError) {
    return new HttpError(400, "Invalid request body.", err.flatten().fieldErrors);
  }

  return err;
}
