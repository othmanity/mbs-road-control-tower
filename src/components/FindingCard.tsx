import type { Finding, Lang } from "../types";
import { getAgency } from "../data/agencies";
import { StatusChip, SeverityChip } from "../pages/Overview";

interface FindingCardProps {
  lang: Lang;
  finding: Finding;
}

const CATEGORY_LABEL: Record<string, { en: string; ar: string }> = {
  slums:                    { en: "Slums",                    ar: "عشوائيات" },
  building_violations:      { en: "Building violations",      ar: "مخالفات مبانٍ" },
  barriers_damaged:         { en: "Damaged barriers",         ar: "حواجز متهالكة" },
  asphalt_digging:          { en: "Asphalt / trenches",       ar: "سفلتة / حفر" },
  bridge_perimeter:         { en: "Bridge perimeter",         ar: "حرم الجسر" },
  fuel_station_violation:   { en: "Fuel-station violation",   ar: "مخالفة محطة وقود" },
  ad_boards:                { en: "Ad boards",                ar: "لوحات إعلانية" },
  unfinished_construction:  { en: "Unfinished construction",  ar: "سواكر" },
  illegal_workshops:        { en: "Illegal workshops",        ar: "ورش غير نظامية" },
  inspection_point:         { en: "Inspection point",         ar: "نقطة تفتيش" },
  infrastructure:           { en: "Infrastructure",           ar: "بنية تحتية" },
  service_asset:            { en: "Service asset",            ar: "أصل خدمي" },
  greenery:                 { en: "Greenery",                 ar: "تشجير" },
};

export default function FindingCard({ lang, finding }: FindingCardProps) {
  const agency = getAgency(finding.ownerAgencyId);
  const cat = CATEGORY_LABEL[finding.category] ?? { en: finding.category, ar: finding.category };
  const isDev = finding.activityType === "development";
  const budgetPct = finding.budgetSAR && finding.spentSAR != null
    ? Math.round((finding.spentSAR / finding.budgetSAR) * 100)
    : null;

  return (
    <div
      style={{
        background: "#fff", border: "1px solid #EAEAEA", borderRadius: 10,
        padding: 14,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {/* Header row: id + activity + category + status + severity */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "#9DB5AC", fontWeight: 700, letterSpacing: 0.5 }}>
            {finding.id}
          </span>
          <span
            className="pill"
            style={{
              background: isDev ? "#E6F0FF" : "#FFF4D6",
              color: isDev ? "#005A96" : "#8A6A00",
            }}
          >
            {isDev
              ? (lang === "en" ? "Development" : "تطويرية")
              : (lang === "en" ? "Operational" : "تشغيلية")}
          </span>
          <span className="pill" style={{ background: "#F4F6F8", color: "#323232" }}>
            {lang === "en" ? cat.en : cat.ar}
          </span>
          <StatusChip status={finding.status} lang={lang} />
          <SeverityChip severity={finding.severity} lang={lang} />
          {finding.reopenedCount != null && finding.reopenedCount > 0 && (
            <span className="pill" style={{ background: "#FBE0E3", color: "#AF0818" }}>
              {lang === "en"
                ? `Reopened ×${finding.reopenedCount}`
                : `أُعيد فتحها ×${finding.reopenedCount}`}
            </span>
          )}
        </div>

        {/* Title + description */}
        <div style={{ fontSize: 14, fontWeight: 700, color: "#160F3E", marginBottom: 4 }}>
          {lang === "en" ? finding.title.en : finding.title.ar}
        </div>
        <div style={{ fontSize: 12, color: "#595959", lineHeight: 1.5 }}>
          {lang === "en" ? finding.description.en : finding.description.ar}
        </div>

        {/* Meta grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 8,
            marginTop: 10,
            fontSize: 11,
            color: "#595959",
          }}
        >
          <Meta
            label={lang === "en" ? "Owner" : "الجهة المالكة"}
            value={agency ? `${agency.acronym} · ${lang === "en" ? agency.name.en : agency.name.ar}` : "—"}
          />
          <Meta
            label={lang === "en" ? "Opened" : "تاريخ الفتح"}
            value={finding.openedOn}
          />
          <Meta
            label={lang === "en" ? "Target" : "الموعد المستهدف"}
            value={finding.targetDate}
          />
          {finding.closedOn && (
            <Meta
              label={lang === "en" ? "Closed" : "تاريخ الإغلاق"}
              value={finding.closedOn}
            />
          )}
          {finding.inspectorName && (
            <Meta
              label={lang === "en" ? "Inspector" : "المفتش"}
              value={finding.inspectorName}
            />
          )}
          {finding.budgetSAR && (
            <Meta
              label={lang === "en" ? "Budget (SAR)" : "الميزانية (ر.س)"}
              value={`${finding.budgetSAR.toLocaleString()}${
                budgetPct != null ? ` · ${budgetPct}% spent` : ""
              }`}
            />
          )}
        </div>
      </div>

      {/* Right rail: before/after slot */}
      <div
        style={{
          width: 130,
          minHeight: 100,
          background: "#F4F6F8",
          border: "1px dashed #CDCCD5",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#9DB5AC",
          fontSize: 11,
          textAlign: "center",
          padding: 8,
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 4 }}>◫</div>
        {finding.beforePhoto || finding.afterPhoto
          ? (lang === "en" ? "Photo on file" : "صورة محفوظة")
          : (lang === "en" ? "No photo yet" : "لا توجد صورة")}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#9DB5AC", letterSpacing: 0.3, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: "#323232", fontWeight: 500 }}>{value}</div>
    </div>
  );
}
