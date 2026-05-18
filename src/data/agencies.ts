import type { Agency } from "../types";

// Agencies extracted from the report (slide 9 — overlapping responsibilities).
// Owning agency drives the RACI view on every finding.
export const agencies: Agency[] = [
  {
    id: "momah",
    acronym: "MoMAH",
    name: { en: "Ministry of Municipalities & Housing", ar: "وزارة البلديات والإسكان" },
    scope: { en: "Governance owner, standards, policy", ar: "المالك الحوكمي، المعايير، السياسات" },
  },
  {
    id: "holy_capital",
    acronym: "HCM",
    name: { en: "Holy Capital Municipality (Makkah)", ar: "أمانة العاصمة المقدسة (مكة)" },
    scope: { en: "Operates the Makkah-side stretch", ar: "تشغيل القطاع المتجه إلى مكة" },
  },
  {
    id: "jeddah_muni",
    acronym: "JM",
    name: { en: "Jeddah Municipality", ar: "أمانة جدة" },
    scope: { en: "Operates the Jeddah-side stretch", ar: "تشغيل القطاع المتجه إلى جدة" },
  },
  {
    id: "roads_general",
    acronym: "RGA",
    name: { en: "Roads General Authority", ar: "الهيئة العامة للطرق" },
    scope: { en: "Asphalt, bridges, road safety", ar: "السفلتة، الجسور، السلامة المرورية" },
  },
  {
    id: "traffic_dept",
    acronym: "GDT",
    name: { en: "General Department of Traffic", ar: "الإدارة العامة للمرور" },
    scope: { en: "Traffic flow, inspection points", ar: "حركة المرور، نقاط التفتيش" },
  },
  {
    id: "civil_defense",
    acronym: "GDCD",
    name: { en: "General Directorate of Civil Defense", ar: "المديرية العامة للدفاع المدني" },
    scope: { en: "Emergency, safety inspections", ar: "الطوارئ، تفتيش السلامة" },
  },
  {
    id: "investment",
    acronym: "PIF/PPP",
    name: { en: "Private-Sector Investment Partner", ar: "شريك استثمار من القطاع الخاص" },
    scope: { en: "Greenery, ad-board concessions, fuel/service plots", ar: "تشجير، امتياز اللوحات، محطات الوقود" },
  },
];

export function getAgency(id: string): Agency | undefined {
  return agencies.find((a) => a.id === id);
}
