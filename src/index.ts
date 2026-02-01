import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { connectDb } from "./db";
import { config } from "./config";
import { authRouter } from "./routes/auth";
import { membersRouter } from "./routes/members";
import { tasksRouter } from "./routes/tasks";
import { screenshotsRouter } from "./routes/screenshots";
import { errorHandler } from "./middleware/error";

async function main() {
  await connectDb();

  const app = express();

  const allowedOrigins = config.corsOrigin
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json({ limit: "2mb" }));

  // Ensure uploads folder exists (Railway container filesystem is fine for MVP;
  // for long-term durability, switch to S3/R2 and store URLs instead).
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });

  app.use("/uploads", express.static(uploadsDir, { maxAge: "7d" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRouter);
  app.use("/members", membersRouter);
  app.use("/tasks", tasksRouter);
  app.use("/screenshots", screenshotsRouter);

  app.use(errorHandler);

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on :${config.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

