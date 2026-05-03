import { Router } from "express";
import { getDb } from "../db/connection.js";

const router = Router();

// All keywords for a district (default: ash-shati-ash-sharqi)
router.get("/keywords", (req, res) => {
  const db = getDb();
  const districtId = (req.query.district as string) || "ash-shati-ash-sharqi";
  const rows = db
    .prepare(`SELECT trigger_word, response_en, response_ar FROM keywords WHERE district_id = ? ORDER BY trigger_word`)
    .all(districtId);
  res.json({ keywords: rows });
});

// Match a keyword against the user's input
router.post("/keywords/match", (req, res) => {
  const db = getDb();
  const text = String(req.body?.text ?? "").toLowerCase().trim();
  const districtId = req.body?.district || "ash-shati-ash-sharqi";
  if (!text) return res.json({ match: null });

  const all = db
    .prepare(`SELECT trigger_word, response_en, response_ar FROM keywords WHERE district_id = ?`)
    .all(districtId) as Array<{ trigger_word: string; response_en: string; response_ar: string }>;

  // Longest-trigger-first match wins, so "road widths" beats "roads"
  const sorted = [...all].sort((a, b) => b.trigger_word.length - a.trigger_word.length);
  const hit = sorted.find((k) => text.includes(k.trigger_word.toLowerCase()));
  res.json({ match: hit ?? null });
});

// Q&A bank
router.get("/qa", (req, res) => {
  const db = getDb();
  const districtId = (req.query.district as string) || "ash-shati-ash-sharqi";
  const rows = db
    .prepare(`SELECT category, position, question_en, question_ar, answer_en, answer_ar
              FROM qa_bank WHERE district_id = ? ORDER BY position`)
    .all(districtId);

  // Group by category for the UI
  const grouped: Record<string, typeof rows> = {};
  for (const r of rows as any[]) {
    grouped[r.category] = grouped[r.category] || [];
    grouped[r.category].push(r);
  }
  res.json({ categories: grouped, total: rows.length });
});

export default router;
