import type { KpiTarget } from "../types";

// 2027 targets pulled from slide 11 (الأهداف من المستهدف تحقيقها بحلول نهاية عام 2027)
export const kpis: KpiTarget[] = [
  {
    id: "maintenance_coverage",
    label: {
      en: "Road maintenance coverage",
      ar: "تغطية أعمال الصيانة",
    },
    targetPct: 100,
    currentPct: 38,
    trendPctDelta: 4.2,
    category: "maintenance",
  },
  {
    id: "building_compliance",
    label: {
      en: "Buildings compliant with urban codes",
      ar: "امتثال المباني للأكواد العمرانية",
    },
    targetPct: 70,
    currentPct: 22,
    trendPctDelta: 2.1,
    category: "compliance",
  },
  {
    id: "illegal_workshops_removed",
    label: {
      en: "Illegal workshops & yards cleared",
      ar: "إزالة الورش والمستودعات غير النظامية",
    },
    targetPct: 100,
    currentPct: 41,
    trendPctDelta: 6.0,
    category: "removal",
  },
  {
    id: "barriers_fixed",
    label: {
      en: "Damaged concrete barriers repaired",
      ar: "إصلاح الحواجز الخرسانية المتهالكة",
    },
    targetPct: 90,
    currentPct: 53,
    trendPctDelta: 5.3,
    category: "infrastructure",
  },
  {
    id: "condemned_demolished",
    label: {
      en: "Condemned buildings demolished",
      ar: "هدم المباني الملغاة صكوكها",
    },
    targetPct: 100,
    currentPct: 28,
    trendPctDelta: 3.7,
    category: "removal",
  },
  {
    id: "greenery_added",
    label: {
      en: "Greenery & median planting added",
      ar: "زراعة الجزر الوسطية والتشجير",
    },
    targetPct: 100,
    currentPct: 19,
    trendPctDelta: 1.4,
    category: "greenery",
  },
];

/** Hajj-readiness countdown — synthetic anchor for the PoC */
export const NEXT_HAJJ_DATE_ISO = "2027-05-25";

export function daysUntilHajj(today: Date = new Date()): number {
  const target = new Date(NEXT_HAJJ_DATE_ISO);
  const ms = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
