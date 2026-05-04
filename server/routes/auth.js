import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errors.js";
import { db } from "../services/db.js";
import { sanitizeUser, signToken } from "../utils/auth.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const existing = await db.findUserByEmail(input.email);

    if (existing) {
      throw new HttpError(409, "An account already exists for this email.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await db.createUser({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
    });

    res.status(201).json({
      token: signToken(user),
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(formatZodError(err));
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await db.findUserByEmail(input.email);

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new HttpError(401, "Invalid email or password.");
    }

    res.json({
      token: signToken(user),
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(formatZodError(err));
  }
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

function formatZodError(err) {
  if (err instanceof z.ZodError) {
    return new HttpError(400, "Invalid request body.", err.flatten().fieldErrors);
  }

  return err;
}
