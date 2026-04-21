// Mock GeoJSON data for Saudi cities - urban boundaries 2024 vs 2025

export interface CityStats {
  name: string;
  nameAr: string;
  area2024: number;
  area2025: number;
  expansion: number;
  growthPct: number;
  center: [number, number];
}

export const cityStats: CityStats[] = [
  { name: "Riyadh", nameAr: "الرياض", area2024: 1890, area2025: 1945, expansion: 55, growthPct: 2.91, center: [24.7136, 46.6753] },
  { name: "Jeddah", nameAr: "جدة", area2024: 1230, area2025: 1268, expansion: 38, growthPct: 3.09, center: [21.4858, 39.1925] },
  { name: "Dammam", nameAr: "الدمام", area2024: 540, area2025: 562, expansion: 22, growthPct: 4.07, center: [26.3927, 49.9777] },
  { name: "Makkah", nameAr: "مكة المكرمة", area2024: 850, area2025: 871, expansion: 21, growthPct: 2.47, center: [21.3891, 39.8579] },
  { name: "Madinah", nameAr: "المدينة المنورة", area2024: 620, area2025: 638, expansion: 18, growthPct: 2.9, center: [24.4539, 39.6142] },
  { name: "Al-Ahsa", nameAr: "الأحساء", area2024: 1420, area2025: 1472, expansion: 52, growthPct: 3.66, center: [25.3647, 49.5879] },
];

// Sub-area level detail (zoomed-in settlement inside a city)
export interface SubArea {
  name: string;
  nameAr: string;
  parent: string;
  baselineYear: number;
  currentYear: number;
  population: { baseline: number; current: number; growthPct: number };
  residentialHa: { baseline: number; current: number; growthPct: number };
  vacantHa: { baseline: number; current: number; growthPct: number };
  residentialPlusVacantHa: { baseline: number; current: number; growthPct: number };
  densityPerHa: { baseline: number; current: number; growthPct: number };
  recommendation: {
    direction: string;
    directionAr: string;
    hectares: number;
    confidence: "Low" | "Moderate" | "High";
  };
  planContext: {
    planNameEn: string;
    planNameAr: string;
    planNumber: string;
    municipalityEn: string;
    municipalityAr: string;
  };
  reportUrl: string;
}

export const subAreas: SubArea[] = [
  {
    name: "Al-Seh",
    nameAr: "السيح",
    parent: "Al-Ahsa",
    baselineYear: 2020,
    currentYear: 2025,
    population: { baseline: 895, current: 2830, growthPct: 216.20 },
    residentialHa: { baseline: 70, current: 108, growthPct: 54.29 },
    vacantHa: { baseline: 22, current: 23, growthPct: 4.55 },
    residentialPlusVacantHa: { baseline: 92, current: 131, growthPct: 42.39 },
    densityPerHa: { baseline: 9.73, current: 21.60, growthPct: 122.06 },
    recommendation: {
      direction: "West",
      directionAr: "غرباً",
      hectares: 15,
      confidence: "Moderate",
    },
    planContext: {
      planNameEn: "Al-Seh Hijra Plan",
      planNameAr: "تخطيط هجرة السيح",
      planNumber: "4/646",
      municipalityEn: "Al-Jafr",
      municipalityAr: "الجفر",
    },
    reportUrl: "/reports/al-seh-urban-expansion.pdf",
  },
];

export function getSubAreasForCity(cityName: string | null): SubArea[] {
  if (!cityName) return [];
  return subAreas.filter((a) => a.parent === cityName);
}

function generateCityBoundary(center: [number, number], radiusKm: number, points = 36, irregularity = 0.15): [number, number][] {
  const coords: [number, number][] = [];
  const seed = center[0] * 1000 + center[1] * 100;
  for (let i = 0; i < points; i++) {
    const angle = (2 * Math.PI * i) / points;
    const jitter = 1 + irregularity * Math.sin(seed + i * 3.7);
    const r = radiusKm * jitter;
    const dLat = (r / 111) * Math.cos(angle);
    const dLng = (r / (111 * Math.cos((center[0] * Math.PI) / 180))) * Math.sin(angle);
    coords.push([center[1] + dLng, center[0] + dLat]);
  }
  coords.push(coords[0]);
  return coords;
}

function areaToRadius(areaKm2: number): number {
  return Math.sqrt(areaKm2 / Math.PI);
}

export function generateCityGeoJSON(year: "2024" | "2025") {
  return {
    type: "FeatureCollection" as const,
    features: cityStats.map((city) => {
      const area = year === "2024" ? city.area2024 : city.area2025;
      return {
        type: "Feature" as const,
        properties: { name: city.name, nameAr: city.nameAr, year, area },
        geometry: { type: "Polygon" as const, coordinates: [generateCityBoundary(city.center, areaToRadius(area), 48, year === "2025" ? 0.18 : 0.15)] },
      };
    }),
  };
}

export function generateExpansionGeoJSON() {
  return {
    type: "FeatureCollection" as const,
    features: cityStats.map((city) => {
      const r2024 = areaToRadius(city.area2024);
      const r2025 = areaToRadius(city.area2025);
      const patches: [number, number][] = [];
      for (let p = 0; p < 3; p++) {
        const startAngle = (p * 2 * Math.PI) / 3 + 0.2;
        const endAngle = startAngle + Math.PI / 4;
        const inner: [number, number][] = [], outer: [number, number][] = [];
        for (let i = 0; i <= 12; i++) {
          const angle = startAngle + ((endAngle - startAngle) * i) / 12;
          for (const [r, arr] of [[r2024, inner], [r2025, outer]] as const) {
            const dLat = (r / 111) * Math.cos(angle);
            const dLng = (r / (111 * Math.cos((city.center[0] * Math.PI) / 180))) * Math.sin(angle);
            (arr as [number, number][]).push([city.center[1] + dLng, city.center[0] + dLat]);
          }
        }
        patches.push(...outer, ...inner.reverse(), outer[0]);
      }
      return {
        type: "Feature" as const,
        properties: { name: city.name, nameAr: city.nameAr, expansion: city.expansion, growthPct: city.growthPct },
        geometry: { type: "Polygon" as const, coordinates: [patches] },
      };
    }),
  };
}

// ----- Agentic conversation flow -----

export type SubAgent = "orchestrator" | "retrieval" | "data-quality" | "spatial" | "reporting" | "citation";

export interface AgentMessage {
  id: number;
  type: "rashid" | "system" | "user-prompt" | "agent-handoff" | "memory" | "planning" | "feedback" | "tool-call" | "user-choice";
  subAgent?: SubAgent;
  textEn: string;
  textAr: string;
  delay: number;
  thinking?: boolean;
  options?: { labelEn: string; labelAr: string; recommended?: boolean }[];
}

export const subAgentMeta: Record<SubAgent, { labelEn: string; labelAr: string; color: string; icon: string }> = {
  orchestrator: { labelEn: "Orchestrator", labelAr: "المنسق", color: "#26634B", icon: "🧠" },
  retrieval:    { labelEn: "Retrieval Agent", labelAr: "وكيل الاسترجاع", color: "#005A96", icon: "🔍" },
  "data-quality": { labelEn: "Data Quality Agent", labelAr: "وكيل جودة البيانات", color: "#0AEBD7", icon: "✅" },
  spatial:      { labelEn: "Spatial Analysis Agent", labelAr: "وكيل التحليل المكاني", color: "#FD7E14", icon: "📐" },
  reporting:    { labelEn: "Reporting Agent", labelAr: "وكيل التقارير", color: "#5505CD", icon: "📊" },
  citation:     { labelEn: "Citation Agent", labelAr: "وكيل التوثيق", color: "#AF0818", icon: "📋" },
};

export const conversationFlow: AgentMessage[] = [
  // 1. Orchestrator receives and plans
  {
    id: 1,
    type: "rashid",
    subAgent: "orchestrator",
    textEn: "Got it. Let me analyze this request and build a plan.",
    textAr: "فهمت. دعني أحلل هذا الطلب وأبني خطة عمل.",
    delay: 1200,
    thinking: true,
  },
  {
    id: 2,
    type: "planning",
    textEn: "Plan created: 1) Define scope → 2) Retrieve data → 3) Validate quality → 4) Run spatial analysis → 5) Generate reports → 6) Document sources",
    textAr: "تم إنشاء الخطة: 1) تحديد النطاق ← 2) استرجاع البيانات ← 3) التحقق من الجودة ← 4) تنفيذ التحليل المكاني ← 5) إنشاء التقارير ← 6) توثيق المصادر",
    delay: 1500,
  },
  {
    id: 3,
    type: "rashid",
    subAgent: "orchestrator",
    textEn: "I'll focus on 5 major cities: Riyadh, Jeddah, Dammam, Makkah, and Madinah. Comparing 2024 vs 2025 boundaries. Shall I proceed?",
    textAr: "سأركز على 5 مدن رئيسية: الرياض، جدة، الدمام، مكة المكرمة، والمدينة المنورة. مقارنة حدود 2024 مع 2025. هل أتابع؟",
    delay: 2000,
    thinking: true,
  },
  {
    id: 4,
    type: "user-choice",
    textEn: "Approve scope?",
    textAr: "اعتماد النطاق؟",
    delay: 600,
    options: [
      { labelEn: "Yes, proceed", labelAr: "نعم، تابع", recommended: true },
      { labelEn: "Add Taif too", labelAr: "أضف الطائف أيضاً" },
      { labelEn: "Only top 3 cities", labelAr: "أهم 3 مدن فقط" },
    ],
  },

  // 2. Memory check
  {
    id: 5,
    type: "memory",
    textEn: "Checking memory... Found previous analysis from Q2 2025 for Riyadh and Jeddah. I'll use the same methodology for consistency.",
    textAr: "فحص الذاكرة... وجدت تحليلاً سابقاً من الربع الثاني 2025 للرياض وجدة. سأستخدم نفس المنهجية لضمان الاتساق.",
    delay: 1800,
  },

  // 3. Handoff to Retrieval Agent
  {
    id: 6,
    type: "agent-handoff",
    subAgent: "retrieval",
    textEn: "Handing off to Retrieval Agent to search the SDI...",
    textAr: "تسليم المهمة لوكيل الاسترجاع للبحث في البنية التحتية للبيانات المكانية...",
    delay: 1000,
  },
  {
    id: 8,
    type: "rashid",
    subAgent: "retrieval",
    textEn: "I've located 12 relevant layers across the 5 cities — urban boundaries, subdivision plans, and land use data for both years.",
    textAr: "حددت 12 طبقة ذات صلة عبر المدن الخمس — حدود عمرانية ومخططات تقسيم وبيانات استخدام أراضي لكلا العامين.",
    delay: 2200,
    thinking: true,
  },

  // 4. Handoff to Data Quality Agent
  {
    id: 9,
    type: "agent-handoff",
    subAgent: "data-quality",
    textEn: "Handing off to Data Quality Agent for validation...",
    textAr: "تسليم المهمة لوكيل جودة البيانات للتحقق...",
    delay: 1000,
  },
  {
    id: 11,
    type: "system",
    textEn: "Quality Check PASSED — 10/10 shapefiles | CRS: EPSG:4326 | No gaps detected",
    textAr: "فحص الجودة: ناجح — 10/10 ملفات | EPSG:4326 | لا توجد فجوات",
    delay: 1500,
  },

  // 5. Handoff to Spatial Analysis Agent
  {
    id: 12,
    type: "agent-handoff",
    subAgent: "spatial",
    textEn: "Handing off to Spatial Analysis Agent...",
    textAr: "تسليم المهمة لوكيل التحليل المكاني...",
    delay: 1000,
  },
  {
    id: 13,
    type: "rashid",
    subAgent: "spatial",
    textEn: "Running overlay analysis now — aligning 2024 and 2025 boundaries, computing spatial differences, and calculating expansion zones for each city...",
    textAr: "أجري تحليل التراكب الآن — محاذاة حدود 2024 و2025 وحساب الفروقات المكانية ومناطق التوسع لكل مدينة...",
    delay: 2000,
    thinking: true,
  },
  {
    id: 15,
    type: "system",
    textEn: "Spatial analysis completed for 5/5 cities",
    textAr: "اكتمل التحليل المكاني لـ 5/5 مدن",
    delay: 1500,
  },

  // 6. Feedback loop — insight from orchestrator
  {
    id: 16,
    type: "feedback",
    textEn: "Cross-checking results against memory... Riyadh growth (2.91%) is consistent with Q2 trend. Dammam (4.07%) is notably higher — flagging for human review.",
    textAr: "مراجعة النتائج مقابل الذاكرة... نمو الرياض (2.91%) متسق مع اتجاه الربع الثاني. الدمام (4.07%) أعلى بشكل ملحوظ — يتم تمييزه للمراجعة البشرية.",
    delay: 2000,
  },
  {
    id: 161,
    type: "user-choice",
    textEn: "How should I handle the Dammam outlier?",
    textAr: "كيف أتعامل مع الدمام كحالة استثنائية؟",
    delay: 600,
    options: [
      { labelEn: "Deep-dive Dammam", labelAr: "تحليل عميق للدمام" },
      { labelEn: "Flag but continue", labelAr: "تمييز مع المتابعة", recommended: true },
      { labelEn: "Continue as-is", labelAr: "تابع كما هو" },
    ],
  },

  // 7. Handoff to Reporting Agent
  {
    id: 17,
    type: "agent-handoff",
    subAgent: "reporting",
    textEn: "Handing off to Reporting Agent to generate outputs...",
    textAr: "تسليم المهمة لوكيل التقارير لإنشاء المخرجات...",
    delay: 1000,
  },
  {
    id: 18,
    type: "rashid",
    subAgent: "reporting",
    textEn: "Generating boundary comparison maps, expansion zone overlays, statistical tables, and growth charts...",
    textAr: "إنشاء خرائط مقارنة الحدود وطبقات مناطق التوسع والجداول الإحصائية ورسوم النمو البيانية...",
    delay: 2000,
    thinking: true,
  },

  // 8. Citation Agent
  {
    id: 19,
    type: "agent-handoff",
    subAgent: "citation",
    textEn: "Citation Agent logging data provenance...",
    textAr: "وكيل التوثيق يسجل مصادر البيانات...",
    delay: 1200,
  },
  {
    id: 20,
    type: "system",
    textEn: "Provenance logged: 12 SDI layers, methodology v2.1, analysis timestamp 2026-04-15T12:00Z",
    textAr: "تم تسجيل المصادر: 12 طبقة SDI، المنهجية v2.1، وقت التحليل 2026-04-15T12:00Z",
    delay: 1500,
  },

  // 9. Final summary from orchestrator
  {
    id: 21,
    type: "rashid",
    subAgent: "orchestrator",
    textEn: "All done. Total urban expansion across the Kingdom: 154 km² with an average growth of 3.01%. Dammam leads in growth rate (4.07%), Riyadh in absolute expansion (55 km²). All sources documented. Ready for your review.",
    textAr: "انتهيت. إجمالي التوسع العمراني في المملكة: 154 كم² بمتوسط نمو 3.01%. الدمام تتصدر في معدل النمو (4.07%)، والرياض في التوسع المطلق (55 كم²). تم توثيق جميع المصادر. جاهز لمراجعتكم.",
    delay: 2500,
    thinking: true,
  },
  {
    id: 22,
    type: "user-prompt",
    textEn: "Show me the results.",
    textAr: "أرني النتائج.",
    delay: 1500,
  },
];
