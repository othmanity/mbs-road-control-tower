import type Database from "better-sqlite3";

export function applySchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      username        TEXT PRIMARY KEY,
      password        TEXT NOT NULL,
      display_name    TEXT NOT NULL,
      display_name_ar TEXT NOT NULL,
      role            TEXT NOT NULL CHECK (role IN ('admin','viewer'))
    );

    CREATE TABLE IF NOT EXISTS districts (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      name_ar       TEXT NOT NULL,
      kind          TEXT NOT NULL CHECK (kind IN ('city','district','sub-area','region')),
      parent        TEXT,
      municipality  TEXT,
      municipality_ar TEXT,
      population    INTEGER,
      area_km2      REAL,
      perimeter_km  REAL,
      center_lat    REAL,
      center_lng    REAL,
      data_validated_at TEXT,
      summary_en    TEXT,
      summary_ar    TEXT
    );

    CREATE TABLE IF NOT EXISTS district_kpis (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      district_id   TEXT NOT NULL REFERENCES districts(id),
      key           TEXT NOT NULL,
      label_en      TEXT NOT NULL,
      label_ar      TEXT NOT NULL,
      value         REAL NOT NULL,
      unit          TEXT,
      severity      TEXT,
      year          INTEGER
    );

    CREATE TABLE IF NOT EXISTS insights (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      district_id   TEXT NOT NULL REFERENCES districts(id),
      position      INTEGER NOT NULL,
      title_en      TEXT NOT NULL,
      title_ar      TEXT NOT NULL,
      severity      TEXT NOT NULL CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','POSITIVE','OPPORTUNITY')),
      metric        TEXT NOT NULL,
      benchmark     TEXT,
      body_en       TEXT NOT NULL,
      body_ar       TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gis_layers (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      district_id   TEXT NOT NULL REFERENCES districts(id),
      layer_key     TEXT NOT NULL,
      name_en       TEXT NOT NULL,
      name_ar       TEXT NOT NULL,
      color         TEXT NOT NULL,
      geometry_type TEXT NOT NULL,
      feature_count INTEGER NOT NULL DEFAULT 0,
      description_en TEXT,
      description_ar TEXT
    );

    CREATE TABLE IF NOT EXISTS keywords (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      district_id   TEXT NOT NULL REFERENCES districts(id),
      trigger_word  TEXT NOT NULL,
      response_en   TEXT NOT NULL,
      response_ar   TEXT NOT NULL,
      UNIQUE (district_id, trigger_word)
    );

    CREATE TABLE IF NOT EXISTS qa_bank (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      district_id   TEXT NOT NULL REFERENCES districts(id),
      category      TEXT NOT NULL,
      position      INTEGER NOT NULL,
      question_en   TEXT NOT NULL,
      question_ar   TEXT NOT NULL,
      answer_en     TEXT NOT NULL,
      answer_ar     TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id            TEXT PRIMARY KEY,
      district_id   TEXT REFERENCES districts(id),
      title_en      TEXT NOT NULL,
      title_ar      TEXT NOT NULL,
      kind          TEXT NOT NULL CHECK (kind IN ('executive','analysis','external','generated')),
      description_en TEXT,
      description_ar TEXT,
      file_path     TEXT,
      generated_at  TEXT NOT NULL,
      author        TEXT NOT NULL DEFAULT 'Rashid Digital GIS Employee'
    );

    -- Multi-city expansion analysis (preserved from original demo)
    CREATE TABLE IF NOT EXISTS multi_city_stats (
      name          TEXT PRIMARY KEY,
      name_ar       TEXT NOT NULL,
      area_2024     REAL NOT NULL,
      area_2025     REAL NOT NULL,
      expansion     REAL NOT NULL,
      growth_pct    REAL NOT NULL,
      center_lat    REAL NOT NULL,
      center_lng    REAL NOT NULL
    );

    -- Sub-area detail (preserved Al-Seh under Al-Ahsa)
    CREATE TABLE IF NOT EXISTS sub_areas (
      name             TEXT PRIMARY KEY,
      name_ar          TEXT NOT NULL,
      parent           TEXT NOT NULL,
      baseline_year    INTEGER NOT NULL,
      current_year     INTEGER NOT NULL,
      pop_baseline     INTEGER NOT NULL,
      pop_current      INTEGER NOT NULL,
      pop_growth_pct   REAL NOT NULL,
      res_ha_baseline  REAL NOT NULL,
      res_ha_current   REAL NOT NULL,
      res_ha_growth    REAL NOT NULL,
      vac_ha_baseline  REAL NOT NULL,
      vac_ha_current   REAL NOT NULL,
      vac_ha_growth    REAL NOT NULL,
      density_baseline REAL NOT NULL,
      density_current  REAL NOT NULL,
      density_growth   REAL NOT NULL,
      rec_direction    TEXT NOT NULL,
      rec_direction_ar TEXT NOT NULL,
      rec_hectares     INTEGER NOT NULL,
      rec_confidence   TEXT NOT NULL,
      plan_name_en     TEXT NOT NULL,
      plan_name_ar     TEXT NOT NULL,
      plan_number      TEXT NOT NULL,
      municipality_en  TEXT NOT NULL,
      municipality_ar  TEXT NOT NULL,
      report_url       TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id          TEXT PRIMARY KEY,
      username    TEXT NOT NULL,
      district_id TEXT REFERENCES districts(id),
      title       TEXT NOT NULL DEFAULT 'New conversation',
      created_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id  TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      role        TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
      content     TEXT NOT NULL,
      keyword     TEXT,
      created_at  TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_kpis_district ON district_kpis(district_id);
    CREATE INDEX IF NOT EXISTS idx_insights_district ON insights(district_id);
    CREATE INDEX IF NOT EXISTS idx_layers_district ON gis_layers(district_id);
    CREATE INDEX IF NOT EXISTS idx_keywords_district ON keywords(district_id);
    CREATE INDEX IF NOT EXISTS idx_qa_district ON qa_bank(district_id);
    CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);
  `);
}
