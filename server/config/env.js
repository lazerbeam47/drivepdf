import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://127.0.0.1:5173"),
  JWT_SECRET: z.string().min(24).default("development-only-secret-change-before-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(""),
  PYTHON_BIN: z.string().default("python3"),
  PREMIUM_JOB_TIMEOUT_MS: z.coerce.number().int().positive().default(300000),
});

export const env = schema.parse(process.env);

export function hasRazorpayConfig() {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}
