import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { Member } from "../models/Member";

export const membersRouter = Router();

membersRouter.use(requireAuth);

membersRouter.get("/", async (_req, res) => {
  const items = await Member.find().sort({ createdAt: -1 }).lean();
  res.json({ items });
});

membersRouter.post("/", async (req, res) => {
  const body = z
    .object({
      name: z.string().min(1),
      uniqueId: z.string().min(1),
      group: z.string().nullable().optional(),
    })
    .parse(req.body);

  try {
    const created = await Member.create({
      name: body.name,
      uniqueId: body.uniqueId,
      group: body.group ?? null,
    });
    res.status(201).json({ item: created });
  } catch (e: any) {
    if (String(e?.code) === "11000") {
      return res.status(409).json({ message: "Unique ID already exists" });
    }
    throw e;
  }
});

membersRouter.put("/:id", async (req, res) => {
  const body = z
    .object({
      name: z.string().min(1),
      uniqueId: z.string().min(1),
      group: z.string().nullable().optional(),
    })
    .parse(req.body);

  try {
    const updated = await Member.findByIdAndUpdate(
      req.params.id,
      { name: body.name, uniqueId: body.uniqueId, group: body.group ?? null },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Member not found" });
    return res.json({ item: updated });
  } catch (e: any) {
    if (String(e?.code) === "11000") {
      return res.status(409).json({ message: "Unique ID already exists" });
    }
    throw e;
  }
});

membersRouter.delete("/:id", async (req, res) => {
  const deleted = await Member.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Member not found" });
  return res.json({ ok: true });
});

