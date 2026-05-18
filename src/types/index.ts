// Domain types for the MBS Road Control Tower Agent

export type Lang = "en" | "ar";

/** Phase 1..5 — operational rollout cadence (each phase = 15 zones) */
export type PhaseId = 1 | 2 | 3 | 4 | 5;

/** Geographic sub-stretch (3 natural segments of the 75 km corridor) */
export type SubStretchId = "port" | "middle" | "haram";

/** Distortion density bucket (matches slide legend: low/medium/high) */
export type DensityLevel = "low" | "medium" | "high";

/** Two top-level activity types per the user's framing */
export type ActivityType = "development" | "operational";

export type ActivityStatus = "open" | "in_progress" | "done" | "blocked";

export type DistortionCategory =
  | "slums"                  // عشوائيات
  | "building_violations"    // مباني غير ملتزمة بالأكواد
  | "barriers_damaged"       // تشوه الحواجز الخرسانية
  | "asphalt_digging"        // تدهور الأرصفة / حفر
  | "bridge_perimeter"       // تدهور حرم الجسور
  | "fuel_station_violation" // عدم التزام محطات الوقود
  | "ad_boards"              // لوحات إعلانية مشوهة
  | "unfinished_construction" // سواكر
  | "illegal_workshops"      // ورش ومستودعات غير نظامية
  | "inspection_point";      // مظهر نقاط التفتيش

export interface Bilingual {
  en: string;
  ar: string;
}

export interface SubStretch {
  id: SubStretchId;
  name: Bilingual;
  startKm: number;
  endKm: number;
  description: Bilingual;
}

/** A single 1-km segment along the corridor */
export interface Zone {
  id: number;                 // 1..75
  phase: PhaseId;
  subStretch: SubStretchId;
  name: Bilingual;            // e.g., "Zone 8 — Industrial Stretch"
  startKm: number;            // distance from Jeddah Port
  endKm: number;
  centerLat: number;
  centerLng: number;
  density: DensityLevel;      // overall visual distortion density
  trafficPerDay: number;      // synthetic
}

export interface Agency {
  id: string;
  name: Bilingual;
  acronym: string;
  scope: Bilingual;
}

export interface Finding {
  id: string;
  zoneId: number;
  activityType: ActivityType;
  category: DistortionCategory | "infrastructure" | "service_asset" | "greenery";
  title: Bilingual;
  description: Bilingual;
  ownerAgencyId: string;
  status: ActivityStatus;
  openedOn: string;            // ISO date
  targetDate: string;          // ISO date
  closedOn?: string;
  severity: "low" | "medium" | "high";
  // Visual evidence — placeholder URLs
  beforePhoto?: string;
  afterPhoto?: string;
  // Budget for development activities
  budgetSAR?: number;
  spentSAR?: number;
  // Inspection metadata for operational
  inspectorName?: string;
  reopenedCount?: number;
}

export interface KpiTarget {
  id: string;
  label: Bilingual;
  targetPct: number;           // e.g., 100
  currentPct: number;          // current progress
  trendPctDelta: number;       // weekly delta
  category: "maintenance" | "compliance" | "removal" | "infrastructure" | "greenery";
}

export interface AssetPoint {
  id: string;
  zoneId: number;
  type: "bridge" | "fuel_station" | "inspection_point" | "service_center" | "slum_area" | "green_area";
  name: Bilingual;
  lat: number;
  lng: number;
  status?: ActivityStatus;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: string;
}
