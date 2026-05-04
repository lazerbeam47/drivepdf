import { db } from "./db.js";

const MONTHLY_LIMITS = {
  free: 100,
  premium: Number.POSITIVE_INFINITY,
};

const MAX_FREE_FILE_SIZE = 25 * 1024 * 1024;

export function getPlanLimit(plan) {
  return MONTHLY_LIMITS[plan] ?? MONTHLY_LIMITS.free;
}

export async function getUsageSummary(userId, plan) {
  const events = await db.getUsageEvents(userId);
  const periodStart = startOfCurrentMonth();
  const currentPeriodEvents = events.filter((event) => new Date(event.createdAt) >= periodStart);
  const totalBytes = currentPeriodEvents.reduce((sum, event) => sum + (event.fileSizeBytes || 0), 0);
  const numericLimit = getPlanLimit(plan);
  const byTool = currentPeriodEvents.reduce((acc, event) => {
    acc[event.tool] = (acc[event.tool] || 0) + 1;
    return acc;
  }, {});

  return {
    plan,
    limit: numericLimit === Number.POSITIVE_INFINITY ? "unlimited" : numericLimit,
    used: currentPeriodEvents.length,
    remaining:
      numericLimit === Number.POSITIVE_INFINITY
        ? "unlimited"
        : Math.max(0, numericLimit - currentPeriodEvents.length),
    totalBytes,
    byTool,
    periodStart: periodStart.toISOString(),
  };
}

export async function recordUsage(user, event) {
  const summary = await getUsageSummary(user.id, user.plan);
  const numericLimit = getPlanLimit(user.plan);

  if (numericLimit !== Number.POSITIVE_INFINITY && summary.used >= numericLimit) {
    return {
      allowed: false,
      reason: "Monthly usage limit reached.",
      summary,
    };
  }

  if (user.plan === "free" && event.fileSizeBytes > MAX_FREE_FILE_SIZE) {
    return {
      allowed: false,
      reason: "Free plan files are limited to 25 MB.",
      summary,
    };
  }

  const usageEvent = await db.createUsageEvent({
    userId: user.id,
    tool: event.tool,
    fileCount: event.fileCount,
    fileSizeBytes: event.fileSizeBytes,
    durationMs: event.durationMs,
    metadata: event.metadata || {},
  });

  return {
    allowed: true,
    event: usageEvent,
    summary: await getUsageSummary(user.id, user.plan),
  };
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
