import multer from "multer";
import { HttpError } from "./errors.js";

export const premiumUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 150 * 1024 * 1024,
    files: 50,
  },
  fileFilter(_req, file, callback) {
    const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      callback(new HttpError(400, "Only PDF files are supported."));
      return;
    }

    callback(null, true);
  },
});
