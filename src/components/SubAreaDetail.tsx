import type { SubArea } from "../data/mockData";

interface SubAreaDetailProps {
  lang: "en" | "ar";
  area: SubArea;
}

function Metric({
  label,
  baseline,
  current,
  growthPct,
  unit,
  yearBase,
  yearCur,
  lang,
}: {
  label: string;
  baseline: number;
  current: number;
  growthPct: number;
  unit?: string;
  yearBase: number;
  yearCur: number;
  lang: "en" | "ar";
}) {
  const up = growthPct >= 0;
  const color = growthPct >= 100 ? "#AF0818" : growthPct >= 50 ? "#FD7E14" : "#26634B";
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #EAEAEA",
        borderRadius: 8,
        padding: "12px 14px",
      }}
    >
      <div style={{ fontSize: 11, color: "#595959", fontWeight: 600, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 10, color: "#888" }}>{yearBase}</div>
          <div style={{ fontSize: 15, color: "#160F3E", fontWeight: 600 }}>
            {baseline.toLocaleString()}
            {unit && <span style={{ fontSize: 11, color: "#595959", marginLeft: 2 }}>{unit}</span>}
          </div>
        </div>
        <div style={{ color: "#888", fontSize: 13 }}>→</div>
        <div>
          <div style={{ fontSize: 10, color: "#888" }}>{yearCur}</div>
          <div style={{ fontSize: 17, color: "#160F3E", fontWeight: 700 }}>
            {current.toLocaleString()}
            {unit && <span style={{ fontSize: 11, color: "#595959", marginLeft: 2 }}>{unit}</span>}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "inline-block",
          padding: "2px 10px",
          borderRadius: 48,
          background: `${color}15`,
          color,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {up ? "+" : ""}
        {growthPct.toFixed(2)}% {lang === "en" ? "change" : "تغير"}
      </div>
    </div>
  );
}

export default function SubAreaDetail({ lang, area }: SubAreaDetailProps) {
  const t = (en: string, ar: string) => (lang === "en" ? en : ar);
  const confidenceColor =
    area.recommendation.confidence === "High"
      ? "#006604"
      : area.recommendation.confidence === "Moderate"
      ? "#FD7E14"
      : "#AF0818";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        border: "1px solid #EAEAEA",
        padding: 16,
        marginTop: 16,
        animation: "fadeInUp 0.3s ease-out",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, color: "#595959", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {t(`Sub-area within ${area.parent}`, `منطقة ضمن ${area.parent === "Al-Ahsa" ? "الأحساء" : area.parent}`)}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#160F3E", margin: "2px 0 4px" }}>
            {lang === "en" ? area.name : area.nameAr}
          </h3>
          <div style={{ fontSize: 12, color: "#595959" }}>
            {t(
              `${area.planContext.planNameEn} (No. ${area.planContext.planNumber}) · ${area.planContext.municipalityEn} Municipality`,
              `${area.planContext.planNameAr} (رقم ${area.planContext.planNumber}) · أمانة ${area.planContext.municipalityAr}`
            )}
          </div>
        </div>
        <a
          href={area.reportUrl}
          download
          style={{
            padding: "10px 20px",
            borderRadius: 48,
            background: "#26634B",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            fontFamily: "'Noto Naskh Arabic', sans-serif",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          {t("Download Full Report (PDF)", "تحميل التقرير الكامل (PDF)")}
        </a>
      </div>

      {/* Recommendation banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 16px",
          background: "linear-gradient(to right, rgba(38,99,75,0.08), rgba(10,235,215,0.04))",
          border: "1.5px solid rgba(38,99,75,0.25)",
          borderRadius: 8,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🧭</span>
          <div>
            <div style={{ fontSize: 10, color: "#595959", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {t("Recommended Expansion", "التوسع الموصى به")}
            </div>
            <div style={{ fontSize: 15, color: "#160F3E", fontWeight: 700 }}>
              {lang === "en" ? area.recommendation.direction : area.recommendation.directionAr}
              {" · "}
              {area.recommendation.hectares} {t("hectares", "هكتار")}
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "4px 12px",
            borderRadius: 48,
            background: `${confidenceColor}15`,
            color: confidenceColor,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {t(`${area.recommendation.confidence} confidence`, `ثقة ${area.recommendation.confidence === "Moderate" ? "متوسطة" : area.recommendation.confidence === "High" ? "عالية" : "منخفضة"}`)}
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
        <Metric
          label={t("Population", "السكان")}
          baseline={area.population.baseline}
          current={area.population.current}
          growthPct={area.population.growthPct}
          yearBase={area.baselineYear}
          yearCur={area.currentYear}
          lang={lang}
        />
        <Metric
          label={t("Residential land", "الأراضي السكنية")}
          baseline={area.residentialHa.baseline}
          current={area.residentialHa.current}
          growthPct={area.residentialHa.growthPct}
          unit="ha"
          yearBase={area.baselineYear}
          yearCur={area.currentYear}
          lang={lang}
        />
        <Metric
          label={t("Vacant land", "الأراضي الفضاء")}
          baseline={area.vacantHa.baseline}
          current={area.vacantHa.current}
          growthPct={area.vacantHa.growthPct}
          unit="ha"
          yearBase={area.baselineYear}
          yearCur={area.currentYear}
          lang={lang}
        />
        <Metric
          label={t("Density", "الكثافة")}
          baseline={area.densityPerHa.baseline}
          current={area.densityPerHa.current}
          growthPct={area.densityPerHa.growthPct}
          unit="p/ha"
          yearBase={area.baselineYear}
          yearCur={area.currentYear}
          lang={lang}
        />
      </div>

      {/* Planning interpretation */}
      <div
        style={{
          marginTop: 14,
          padding: "10px 14px",
          background: "#f8f9fa",
          borderLeft: "3px solid #26634B",
          fontSize: 12,
          color: "#323232",
          lineHeight: 1.6,
        }}
      >
        {t(
          "Population grew faster than developable land supply. Density rose sharply while vacant-land reserves changed only marginally — indicating growth is being absorbed through intensification. Controlled westward expansion is the most defensible direction.",
          "نما عدد السكان بمعدل أسرع من توسع المعروض من الأراضي القابلة للتطوير. ارتفعت الكثافة بشكل حاد بينما تغيرت الأراضي الفضاء بشكل طفيف فقط — مما يشير إلى أن النمو يتم استيعابه عبر التكثيف. التوسع الغربي المنضبط هو الاتجاه الأكثر قابلية للتبرير."
        )}
      </div>
    </div>
  );
}
