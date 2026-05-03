import { Router } from "express";
import { randomUUID } from "node:crypto";
import { getDb } from "../db/connection.js";
import { chat as askAnthropic, hasApiKey } from "../anthropic.js";

const router = Router();

router.get("/status", (_req, res) => {
  res.json({
    api_key_configured: hasApiKey(),
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
  });
});

// Create a new chat session for a logged-in user
router.post("/sessions", (req, res) => {
  const db = getDb();
  const id = `chat_${randomUUID()}`;
  const username = req.body?.username || "demo";
  const districtId = req.body?.district || "ash-shati-ash-sharqi";
  const title = req.body?.title || "New conversation";
  db.prepare(
    `INSERT INTO chat_sessions (id, username, district_id, title, created_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(id, username, districtId, title, new Date().toISOString());
  res.json({ session_id: id });
});

router.get("/sessions", (req, res) => {
  const db = getDb();
  const username = (req.query.username as string) || "demo";
  const rows = db
    .prepare(`SELECT * FROM chat_sessions WHERE username = ? ORDER BY created_at DESC`)
    .all(username);
  res.json({ sessions: rows });
});

router.get("/sessions/:id/messages", (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(`SELECT id, role, content, keyword, created_at FROM chat_messages WHERE session_id = ? ORDER BY id ASC`)
    .all(req.params.id);
  res.json({ messages: rows });
});

// The actual chat call. Tries the keyword fast-path first; falls back to Anthropic.
router.post("/sessions/:id/messages", async (req, res) => {
  const db = getDb();
  const sessionId = req.params.id;
  const session = db.prepare(`SELECT * FROM chat_sessions WHERE id = ?`).get(sessionId) as any;
  if (!session) return res.status(404).json({ error: "Session not found" });

  const text = String(req.body?.text ?? "").trim();
  const lang = (req.body?.lang === "ar" ? "ar" : "en") as "en" | "ar";
  if (!text) return res.status(400).json({ error: "text required" });

  const now = () => new Date().toISOString();

  // Persist the user message
  db.prepare(
    `INSERT INTO chat_messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)`,
  ).run(sessionId, "user", text, now());

  // Track which keyword (if any) was relevant — surfaces as "Reference matched"
  // metadata in the UI but does NOT bypass Claude. The keyword reference text
  // is already part of the cached knowledge-base system prompt, so Claude can
  // weave it into a richer answer than the canned response would have been.
  const keywords = db
    .prepare(`SELECT trigger_word FROM keywords WHERE district_id = ?`)
    .all(session.district_id) as Array<{ trigger_word: string }>;
  const sorted = [...keywords].sort((a, b) => b.trigger_word.length - a.trigger_word.length);
  const lower = text.toLowerCase();
  const matchedKeyword = sorted.find((k) => lower.includes(k.trigger_word.toLowerCase()))?.trigger_word ?? null;

  // Anthropic with cached knowledge base
  const history = db
    .prepare(
      `SELECT role, content FROM chat_messages WHERE session_id = ? AND id < (SELECT MAX(id) FROM chat_messages WHERE session_id = ?) ORDER BY id ASC LIMIT 20`,
    )
    .all(sessionId, sessionId) as Array<{ role: "user" | "assistant"; content: string }>;

  const result = await askAnthropic({ message: text, history, lang, matchedKeyword });

  db.prepare(
    `INSERT INTO chat_messages (session_id, role, content, keyword, created_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(sessionId, "assistant", result.reply, matchedKeyword, now());

  res.json({
    reply: result.reply,
    source: result.source,
    keyword: matchedKeyword,
    usage: result.usage,
  });
});

export default router;
