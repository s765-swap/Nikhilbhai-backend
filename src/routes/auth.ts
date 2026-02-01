import { Router } from "express";
import { z } from "zod";
import { config } from "../config";
import { requireAuth, signToken } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const body = z
    .object({
      username: z.string().min(1),
      password: z.string().min(1),
    })
    .parse(req.body);

  const u = config.users.find(
    (x) =>
      x.username.toLowerCase() === body.username.toLowerCase() &&
      x.password === body.password
  );
  if (!u) return res.status(401).json({ message: "Invalid credentials" });

  const user = { username: u.username, name: u.name };
  const token = signToken(user);
  return res.json({ token, user });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

