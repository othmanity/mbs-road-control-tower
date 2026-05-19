import { useState } from "react";
import type { Lang } from "../types";
import { exportControlTowerReport } from "../utils/exportReport";
import { POC_ZONE_IDS, getZone } from "../data/corridor";

interface ReportsProps {
  lang: Lang;
}

export default function Reports({ lang }: ReportsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (scope: "all" | number, label: string) => {
    if (exporting) return;
    setExporting(label);
    try {
      await exportControlTowerReport({ lang, scope });
    } catch (err) {
      console.error(err);
      alert(lang === "en" ? "Export failed" : "فشل التصدير");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#160F3E" }}>
          {lang === "en" ? "Reports" : "التقارير"}
        </h2>
        <p style={{ fontSize: 13, color: "#595959", marginTop: 2 }}>
          {lang === "en"
            ? "Leadership-style PDF exports — full corridor or per-zone."
            : "تقارير PDF بصياغة قيادية — للمحور كاملاً أو لكل نطاق."}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        <ReportCard
          lang={lang}
          title={{
            en: "Full Control Tower Report",
            ar: "تقرير غرفة العمليات الكامل",
          }}
          subtitle={{
            en: "Executive summary, 2027 KPI table, all PoC findings",
            ar: "ملخص تنفيذي، جدول مستهدفات 2027، كل ملاحظات التجربة",
          }}
          icon="▤"
          loading={exporting === "all"}
          onExport={() => handleExport("all", "all")}
        />

        {POC_ZONE_IDS.map((id) => {
          const z = getZone(id)!;
          return (
            <ReportCard
              key={id}
              lang={lang}
              title={{
                en: `Zone ${id} report`,
                ar: `تقرير النطاق ${id}`,
              }}
              subtitle={{
                en: `${z.name.en} · phase ${z.phase} · ${z.subStretch}`,
                ar: `${z.name.ar} · المرحلة ${z.phase}`,
              }}
              icon="❐"
              loading={exporting === `zone-${id}`}
              onExport={() => handleExport(id, `zone-${id}`)}
            />
          );
        })}

      </div>

      <div
        style={{
          background: "#fff", border: "1px dashed #CDCCD5", borderRadius: 10,
          padding: 16,
          fontSize: 12, color: "#595959", lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "#160F3E" }}>{lang === "en" ? "Coming next" : "قادم لاحقاً"}: </strong>
        {lang === "en"
          ? "Hajj-readiness brief, weekly executive digest, automated leadership packet (Arabic + English), embedded maps & before/after photo grid."
          : "موجز الاستعداد للحج، نشرة تنفيذية أسبوعية، حزمة قيادية تلقائية (عربي/إنجليزي)، خرائط مضمنة وشبكة صور قبل/بعد."}
      </div>
    </div>
  );
}

function ReportCard({
  lang, title, subtitle, icon, loading, onExport,
}: {
  lang: Lang;
  title: { en: string; ar: string };
  subtitle: { en: string; ar: string };
  icon: string;
  loading: boolean;
  onExport: () => void;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #EAEAEA",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: 8,
            background: "rgba(38,99,75,0.10)",
            color: "#066058",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#160F3E" }}>
            {lang === "en" ? title.en : title.ar}
          </div>
          <div style={{ fontSize: 11, color: "#595959" }}>
            {lang === "en" ? subtitle.en : subtitle.ar}
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={onExport}
        disabled={loading}
        style={{ marginTop: "auto" }}
      >
        {loading
          ? (lang === "en" ? "Preparing…" : "جارٍ التحضير…")
          : (lang === "en" ? "Export PDF" : "تصدير PDF")}
      </button>
    </div>
  );
}
