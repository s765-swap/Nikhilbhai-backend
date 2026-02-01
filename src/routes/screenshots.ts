import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { Screenshot } from "../models/Screenshot";
import { Task } from "../models/Task";
import { Member } from "../models/Member";
import { assertIsoDate } from "../utils/date";

export const screenshotsRouter = Router();
screenshotsRouter.use(requireAuth);

const uploadsDir = path.resolve(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").slice(0, 10) || ".jpg";
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const rand = crypto.randomBytes(6).toString("hex");
    cb(null, `${stamp}-${rand}${ext}`);
  },
});

function isLikelyImage(mime: string) {
  return /^image\/(png|jpe?g|webp|gif)$/i.test(mime);
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per screenshot (reasonable for internal use)
  fileFilter: (_req, file, cb) => {
    if (!isLikelyImage(file.mimetype)) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

screenshotsRouter.post("/upload", upload.array("files", 20), async (req, res) => {
  const body = z
    .object({
      memberId: z.string().min(1),
      taskId: z.string().min(1),
    })
    .parse(req.body);

  if (!mongoose.isValidObjectId(body.memberId))
    return res.status(400).json({ message: "Invalid memberId" });
  if (!mongoose.isValidObjectId(body.taskId))
    return res.status(400).json({ message: "Invalid taskId" });

  const [member, task] = await Promise.all([
    Member.findById(body.memberId).lean(),
    Task.findById(body.taskId).lean(),
  ]);
  if (!member) return res.status(404).json({ message: "Member not found" });
  if (!task) return res.status(404).json({ message: "Task not found" });

  assertIsoDate(task.date);

  const files = (req.files as Express.Multer.File[]) ?? [];
  if (!files.length)
    return res.status(400).json({ message: "No files uploaded" });

  const docs = files.map((f) => ({
    memberId: new mongoose.Types.ObjectId(body.memberId),
    taskId: new mongoose.Types.ObjectId(body.taskId),
    date: task.date,
    imageUrl: `/uploads/${f.filename}`,
    filename: f.filename,
    originalName: f.originalname,
    uploadedAt: new Date(),
  }));

  const created = await Screenshot.insertMany(docs);
  res.status(201).json({ items: created });
});

screenshotsRouter.get("/", async (req, res) => {
  const memberId = typeof req.query.memberId === "string" ? req.query.memberId : undefined;
  const taskId = typeof req.query.taskId === "string" ? req.query.taskId : undefined;
  const date = typeof req.query.date === "string" ? req.query.date : undefined;

  const q: any = {};
  if (memberId) {
    if (!mongoose.isValidObjectId(memberId))
      return res.status(400).json({ message: "Invalid memberId" });
    q.memberId = new mongoose.Types.ObjectId(memberId);
  }
  if (taskId) {
    if (!mongoose.isValidObjectId(taskId))
      return res.status(400).json({ message: "Invalid taskId" });
    q.taskId = new mongoose.Types.ObjectId(taskId);
  }
  if (date) {
    assertIsoDate(date);
    q.date = date;
  }

  const items = await Screenshot.find(q).sort({ uploadedAt: -1 }).lean();
  res.json({ items });
});

