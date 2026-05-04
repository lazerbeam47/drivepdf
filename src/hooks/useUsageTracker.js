import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";
import { apiRequest } from "../lib/api";

export function useUsageTracker() {
  const auth = useAuth();
  const [usageError, setUsageError] = useState("");

  const recordUsage = useCallback(
    async ({ tool, files, durationMs, metadata }) => {
      setUsageError("");
      if (!auth.token) return null;

      try {
        return await apiRequest("/usage/events", {
          method: "POST",
          token: auth.token,
          body: {
            tool,
            fileCount: files.length,
            fileSizeBytes: files.reduce((sum, file) => sum + file.size, 0),
            durationMs,
            metadata,
          },
        });
      } catch (err) {
        setUsageError(err.message);
        throw err;
      }
    },
    [auth.token],
  );

  return {
    recordUsage,
    usageError,
    clearUsageError: () => setUsageError(""),
  };
}
