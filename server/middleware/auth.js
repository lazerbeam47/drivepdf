import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { db } from "../services/db.js";
import { HttpError } from "./errors.js";

export async function requireAuth(req, _res, next) {
  try {
    const header = req.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      throw new HttpError(401, "Authentication required.");
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await db.findUserById(payload.sub);

    if (!user) {
      throw new HttpError(401, "User no longer exists.");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err.status ? err : new HttpError(401, "Invalid or expired token."));
  }
}

export function requirePremium(req, _res, next) {
  if (req.user?.plan !== "premium") {
    next(new HttpError(403, "Premium plan required."));
    return;
  }

  next();
}
