import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function sanitizeUser(user) {
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  return safeUser;
}

export function signToken(user) {
  return jwt.sign(
    {
      email: user.email,
      plan: user.plan,
    },
    env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: env.JWT_EXPIRES_IN,
    },
  );
}
