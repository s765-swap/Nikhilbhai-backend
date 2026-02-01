import type { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const msg = err?.message ?? "Server error";
  const status =
    typeof err?.status === "number" && err.status >= 400 ? err.status : 500;
  res.status(status).json({ message: msg });
}

