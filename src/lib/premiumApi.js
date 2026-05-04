import { apiRequest } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:4000/api";

export async function premiumOcrPdf({ token, file }) {
  const form = new FormData();
  form.append("file", file);
  return premiumFileRequest("/premium/ocr", { token, form });
}

export async function premiumCompressPdf({ token, file, optimizeLevel }) {
  const form = new FormData();
  form.append("file", file);
  form.append("optimizeLevel", optimizeLevel);
  return premiumFileRequest("/premium/compress", { token, form });
}

export async function premiumBatchProcess({ token, files, operation, optimizeLevel }) {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  form.append("operation", operation);
  form.append("optimizeLevel", optimizeLevel);
  return premiumFileRequest("/premium/batch", { token, form });
}

async function premiumFileRequest(path, { token, form }) {
  if (!token) {
    throw new Error("Sign in with a Premium account to use this feature.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      throw new Error(data.error?.message || "Premium processing failed.");
    } catch {
      throw new Error(text || "Premium processing failed.");
    }
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const fileName = disposition.match(/filename="([^"]+)"/)?.[1] || "drivepdf-output.pdf";

  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    fileName,
  };
}

export async function recordPremiumUsage({ token, tool, files, metadata }) {
  if (!token) return null;
  return apiRequest("/usage/events", {
    method: "POST",
    token,
    body: {
      tool,
      fileCount: files.length,
      fileSizeBytes: files.reduce((sum, file) => sum + file.size, 0),
      durationMs: 0,
      metadata,
    },
  });
}
