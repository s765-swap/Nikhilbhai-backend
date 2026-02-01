import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export type AuthUser = { username: string; name: string };

declare global {
  // eslint-disable-next-line no-var
  var __authUserType: AuthUser | undefined;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.header("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ message: "Missing token" });
  const token = match[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.user = { username: payload.username, name: payload.name };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function signToken(user: AuthUser) {
  // Internal app: simple JWT (no refresh token flow).
  return jwt.sign(user, config.jwtSecret, { expiresIn: "12h" });
}

