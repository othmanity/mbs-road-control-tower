// Structured knowledge-base snapshot.
//
// This file is the canonical source of truth the LLM gets in its system
// prompt (or fed to a RAG index). It's derived from the synthetic
// data in src/data/*.ts so it stays in sync.
//
// Shape is deliberately denormalized & flat — easier for an LLM to read
// than navigating nested relations.

import { zones, subStretches, CORRIDOR_TOTAL_KM, POC_ZONE_IDS } from "../data/corridor";
import { findings, assets } from "../data/findings";
import { contractors } from "../data/contractors";
import { kpis, daysUntilHajj, NEXT_HAJJ_DATE_ISO } from "../data/kpis";

type Bilingual = { en: string; ar: string };

export interface FactsSnapshot {
  generated_at: string;

  corridor: {
    name: Bilingual;
    total_km: number;
    daily_vehicles: number;
    endpoints: Bilingual;
    sub_stretches: Array<{
      id: string;
      name: Bilingual;
      start_km: number;
      end_km: number;
      character: Bilingual;
    }>;
    phases: Array<{
      phase: number;
      zones_from: number;
      zones_to: number;
    }>;
  };

  hajj_readiness: {
    next_hajj_date: string;
    days_remaining: number;
    on_track: boolean;
    summary_en: string;
    summary_ar: string;
  };

  kpis: Array<{
    id: string;
    label: Bilingual;
    target_pct: number;
    current_pct: number;
    weekly_delta_pct: number;
    on_track: boolean;
    category: string;
  }>;

  contractors: Array<{
    id: string;
    acronym: string;
    name: Bilingual;
    scope: Bilingual;
    kind: "government" | "private";
    contract_value_sar: number;
    on_time_pct: number;
    quality_score: number;
    fines_ytd_sar: number;
    late_findings_count: number;
    escalations_count: number;
    owned_findings_count: number;
    blocked_findings_count: number;
    composite_score: number; // weighted summary score 0..100
  }>;

  vendor_performance: {
    total_corridor_contract_value_sar: number;
    best_overall: { id: string; acronym: string; composite_score: number };
    worst_overall: { id: string; acronym: string; composite_score: number };
    most_fined: { id: string; acronym: string; fines_ytd_sar: number };
    most_late: { id: string; acronym: string; late_findings_count: number };
    highest_quality: { id: string; acronym: string; quality_score: number };
    largest_contract: { id: string; acronym: string; contract_value_sar: number };
    ranked_by_composite: Array<{ id: string; acronym: string; composite_score: number }>;
  };

  poc_zones: Array<{
    id: number;
    name: Bilingual;
    phase: number;
    sub_stretch: string;
    km_range: string;
    density: string;
    traffic_per_day: number;
    findings_total: number;
    findings_open: number;
    findings_done: number;
    findings_blocked: number;
    findings_high_severity: number;
    development_count: number;
    operational_count: number;
    budget_committed_sar: number;
    budget_spent_sar: number;
    contractors: string[];
    asset_count_by_type: Record<string, number>;
    headline_en: string;
    headline_ar: string;
  }>;

  findings_aggregate: {
    total: number;
    open: number;
    in_progress: number;
    done: number;
    blocked: number;
    high_severity_open: number;
    by_activity_type: { development: number; operational: number };
    by_category: Record<string, number>;
    by_status: Record<string, number>;
    by_contractor: Record<string, number>;
    by_zone: Record<string, number>;
    top_blockers: Array<{
      id: string;
      zone_id: number;
      title_en: string;
      title_ar: string;
      owner_acronym: string;
      status: string;
      target_date: string;
      severity: string;
    }>;
  };

  glossary: Array<{
    term_en: string;
    term_ar: string;
    definition_en: string;
    definition_ar: string;
  }>;

  scope_notes: {
    poc_zone_ids: number[];
    out_of_scope_response_en: string;
    out_of_scope_response_ar: string;
  };
}

function bucketBy<T, K extends string | number>(arr: T[], key: (x: T) => K): Record<string, number> {
  return arr.reduce<Record<string, number>>((m, x) => {
    const k = String(key(x));
    m[k] = (m[k] ?? 0) + 1;
    return m;
  }, {});
}

// Composite vendor score (0..100). Weights chosen so reliability matters most:
//   on-time (40%) + quality (30%) + (100 - finesSeverity) (20%) + (100 - lateSeverity) (10%)
function compositeScore(c: {
  onTimePct: number; qualityScore: number;
  finesYTD_SAR: number; lateFindingsCount: number;
  contractValueSAR: number;
}): number {
  const finesPenalty = Math.min(100, (c.finesYTD_SAR / 5000) | 0); // every 5k SAR = 1 point
  const latePenalty = Math.min(100, c.lateFindingsCount * 20);
  const score =
    0.40 * c.onTimePct +
    0.30 * c.qualityScore +
    0.20 * (100 - finesPenalty) +
    0.10 * (100 - latePenalty);
  return Math.round(Math.max(0, Math.min(100, score)));
}

function pickTop<T extends { id: string; acronym: string }>(arr: T[], score: (x: T) => number): T {
  return arr.reduce((best, x) => (score(x) > score(best) ? x : best));
}
function pickBottom<T extends { id: string; acronym: string }>(arr: T[], score: (x: T) => number): T {
  return arr.reduce((worst, x) => (score(x) < score(worst) ? x : worst));
}

export function buildFactsSnapshot(): FactsSnapshot {
  const total = findings.length;
  const open = findings.filter((f) => f.status === "open").length;
  const inProgress = findings.filter((f) => f.status === "in_progress").length;
  const done = findings.filter((f) => f.status === "done").length;
  const blocked = findings.filter((f) => f.status === "blocked").length;
  const highOpen = findings.filter((f) => f.severity === "high" && f.status !== "done").length;

  const topBlockers = findings
    .filter((f) => f.status === "blocked" || f.severity === "high")
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    .slice(0, 5)
    .map((f) => ({
      id: f.id,
      zone_id: f.zoneId,
      title_en: f.title.en,
      title_ar: f.title.ar,
      owner_acronym: contractors.find((a) => a.id === f.contractorId)?.acronym ?? "—",
      status: f.status,
      target_date: f.targetDate,
      severity: f.severity,
    }));

  const days = daysUntilHajj();
  const kpiAvg = kpis.reduce((s, k) => s + (k.currentPct / k.targetPct), 0) / kpis.length;
  const onTrackOverall = kpiAvg > 0.5;

  // Vendor performance — composite score, ownership counts, ranking
  const contractorsWithPerf = contractors.map((c) => ({
    id: c.id,
    acronym: c.acronym,
    name: c.name,
    scope: c.scope,
    kind: c.kind,
    contract_value_sar: c.contractValueSAR,
    on_time_pct: c.onTimePct,
    quality_score: c.qualityScore,
    fines_ytd_sar: c.finesYTD_SAR,
    late_findings_count: c.lateFindingsCount,
    escalations_count: c.escalationsCount,
    owned_findings_count: findings.filter((f) => f.contractorId === c.id).length,
    blocked_findings_count: findings.filter((f) => f.contractorId === c.id && f.status === "blocked").length,
    composite_score: compositeScore(c),
  }));
  const contractorsRanked = [...contractorsWithPerf].sort((a, b) => b.composite_score - a.composite_score);
  const totalContractValue = contractorsWithPerf.reduce((s, c) => s + c.contract_value_sar, 0);

  return {
    generated_at: new Date().toISOString(),

    corridor: {
      name: {
        en: "Prince Mohammed bin Salman Road Axis",
        ar: "محور طريق الأمير محمد بن سلمان",
      },
      total_km: CORRIDOR_TOTAL_KM,
      daily_vehicles: 170_000,
      endpoints: {
        en: "Jeddah Islamic Port → Al-Masjid Al-Haram (Makkah)",
        ar: "ميناء جدة الإسلامي → المسجد الحرام (مكة المكرمة)",
      },
      sub_stretches: subStretches.map((s) => ({
        id: s.id,
        name: s.name,
        start_km: s.startKm,
        end_km: s.endKm,
        character: s.description,
      })),
      phases: [1, 2, 3, 4, 5].map((p) => ({
        phase: p,
        zones_from: (p - 1) * 15 + 1,
        zones_to: p * 15,
      })),
    },

    hajj_readiness: {
      next_hajj_date: NEXT_HAJJ_DATE_ISO,
      days_remaining: days,
      on_track: onTrackOverall,
      summary_en: `${days} days until Hajj ${NEXT_HAJJ_DATE_ISO}. Average 2027-KPI progress is ${Math.round(kpiAvg * 100)}% of target — corridor is ${onTrackOverall ? "tracking" : "behind"} the ramp.`,
      summary_ar: `${days} يوماً حتى الحج ${NEXT_HAJJ_DATE_ISO}. متوسط تقدّم مستهدفات 2027 يبلغ ${Math.round(kpiAvg * 100)}% من المستهدف — المحور ${onTrackOverall ? "ضمن المسار" : "متأخر عن المسار"}.`,
    },

    kpis: kpis.map((k) => ({
      id: k.id,
      label: k.label,
      target_pct: k.targetPct,
      current_pct: k.currentPct,
      weekly_delta_pct: k.trendPctDelta,
      on_track: k.currentPct / k.targetPct >= 0.5,
      category: k.category,
    })),

    contractors: contractorsWithPerf,
    vendor_performance: {
      total_corridor_contract_value_sar: totalContractValue,
      best_overall: pickTop(contractorsWithPerf, (c) => c.composite_score),
      worst_overall: pickBottom(contractorsRanked.filter((c) => c.contract_value_sar > 0), (c) => c.composite_score),
      most_fined: pickTop(contractorsWithPerf, (c) => c.fines_ytd_sar),
      most_late: pickTop(contractorsWithPerf, (c) => c.late_findings_count),
      highest_quality: pickTop(contractorsRanked.filter((c) => c.contract_value_sar > 0), (c) => c.quality_score),
      largest_contract: pickTop(contractorsWithPerf, (c) => c.contract_value_sar),
      ranked_by_composite: contractorsRanked.map((c) => ({ id: c.id, acronym: c.acronym, composite_score: c.composite_score })),
    },

    poc_zones: POC_ZONE_IDS.map((id) => {
      const z = zones.find((zz) => zz.id === id)!;
      const fz = findings.filter((f) => f.zoneId === id);
      const zoneAssets = assets.filter((a) => a.zoneId === id);
      return {
        id: z.id,
        name: z.name,
        phase: z.phase,
        sub_stretch: z.subStretch,
        km_range: `${z.startKm}–${z.endKm} km`,
        density: z.density,
        traffic_per_day: z.trafficPerDay,
        findings_total: fz.length,
        findings_open: fz.filter((f) => f.status === "open").length,
        findings_done: fz.filter((f) => f.status === "done").length,
        findings_blocked: fz.filter((f) => f.status === "blocked").length,
        findings_high_severity: fz.filter((f) => f.severity === "high").length,
        development_count: fz.filter((f) => f.activityType === "development").length,
        operational_count: fz.filter((f) => f.activityType === "operational").length,
        budget_committed_sar: fz.reduce((s, f) => s + (f.budgetSAR ?? 0), 0),
        budget_spent_sar: fz.reduce((s, f) => s + (f.spentSAR ?? 0), 0),
        contractors: Array.from(new Set(fz.map((f) => f.contractorId)))
          .map((cid) => contractors.find((c) => c.id === cid)?.acronym ?? cid),
        asset_count_by_type: bucketBy(zoneAssets, (a) => a.type),
        headline_en: id === 8
          ? "Workshops belt, asphalt deterioration, damaged median barriers"
          : id === 35
            ? "Slum cluster, ad-board mess, fuel-station code violations"
            : "Pilgrim approach: bridge perimeter, inspection-point appearance, barriers",
        headline_ar: id === 8
          ? "حزام ورش، تدهور سفلتة، حواجز جزيرة وسطية متهالكة"
          : id === 35
            ? "تجمع عشوائيات، فوضى لوحات إعلانية، مخالفات محطات وقود"
            : "مدخل الحجاج: حرم الكبري، مظهر نقطة التفتيش، حواجز",
      };
    }),

    findings_aggregate: {
      total,
      open,
      in_progress: inProgress,
      done,
      blocked,
      high_severity_open: highOpen,
      by_activity_type: {
        development: findings.filter((f) => f.activityType === "development").length,
        operational: findings.filter((f) => f.activityType === "operational").length,
      },
      by_category: bucketBy(findings, (f) => f.category),
      by_status: bucketBy(findings, (f) => f.status),
      by_contractor: bucketBy(findings, (f) => contractors.find((c) => c.id === f.contractorId)?.acronym ?? f.contractorId),
      by_zone: bucketBy(findings, (f) => `Z${f.zoneId}`),
      top_blockers: topBlockers,
    },

    glossary: [
      {
        term_en: "Visual distortion (urban)",
        term_ar: "تشوه بصري / حضري",
        definition_en: "Any element that degrades the visual quality of the corridor — graffiti, oversize ad boards, unfinished construction, abandoned vehicles, broken barriers, etc.",
        definition_ar: "أي عنصر يخفض الجودة البصرية للمحور — كتابات على الجدران، لوحات إعلانية بأحجام مخالفة، سواكر، مركبات مهجورة، حواجز مكسورة، إلخ.",
      },
      {
        term_en: "Development activity",
        term_ar: "نشاط تطويري",
        definition_en: "Major capital fixes to address the report's primary findings (new fuel station, demolition, asphalt overlay, bridge repair, greenery program). Has budget, contractor, target date.",
        definition_ar: "أعمال رأسمالية رئيسية لمعالجة الملاحظات الأساسية في التقرير (محطة وقود جديدة، هدم، إعادة سفلتة، إصلاح كبري، برنامج تشجير). لها ميزانية ومقاول وتاريخ مستهدف.",
      },
      {
        term_en: "Operational activity",
        term_ar: "نشاط تشغيلي",
        definition_en: "Day-to-day inspector findings, mostly visual-distortion related, on a short cycle: Open → Assigned → Fixed → Verified.",
        definition_ar: "ملاحظات مفتشين يومية، معظمها متعلق بالتشوه البصري، بدورة قصيرة: مفتوحة → مُسندة → مُصلحة → مُتحقق منها.",
      },
      {
        term_en: "Sub-stretch",
        term_ar: "قطاع جغرافي",
        definition_en: "One of three natural geographic segments of the 75 km corridor: Port (0–30 km), Middle (30–64 km), Haram (64–75 km).",
        definition_ar: "أحد ثلاثة قطاعات جغرافية طبيعية للمحور الذي طوله 75 كم: الميناء (0–30 كم)، الوسط (30–64 كم)، الحرم (64–75 كم).",
      },
      {
        term_en: "Phase",
        term_ar: "مرحلة",
        definition_en: "One of 5 operational rollout phases. Each phase covers 15 zones (15 km).",
        definition_ar: "واحدة من 5 مراحل إطلاق تشغيلية. كل مرحلة تغطي 15 نطاقاً (15 كم).",
      },
      {
        term_en: "Zone",
        term_ar: "نطاق",
        definition_en: "A 1-km segment of the corridor. There are 75 zones in total (Z1–Z75). PoC data exists for Z8, Z35, Z70.",
        definition_ar: "مقطع طوله 1 كم من المحور. يوجد إجمالاً 75 نطاقاً (Z1–Z75). البيانات التجريبية متوفرة للنطاقات Z8 و Z35 و Z70.",
      },
    ],

    scope_notes: {
      poc_zone_ids: [...POC_ZONE_IDS],
      out_of_scope_response_en:
        "Synthetic data is only available for the 3 PoC zones (Z8, Z35, Z70). For other zones I can describe their phase and sub-stretch, but findings, budgets, and inspector details are not yet populated.",
      out_of_scope_response_ar:
        "البيانات التجريبية متوفرة فقط لنطاقات التجربة الثلاثة (Z8 و Z35 و Z70). لباقي النطاقات أستطيع تحديد المرحلة والقطاع الجغرافي فقط، أما الملاحظات والميزانيات وتفاصيل المفتشين فلم تُحقَن بعد.",
    },
  };
}

// Convenience export (snapshot taken at module load)
export const facts: FactsSnapshot = buildFactsSnapshot();
