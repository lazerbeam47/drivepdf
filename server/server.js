import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import { authRouter } from "./routes/auth.js";
import { billingRouter } from "./routes/billing.js";
import { healthRouter } from "./routes/health.js";
import { premiumRouter } from "./routes/premium.js";
import { usageRouter } from "./routes/usage.js";

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
  app.use(express.json({ limit: "1mb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/usage", usageRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/premium", premiumRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
