import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth";
import { Member } from "../models/Member";
import { Task } from "../models/Task";
import { assertIsoDate } from "../utils/date";

export const tasksRouter = Router();
tasksRouter.use(requireAuth);

tasksRouter.get("/", async (req, res) => {
  const date = typeof req.query.date === "string" ? req.query.date : undefined;
  const q: any = {};
  if (date) q.date = date;
  const items = await Task.find(q).sort({ createdAt: -1 }).lean();
  res.json({ items });
});

tasksRouter.post("/", async (req, res) => {
  const body = z
    .object({
      appName: z.string().min(1),
      date: z.string().min(1),
      assign: z
        .object({
          groups: z.array(z.string()).optional().default([]),
          memberIds: z.array(z.string()).optional().default([]),
        })
        .optional()
        .default({ groups: [], memberIds: [] }),
    })
    .parse(req.body);

  assertIsoDate(body.date);

  const memberObjectIds = body.assign.memberIds
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const groupMembers =
    body.assign.groups.length > 0
      ? await Member.find({ group: { $in: body.assign.groups } })
          .select({ _id: 1 })
          .lean()
      : [];

  const set = new Set<string>();
  for (const id of memberObjectIds) set.add(String(id));
  for (const m of groupMembers) set.add(String(m._id));

  const assignedMemberIds = Array.from(set).map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const created = await Task.create({
    appName: body.appName,
    date: body.date,
    assignedMemberIds,
  });
  res.status(201).json({ item: created });
});

tasksRouter.delete("/:id", async (req, res) => {
  const deleted = await Task.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Task not found" });
  return res.json({ ok: true });
});

