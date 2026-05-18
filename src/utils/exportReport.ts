import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Lang } from "../types";
import { kpis, daysUntilHajj } from "../data/kpis";
import { findings } from "../data/findings";
import { getZone, POC_ZONE_IDS } from "../data/corridor";
import { getAgency } from "../data/agencies";
import { kbQuestions, kbCategoryLabels, type KbCategory } from "../kb/questions";
import { facts } from "../kb/facts";

const BRAND_GREEN = "#066058";
const BRAND_DARK = "#160F3E";

export async function exportControlTowerReport(opts: { lang: Lang; scope?: "all" | number }) {
  const { lang, scope = "all" } = opts;
  const t = (en: string, ar: string) => (lang === "en" ? en : ar);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const now = new Date();

  // Header banner
  doc.setFillColor(BRAND_GREEN);
  doc.rect(0, 0, pageW, 80, "F");
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(
    t("MBS Road Control Tower — Status Report", "تقرير حالة غرفة عمليات طريق الأمير محمد بن سلمان"),
    margin, 36
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    t("Ministry of Municipalities & Housing", "وزارة البلديات والإسكان"),
    margin, 56
  );
  doc.text(now.toISOString().slice(0, 10), pageW - margin, 56, { align: "right" });

  let y = 110;

  // Summary block
  doc.setTextColor(BRAND_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("EXECUTIVE SUMMARY", "الملخص التنفيذي"), margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#323232");

  const totalFindings = findings.length;
  const open = findings.filter((f) => f.status !== "done").length;
  const done = findings.filter((f) => f.status === "done").length;
  const days = daysUntilHajj();
  const summary = [
    t(`Days to next Hajj: ${days}`, `أيام حتى الحج القادم: ${days}`),
    t(`PoC zones: ${POC_ZONE_IDS.join(", ")}`, `نطاقات التجربة: ${POC_ZONE_IDS.join(", ")}`),
    t(`Total findings tracked: ${totalFindings} (${open} open · ${done} closed)`,
      `إجمالي الملاحظات: ${totalFindings} (${open} مفتوحة · ${done} مغلقة)`),
  ];
  summary.forEach((s) => { doc.text(s, margin, y); y += 14; });
  y += 6;

  // KPIs table
  autoTable(doc, {
    startY: y,
    head: [[
      t("2027 Target", "مستهدف 2027"),
      t("Current %", "الحالي %"),
      t("Target %", "المستهدف %"),
      t("Weekly Δ", "تغيّر أسبوعي"),
    ]],
    body: kpis.map((k) => [
      lang === "en" ? k.label.en : k.label.ar,
      `${k.currentPct}%`,
      `${k.targetPct}%`,
      `${k.trendPctDelta >= 0 ? "+" : ""}${k.trendPctDelta.toFixed(1)}%`,
    ]),
    headStyles: { fillColor: BRAND_GREEN, textColor: "#fff" },
    styles: { fontSize: 9, cellPadding: 6 },
    margin: { left: margin, right: margin },
  });
  // @ts-expect-error lastAutoTable injected by autoTable
  y = doc.lastAutoTable.finalY + 16;

  // Findings table (scope = "all" or specific zone)
  const scopedFindings = scope === "all" ? findings : findings.filter((f) => f.zoneId === scope);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(BRAND_DARK);
  doc.text(
    scope === "all"
      ? t("FINDINGS — ALL POC ZONES", "الملاحظات — جميع نطاقات التجربة")
      : t(`FINDINGS — ZONE ${scope}`, `الملاحظات — النطاق ${scope}`),
    margin, y
  );
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [[
      t("ID", "المعرّف"),
      t("Zone", "النطاق"),
      t("Type", "النوع"),
      t("Title", "العنوان"),
      t("Owner", "المالك"),
      t("Status", "الحالة"),
      t("Severity", "الخطورة"),
      t("Target", "الموعد"),
    ]],
    body: scopedFindings.map((f) => {
      const z = getZone(f.zoneId)!;
      const a = getAgency(f.ownerAgencyId)!;
      return [
        f.id,
        lang === "en" ? z.name.en : z.name.ar,
        f.activityType === "development" ? t("Dev", "تطوير") : t("Ops", "تشغيل"),
        lang === "en" ? f.title.en : f.title.ar,
        a.acronym,
        f.status,
        f.severity,
        f.targetDate,
      ];
    }),
    headStyles: { fillColor: BRAND_GREEN, textColor: "#fff" },
    styles: { fontSize: 8, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 50 },
      3: { cellWidth: 160 },
    },
    margin: { left: margin, right: margin },
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#595959");
    doc.text(
      t(
        `MBS Road Control Tower · Synthetic PoC data · Page ${i} of ${totalPages}`,
        `غرفة عمليات طريق الأمير محمد بن سلمان · بيانات تجريبية · صفحة ${i} من ${totalPages}`
      ),
      margin,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  doc.save(
    scope === "all"
      ? `mbs-control-tower-report-${now.toISOString().slice(0, 10)}.pdf`
      : `mbs-zone-${scope}-report-${now.toISOString().slice(0, 10)}.pdf`
  );
}

// =====================================================================
// Knowledge base export — Q&A pairs + structured facts summary
// =====================================================================
export async function exportKnowledgeBaseReport(opts: { lang: Lang }) {
  const { lang } = opts;
  const t = (en: string, ar: string) => (lang === "en" ? en : ar);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const now = new Date();

  // Header banner
  doc.setFillColor(BRAND_GREEN);
  doc.rect(0, 0, pageW, 80, "F");
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(
    t("Control Tower Agent — Knowledge Base", "وكيل غرفة العمليات — قاعدة المعرفة"),
    margin, 36
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    t("Ministry of Municipalities & Housing", "وزارة البلديات والإسكان"),
    margin, 56
  );
  doc.text(now.toISOString().slice(0, 10), pageW - margin, 56, { align: "right" });

  let y = 110;

  // Intro block
  doc.setTextColor(BRAND_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("ABOUT THIS DOCUMENT", "حول هذا المستند"), margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#323232");

  const intro = t(
    `This knowledge base lists the ${kbQuestions.length} questions the Control Tower Agent must answer reliably, plus the structured facts each answer is derived from. It is the contract between the leadership team and the agent. The same content is exported as JSON to feed the LLM.`,
    `تحتوي قاعدة المعرفة هذه على ${kbQuestions.length} سؤالاً يجب على وكيل غرفة العمليات الإجابة عنها بشكل موثوق، إلى جانب الحقائق المنظّمة التي تستند إليها كل إجابة. تمثل عقد العمل بين فريق القيادة والوكيل. ويُصدَّر نفس المحتوى بصيغة JSON لتغذية النموذج اللغوي.`
  );
  const wrapped = doc.splitTextToSize(intro, pageW - margin * 2);
  doc.text(wrapped, margin, y);
  y += wrapped.length * 14 + 14;

  // Summary table by category
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(BRAND_DARK);
  doc.text(t("CATEGORIES", "التصنيفات"), margin, y);
  y += 10;

  const catCounts: Record<string, number> = {};
  for (const q of kbQuestions) catCounts[q.category] = (catCounts[q.category] ?? 0) + 1;

  autoTable(doc, {
    startY: y,
    head: [[t("Category", "التصنيف"), t("Questions", "عدد الأسئلة")]],
    body: Object.entries(catCounts).map(([key, n]) => {
      const label = kbCategoryLabels[key as KbCategory];
      return [lang === "en" ? label.en : label.ar, String(n)];
    }),
    headStyles: { fillColor: BRAND_GREEN, textColor: "#fff" },
    styles: { fontSize: 9, cellPadding: 6 },
    columnStyles: { 1: { halign: "right", cellWidth: 80 } },
    margin: { left: margin, right: margin },
  });
  // @ts-expect-error lastAutoTable injected by autoTable
  y = doc.lastAutoTable.finalY + 16;

  // Q&A — grouped by category
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(BRAND_DARK);
  doc.text(t("QUESTIONS & ANSWERS", "الأسئلة والأجوبة"), margin, y);
  y += 12;

  const grouped: Record<string, typeof kbQuestions> = {};
  for (const q of kbQuestions) (grouped[q.category] ??= []).push(q);

  const ensureSpace = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = 60;
    }
  };

  for (const [cat, items] of Object.entries(grouped)) {
    const label = kbCategoryLabels[cat as KbCategory];

    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(BRAND_GREEN);
    doc.text(`▸ ${lang === "en" ? label.en : label.ar}`, margin, y);
    y += 14;

    for (const q of items) {
      ensureSpace(80);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor("#9DB5AC");
      doc.text(q.id, margin, y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(BRAND_DARK);
      const qText = lang === "en" ? q.q_en : q.q_ar;
      const qWrap = doc.splitTextToSize(qText, pageW - margin * 2 - 44);
      doc.text(qWrap, margin + 36, y);
      y += qWrap.length * 12 + 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor("#323232");
      const aText = lang === "en" ? q.a_en : q.a_ar;
      const aWrap = doc.splitTextToSize(aText, pageW - margin * 2 - 24);
      ensureSpace(aWrap.length * 12 + 18);
      doc.text(aWrap, margin + 12, y);
      y += aWrap.length * 12 + 4;

      // Data refs (small grey)
      if (q.data_refs.length) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor("#595959");
        const refs = `${t("data: ", "بيانات: ")}${q.data_refs.join(", ")}`;
        const refsWrap = doc.splitTextToSize(refs, pageW - margin * 2 - 24);
        ensureSpace(refsWrap.length * 10 + 8);
        doc.text(refsWrap, margin + 12, y);
        y += refsWrap.length * 10 + 10;
      } else {
        y += 6;
      }
    }
    y += 6;
  }

  // Structured-facts appendix
  doc.addPage();
  y = 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(BRAND_DARK);
  doc.text(t("APPENDIX A — STRUCTURED FACTS SNAPSHOT", "ملحق أ — لقطة الحقائق المنظّمة"), margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor("#595959");
  doc.text(
    t("This snapshot is what would be sent to the LLM as system-prompt context.",
      "هذه اللقطة هي ما سيُرسل إلى النموذج اللغوي كسياق ضمن system prompt."),
    margin, y + 14
  );
  y += 28;

  // Corridor + Hajj summary
  autoTable(doc, {
    startY: y,
    head: [[t("Corridor & Hajj", "المحور والحج"), ""]],
    body: [
      [t("Total length", "الطول"), `${facts.corridor.total_km} km`],
      [t("Daily vehicles", "المركبات اليومية"), facts.corridor.daily_vehicles.toLocaleString()],
      [t("Endpoints", "الطرفان"), lang === "en" ? facts.corridor.endpoints.en : facts.corridor.endpoints.ar],
      [t("Next Hajj", "الحج القادم"), facts.hajj_readiness.next_hajj_date],
      [t("Days remaining", "أيام متبقية"), String(facts.hajj_readiness.days_remaining)],
      [t("On track?", "ضمن المسار؟"), facts.hajj_readiness.on_track ? t("Yes", "نعم") : t("No", "لا")],
    ],
    headStyles: { fillColor: BRAND_GREEN, textColor: "#fff" },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 180 } },
    margin: { left: margin, right: margin },
  });
  // @ts-expect-error lastAutoTable injected by autoTable
  y = doc.lastAutoTable.finalY + 14;

  // KPIs
  autoTable(doc, {
    startY: y,
    head: [[t("2027 KPI", "مستهدف 2027"), t("Current", "الحالي"), t("Target", "المستهدف"), t("Δ/wk", "تغيّر أسبوعي"), t("On track", "ضمن المسار")]],
    body: facts.kpis.map((k) => [
      lang === "en" ? k.label.en : k.label.ar,
      `${k.current_pct}%`,
      `${k.target_pct}%`,
      `${k.weekly_delta_pct >= 0 ? "+" : ""}${k.weekly_delta_pct.toFixed(1)}%`,
      k.on_track ? "✓" : "✗",
    ]),
    headStyles: { fillColor: BRAND_GREEN, textColor: "#fff" },
    styles: { fontSize: 9, cellPadding: 5 },
    margin: { left: margin, right: margin },
  });
  // @ts-expect-error lastAutoTable injected by autoTable
  y = doc.lastAutoTable.finalY + 14;

  // PoC zones rollup
  autoTable(doc, {
    startY: y,
    head: [[t("PoC Zone", "نطاق تجريبي"), t("Phase", "المرحلة"), t("Findings", "ملاحظات"), t("Open", "مفتوحة"), t("Dev/Ops", "تطوير/تشغيل"), t("Budget (SAR)", "الميزانية")]],
    body: facts.poc_zones.map((z) => [
      `Z${z.id} · ${lang === "en" ? z.headline_en : z.headline_ar}`,
      String(z.phase),
      String(z.findings_total),
      String(z.findings_open),
      `${z.development_count} / ${z.operational_count}`,
      z.budget_committed_sar.toLocaleString(),
    ]),
    headStyles: { fillColor: BRAND_GREEN, textColor: "#fff" },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 0: { cellWidth: 220 } },
    margin: { left: margin, right: margin },
  });
  // @ts-expect-error lastAutoTable injected by autoTable
  y = doc.lastAutoTable.finalY + 14;

  // Agencies
  autoTable(doc, {
    startY: y,
    head: [[t("Agency", "الجهة"), t("Scope", "النطاق"), t("Findings", "ملاحظات"), t("Blocked", "متعثرة")]],
    body: facts.agencies.map((a) => [
      `${a.acronym} — ${lang === "en" ? a.name.en : a.name.ar}`,
      lang === "en" ? a.scope.en : a.scope.ar,
      String(a.owned_findings_count),
      String(a.blocked_findings_count),
    ]),
    headStyles: { fillColor: BRAND_GREEN, textColor: "#fff" },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 0: { cellWidth: 180 } },
    margin: { left: margin, right: margin },
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#595959");
    doc.text(
      t(
        `Control Tower Agent · Knowledge Base · Page ${i} of ${totalPages}`,
        `وكيل غرفة العمليات · قاعدة المعرفة · صفحة ${i} من ${totalPages}`
      ),
      margin,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  doc.save(`mbs-ct-knowledge-base-${now.toISOString().slice(0, 10)}.pdf`);
}
