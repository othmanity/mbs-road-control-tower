import { Router } from "express";
import { getDb } from "../db/connection.js";

const router = Router();

// List all districts (cities, sub-areas, ash-shati)
router.get("/", (_req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM districts ORDER BY kind, name`).all();
  res.json({ districts: rows });
});

// One district + its KPIs, insights, layers
router.get("/:id", (req, res) => {
  const db = getDb();
  const district = db.prepare(`SELECT * FROM districts WHERE id = ?`).get(req.params.id);
  if (!district) return res.status(404).json({ error: "District not found" });

  const kpis = db.prepare(`SELECT * FROM district_kpis WHERE district_id = ? ORDER BY id`).all(req.params.id);
  const insights = db
    .prepare(`SELECT * FROM insights WHERE district_id = ? ORDER BY position`)
    .all(req.params.id);
  const layers = db.prepare(`SELECT * FROM gis_layers WHERE district_id = ? ORDER BY id`).all(req.params.id);

  res.json({ district, kpis, insights, layers });
});

router.get("/:id/insights", (req, res) => {
  const db = getDb();
  const insights = db
    .prepare(`SELECT * FROM insights WHERE district_id = ? ORDER BY position`)
    .all(req.params.id);
  res.json({ insights });
});

router.get("/:id/layers", (req, res) => {
  const db = getDb();
  const layers = db.prepare(`SELECT * FROM gis_layers WHERE district_id = ? ORDER BY id`).all(req.params.id);
  res.json({ layers });
});

router.get("/:id/kpis", (req, res) => {
  const db = getDb();
  const kpis = db.prepare(`SELECT * FROM district_kpis WHERE district_id = ? ORDER BY id`).all(req.params.id);
  res.json({ kpis });
});

// Multi-city stats endpoint (preserves the original demo)
router.get("/multi-cities/stats", (_req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM multi_city_stats ORDER BY area_2025 DESC`).all();
  res.json({ cities: rows });
});

// Sub-areas for a parent city (e.g., Al-Seh under Al-Ahsa)
router.get("/:parent/sub-areas", (req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM sub_areas WHERE parent = ?`).all(req.params.parent);
  res.json({ subAreas: rows });
});

export default router;
