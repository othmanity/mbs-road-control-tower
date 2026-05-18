import type { Lang, KpiTarget } from "../types";

interface KpiTileProps {
  lang: Lang;
  kpi: KpiTarget;
}

export default function KpiTile({ lang, kpi }: KpiTileProps) {
  const pct = Math.min(100, kpi.currentPct);
  const remaining = Math.max(0, kpi.targetPct - kpi.currentPct);
  const trendPositive = kpi.trendPctDelta >= 0;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #EAEAEA",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 140,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: "#595959", lineHeight: 1.35, minHeight: 32 }}>
        {lang === "en" ? kpi.label.en : kpi.label.ar}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: "#066058" }}>
          {kpi.currentPct}%
        </span>
        <span style={{ fontSize: 12, color: "#9DB5AC" }}>
          {lang === "en" ? `of ${kpi.targetPct}% target` : `من ${kpi.targetPct}% المستهدف`}
        </span>
      </div>

      <div
        style={{
          height: 6, borderRadius: 6,
          background: "#EAEAEA",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${(pct / kpi.targetPct) * 100}%`,
            height: "100%",
            background: pct / kpi.targetPct > 0.6 ? "#27AA8C" : pct / kpi.targetPct > 0.3 ? "#FFC107" : "#FD7E14",
            borderRadius: 6,
            transition: "width 0.6s ease",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#595959" }}>
        <span style={{ color: trendPositive ? "#006604" : "#AF0818", fontWeight: 600 }}>
          {trendPositive ? "▲" : "▼"} {Math.abs(kpi.trendPctDelta).toFixed(1)}% {lang === "en" ? "wk" : "أسبوع"}
        </span>
        <span>
          {lang === "en" ? `${remaining}% to go` : `${remaining}% متبقي`}
        </span>
      </div>
    </div>
  );
}
