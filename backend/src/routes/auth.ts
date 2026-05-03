import { Router } from "express";
import { getDb } from "../db/connection.js";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: "username and password required" });
  }
  const db = getDb();
  const row = db
    .prepare("SELECT username, password, display_name, display_name_ar, role FROM users WHERE LOWER(username) = LOWER(?)")
    .get(String(username).trim()) as
    | { username: string; password: string; display_name: string; display_name_ar: string; role: string }
    | undefined;
  if (!row || row.password !== password) {
    return res.status(401).json({ ok: false, error: "Invalid username or password" });
  }
  const { password: _pw, ...safe } = row;
  res.json({ ok: true, user: { username: safe.username, displayName: safe.display_name, displayNameAr: safe.display_name_ar, role: safe.role } });
});

router.get("/users", (_req, res) => {
  const db = getDb();
  const rows = db.prepare("SELECT username, password, role FROM users").all();
  res.json({ users: rows });
});

export default router;
