import type { Contractor } from "../types";

// Contractor list = government-internal teams + private-sector vendors.
// Performance numbers are synthetic but designed to tell a clear story:
//   - MAAS  → operational excellence (high on-time, near-zero fines)
//   - ARC   → biggest spender but late + fined (the corridor problem child)
//   - SBG   → premium quality (highest score) but slow
//   - RGA   → internal RGA execution falling behind on barriers
//   - HCM   → solid government execution
//   - JM    → smaller scope, solid
//   - GDT   → tiny scope, fine
//   - GDCD  → tiny scope, no fines
//   - TIP   → private investment partner, late on tendering
//   - MoMAH → governance owner, no direct execution

export const contractors: Contractor[] = [
  // ---------- Government internal teams ----------
  {
    id: "momah",
    acronym: "MoMAH",
    name: { en: "Ministry of Municipalities & Housing", ar: "وزارة البلديات والإسكان" },
    scope: { en: "Governance owner, standards, policy", ar: "المالك الحوكمي، المعايير، السياسات" },
    kind: "government",
    contractValueSAR: 0,
    onTimePct: 100,
    qualityScore: 100,
    finesYTD_SAR: 0,
    lateFindingsCount: 0,
    escalationsCount: 0,
  },
  {
    id: "holy_capital",
    acronym: "HCM",
    name: { en: "Holy Capital Municipality (Makkah)", ar: "أمانة العاصمة المقدسة (مكة)" },
    scope: { en: "Operates the Makkah-side stretch (in-house crews)", ar: "تشغيل القطاع المتجه إلى مكة بطواقم داخلية" },
    kind: "government",
    contractValueSAR: 9_400_000,
    onTimePct: 81,
    qualityScore: 82,
    finesYTD_SAR: 0,
    lateFindingsCount: 1,
    escalationsCount: 1,
  },
  {
    id: "jeddah_muni",
    acronym: "JM",
    name: { en: "Jeddah Municipality", ar: "أمانة جدة" },
    scope: { en: "Operates the Jeddah-side stretch (in-house crews)", ar: "تشغيل القطاع المتجه إلى جدة بطواقم داخلية" },
    kind: "government",
    contractValueSAR: 6_200_000,
    onTimePct: 76,
    qualityScore: 79,
    finesYTD_SAR: 0,
    lateFindingsCount: 1,
    escalationsCount: 0,
  },
  {
    id: "roads_general",
    acronym: "RGA",
    name: { en: "Roads General Authority", ar: "الهيئة العامة للطرق" },
    scope: { en: "Asphalt, bridges, road safety (internal program)", ar: "السفلتة، الجسور، السلامة المرورية (برنامج داخلي)" },
    kind: "government",
    contractValueSAR: 11_800_000,
    onTimePct: 58,
    qualityScore: 78,
    finesYTD_SAR: 0,
    lateFindingsCount: 3,
    escalationsCount: 2,
  },
  {
    id: "traffic_dept",
    acronym: "GDT",
    name: { en: "General Department of Traffic", ar: "الإدارة العامة للمرور" },
    scope: { en: "Traffic flow, inspection points", ar: "حركة المرور، نقاط التفتيش" },
    kind: "government",
    contractValueSAR: 1_750_000,
    onTimePct: 70,
    qualityScore: 84,
    finesYTD_SAR: 0,
    lateFindingsCount: 1,
    escalationsCount: 0,
  },
  {
    id: "civil_defense",
    acronym: "GDCD",
    name: { en: "General Directorate of Civil Defense", ar: "المديرية العامة للدفاع المدني" },
    scope: { en: "Emergency, safety inspections", ar: "الطوارئ، تفتيش السلامة" },
    kind: "government",
    contractValueSAR: 0,
    onTimePct: 100,
    qualityScore: 95,
    finesYTD_SAR: 0,
    lateFindingsCount: 0,
    escalationsCount: 0,
  },

  // ---------- Private-sector vendors ----------
  {
    id: "arc",
    acronym: "ARC",
    name: { en: "Al-Rajhi Construction Co.", ar: "شركة الراجحي للإنشاءات" },
    scope: { en: "Heavy civil works — demolition, asphalt overlay, barrier replacement", ar: "أعمال مدنية ثقيلة — هدم، سفلتة، استبدال الحواجز" },
    kind: "private",
    contractValueSAR: 22_500_000,
    onTimePct: 64,
    qualityScore: 73,
    finesYTD_SAR: 450_000,
    lateFindingsCount: 2,
    escalationsCount: 2,
  },
  {
    id: "sbg",
    acronym: "SBG",
    name: { en: "Saudi Binladin Group", ar: "مجموعة بن لادن السعودية" },
    scope: { en: "Bridge restoration, structural and pilgrim-approach works", ar: "ترميم الجسور، الأعمال الإنشائية، تطوير مداخل الحجاج" },
    kind: "private",
    contractValueSAR: 14_800_000,
    onTimePct: 71,
    qualityScore: 92,
    finesYTD_SAR: 180_000,
    lateFindingsCount: 1,
    escalationsCount: 1,
  },
  {
    id: "maas",
    acronym: "MAAS",
    name: { en: "MA'AS Services", ar: "ماس للخدمات" },
    scope: { en: "Daily operations — refuse, signage, graffiti cleanup, ad-board take-downs", ar: "العمليات اليومية — النفايات، اللافتات، إزالة الكتابات، إزالة اللوحات" },
    kind: "private",
    contractValueSAR: 8_500_000,
    onTimePct: 94,
    qualityScore: 88,
    finesYTD_SAR: 25_000,
    lateFindingsCount: 0,
    escalationsCount: 0,
  },
  {
    id: "tip",
    acronym: "TIP",
    name: { en: "Tatweer Investment Partner", ar: "شريك تطوير الاستثمار" },
    scope: { en: "Ad-board concessions, fuel-station rebuild, greenery program (PPP)", ar: "امتيازات اللوحات، إعادة بناء محطات الوقود، برنامج التشجير (شراكة)" },
    kind: "private",
    contractValueSAR: 18_900_000,
    onTimePct: 52,
    qualityScore: 76,
    finesYTD_SAR: 320_000,
    lateFindingsCount: 3,
    escalationsCount: 1,
  },
];

export function getContractor(id: string): Contractor | undefined {
  return contractors.find((c) => c.id === id);
}
