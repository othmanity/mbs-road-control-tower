import { useEffect, useState } from "react";
import { api, type Report } from "../../api/client";
import { useMediaQuery, MOBILE } from "../../hooks/useMediaQuery";

interface ReportingProps {
  lang: "en" | "ar";
}

const KIND_STYLE: Record<Report["kind"], { bg: string; text: string; label: string }> = {
  executive: { bg: "#FEE2E2", text: "#991B1B", label: "EXECUTIVE" },
  analysis:  { bg: "#DBEAFE", text: "#1E40AF", label: "ANALYSIS" },
  external:  { bg: "#FEF3C7", text: "#92400E", label: "EXTERNAL" },
  generated: { bg: "#DCFCE7", text: "#166534", label: "GENERATED" },
};

// Dropdown options. Only "ash-shati" is enabled in this PoC since the
// generated report covers Ash Shati Ash Sharqi specifically; the rest are
// visible but dimmed so stakeholders can see the future scope.
const AREA_OPTIONS: Array<{ value: string; en: string; ar: string; enabled: boolean }> = [
  { value: "ash-shati",  en: "Ash Shati Ash Sharqi",   ar: "الشاطئ الشرقي",                   enabled: true  },
  { value: "all",        en: "All areas (Saudi-wide)", ar: "كل المناطق (على مستوى المملكة)", enabled: false },
  { value: "riyadh",     en: "Riyadh",                 ar: "الرياض",                          enabled: false },
  { value: "jeddah",     en: "Jeddah",                 ar: "جدة",                             enabled: false },
  { value: "dammam",     en: "Dammam",                 ar: "الدمام",                          enabled: false },
  { value: "makkah",     en: "Makkah",                 ar: "مكة المكرمة",                     enabled: false },
  { value: "madinah",    en: "Madinah",                ar: "المدينة المنورة",                 enabled: false },
  { value: "al-ahsa",    en: "Al-Ahsa",                ar: "الأحساء",                         enabled: false },
  { value: "al-seh",     en: "Al-Seh",                 ar: "السيح",                           enabled: false },
];

const LAYER_OPTIONS: Array<{ value: string; en: string; ar: string; enabled: boolean }> = [
  { value: "all",                    en: "All layers (19)",            ar: "كل الطبقات (19)",            enabled: true },
  { value: "district_boundary",      en: "Layer 1 · District Boundary", ar: "طبقة 1 · حدود الحي",         enabled: false },
  { value: "parcels",                en: "Layer 2 · Land Parcels",      ar: "طبقة 2 · قطع الأراضي",       enabled: false },
  { value: "buildings",              en: "Layer 3 · Buildings",         ar: "طبقة 3 · المباني",           enabled: false },
  { value: "building_permits",       en: "Layer 4 · Building Permits",  ar: "طبقة 4 · تراخيص البناء",     enabled: false },
  { value: "land_use",               en: "Layer 5 · Land Use",          ar: "طبقة 5 · استخدام الأراضي",   enabled: false },
  { value: "roads",                  en: "Layer 6 · Roads",             ar: "طبقة 6 · الطرق",             enabled: false },
  { value: "street_lights",          en: "Layer 7 · Street Lights",     ar: "طبقة 7 · أعمدة الإنارة",     enabled: false },
  { value: "pavements",              en: "Layer 8 · Pavements",         ar: "طبقة 8 · الأرصفة",           enabled: false },
  { value: "fire_hydrants",          en: "Layer 9 · Fire Hydrants",     ar: "طبقة 9 · صنابير الإطفاء",    enabled: false },
  { value: "pump_stations",          en: "Layer 10 · Pump Stations",    ar: "طبقة 10 · محطات الضخ",       enabled: false },
  { value: "schools",                en: "Layer 11 · Schools",          ar: "طبقة 11 · المدارس",          enabled: false },
  { value: "government_facilities",  en: "Layer 12 · Government",       ar: "طبقة 12 · المرافق الحكومية", enabled: false },
  { value: "mosques",                en: "Layer 13 · Mosques",          ar: "طبقة 13 · المساجد",          enabled: false },
  { value: "commercial",             en: "Layer 14 · Commercial",       ar: "طبقة 14 · التجاري",          enabled: false },
  { value: "public_facilities",      en: "Layer 15 · Public Facilities", ar: "طبقة 15 · المرافق العامة",  enabled: false },
  { value: "ad_signs",               en: "Layer 16 · Advertising Signs", ar: "طبقة 16 · اللافتات",         enabled: false },
  { value: "digging_permits_point",  en: "Layer 17 · Digging (Point)",  ar: "طبقة 17 · الحفر (نقطية)",    enabled: false },
  { value: "digging_permits_linear", en: "Layer 18 · Digging (Linear)", ar: "طبقة 18 · الحفر (خطية)",     enabled: false },
  { value: "subdivision_plans",      en: "Layer 19 · Subdivision Plans", ar: "طبقة 19 · مخططات التقسيم",  enabled: false },
];

const AGENT_STEPS_EN = [
  "Cataloging 19 GIS layers across selected scope…",
  "Cross-referencing data against WHO / NFPA / Saudi benchmarks…",
  "Detecting critical gaps and opportunities…",
  "Composing executive insights summary…",
  "Rendering PDF…",
];
const AGENT_STEPS_AR = [
  "فهرسة 19 طبقة جغرافية ضمن النطاق المحدد…",
  "مطابقة البيانات بمعايير منظمة الصحة العالمية / NFPA / السعودية…",
  "اكتشاف الفجوات الحرجة والفرص…",
  "صياغة ملخص الرؤى التنفيذي…",
  "إنشاء ملف PDF…",
];

export default function Reporting({ lang }: ReportingProps) {
  const t = (en: string, ar: string) => (lang === "en" ? en : ar);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState("ash-shati");
  const [layer, setLayer] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const isMobile = useMediaQuery(MOBILE);

  const deleteReport = async (id: string) => {
    setMenuOpenFor(null);
    if (!confirm(t("Delete this report? This cannot be undone.", "حذف هذا التقرير؟ لا يمكن التراجع."))) return;
    setReports((prev) => prev.filter((r) => r.id !== id)); // optimistic
    try {
      await api.reports.delete(id);
    } catch (e) {
      // restore on failure
      load();
      alert(t("Failed to delete: " + (e as Error).message, "فشل الحذف: " + (e as Error).message));
    }
  };

  // Close any open menu when clicking elsewhere
  useEffect(() => {
    const onClick = () => setMenuOpenFor(null);
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.reports.list();
      setReports(data.reports);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setStepIndex(0);

    const steps = lang === "en" ? AGENT_STEPS_EN : AGENT_STEPS_AR;
    // Walk through the agent-working messages so it feels like work is happening.
    const stepDuration = 800;
    let cancelled = false;
    const timer = setInterval(() => {
      setStepIndex((i) => {
        const next = i + 1;
        if (next >= steps.length) {
          clearInterval(timer);
          return i;
        }
        return next;
      });
    }, stepDuration);

    try {
      const areaLabel = AREA_OPTIONS.find((a) => a.value === area)?.en ?? "All areas";
      const layerLabel = LAYER_OPTIONS.find((l) => l.value === layer)?.en ?? "All layers";

      // Wait at least the full animation duration even if API is faster.
      const minWait = new Promise((r) => setTimeout(r, steps.length * stepDuration));
      const apiCall = api.reports.generatePdf({
        district: "ash-shati-ash-sharqi",
        area: areaLabel,
        layer: layerLabel,
      });
      const [, result] = await Promise.all([minWait, apiCall]);

      if (cancelled) return;
      // Optimistic prepend so the new card appears immediately at the top.
      setReports((prev) => [result.report, ...prev.filter((r) => r.id !== result.report.id)]);
    } finally {
      clearInterval(timer);
      setGenerating(false);
      setStepIndex(0);
    }

    return () => { cancelled = true; };
  };

  const generationCard = (
    <div
      style={{
        background: "#fff",
        border: "1px solid #EAEAEA",
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#160F3E", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {t("Generate a new report", "توليد تقرير جديد")}
        </h3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr auto",
          gap: 12,
          alignItems: "end",
        }}
      >
        {/* Area */}
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#595959", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            {t("Area", "المنطقة")}
          </label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            disabled={generating}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 8,
              border: "1px solid #C5DAD2",
              background: "#fff",
              color: "#160F3E",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Noto Naskh Arabic', sans-serif",
              cursor: generating ? "not-allowed" : "pointer",
            }}
          >
            {AREA_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} disabled={!o.enabled} style={{ color: o.enabled ? "#160F3E" : "#BDBDBD" }}>
                {lang === "en" ? o.en : o.ar} {!o.enabled ? " (coming soon)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Layer */}
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#595959", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            {t("Layer", "الطبقة")}
          </label>
          <select
            value={layer}
            onChange={(e) => setLayer(e.target.value)}
            disabled={generating}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 8,
              border: "1px solid #C5DAD2",
              background: "#fff",
              color: "#160F3E",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Noto Naskh Arabic', sans-serif",
              cursor: generating ? "not-allowed" : "pointer",
            }}
          >
            {LAYER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} disabled={!o.enabled} style={{ color: o.enabled ? "#160F3E" : "#BDBDBD" }}>
                {lang === "en" ? o.en : o.ar} {!o.enabled ? " (coming soon)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            padding: "10px 28px",
            background: generating ? "#9DB5AC" : "#26634B",
            color: "#fff",
            border: "none",
            borderRadius: 48,
            fontSize: 13,
            fontWeight: 600,
            cursor: generating ? "not-allowed" : "pointer",
            fontFamily: "'Noto Naskh Arabic', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {generating ? t("Working…", "جارٍ العمل…") : t("Generate", "توليد")}
        </button>
      </div>

      {/* Agent working animation */}
      {generating && (
        <div
          style={{
            marginTop: 16,
            padding: "14px 16px",
            background: "linear-gradient(to right, rgba(38,99,75,0.06), rgba(10,235,215,0.04))",
            border: "1px solid #C5DAD2",
            borderRadius: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #C5DAD2", borderTopColor: "#26634B", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#26634B", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {t("Rashid is generating the report", "راشد يولِّد التقرير")}
            </span>
          </div>
          <ol style={{ margin: 0, paddingLeft: 22, fontSize: 12.5, color: "#323232", lineHeight: 1.7 }}>
            {(lang === "en" ? AGENT_STEPS_EN : AGENT_STEPS_AR).map((step, i) => (
              <li
                key={i}
                style={{
                  color: i < stepIndex ? "#26634B" : i === stepIndex ? "#160F3E" : "#9CA3AF",
                  fontWeight: i === stepIndex ? 700 : 500,
                  opacity: i <= stepIndex ? 1 : 0.5,
                }}
              >
                {step} {i < stepIndex && "✓"}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: isMobile ? 14 : 24, background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Spinner keyframes (inline so we don't need a CSS file) */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#160F3E", margin: "0 0 4px" }}>
          {t("Reporting", "التقارير")}
        </h1>
        <p style={{ fontSize: 13, color: "#595959", margin: 0 }}>
          {t(
            "Generate downloadable PDF reports from the live GIS knowledge base.",
            "أنشئ تقارير PDF قابلة للتنزيل من قاعدة المعرفة الجغرافية المباشرة.",
          )}
        </p>
      </div>

      {generationCard}

      {/* Report list */}
      <div style={{ fontSize: 11, fontWeight: 700, color: "#595959", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
        {t(`Generated reports (${reports.length})`, `التقارير المولَّدة (${reports.length})`)}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888" }}>{t("Loading…", "جارٍ التحميل…")}</div>
      ) : reports.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            background: "#fff",
            border: "1px dashed #C5DAD2",
            borderRadius: 10,
            color: "#595959",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#160F3E", marginBottom: 4 }}>
            {t("No reports yet", "لا توجد تقارير بعد")}
          </div>
          <div style={{ fontSize: 12, maxWidth: 420, margin: "0 auto" }}>
            {t(
              "Pick an area and a layer above and click Generate.",
              "اختر منطقة وطبقة من الأعلى ثم انقر على توليد.",
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 280 : 360}px, 1fr))`, gap: 14 }}>
          {reports.map((r) => {
            const style = KIND_STYLE[r.kind];
            return (
              <div
                key={r.id}
                style={{
                  background: "#fff",
                  border: "1px solid #EAEAEA",
                  borderRadius: 10,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  position: "relative",
                }}
              >
                {/* 3-dot menu */}
                <div style={{ position: "absolute", top: 10, right: 10 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpenFor(menuOpenFor === r.id ? null : r.id); }}
                    aria-label={t("More options", "خيارات إضافية")}
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: "none", background: menuOpenFor === r.id ? "#F1F5F4" : "transparent",
                      color: "#595959", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0, fontWeight: 700,
                    }}
                  >
                    ⋯
                  </button>
                  {menuOpenFor === r.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute", top: 32, right: 0, background: "#fff", border: "1px solid #EAEAEA",
                        borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: 140, zIndex: 5, padding: 4,
                      }}
                    >
                      <button
                        onClick={() => deleteReport(r.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px",
                          background: "transparent", border: "none", borderRadius: 4, cursor: "pointer",
                          color: "#DC2626", fontSize: 12, fontWeight: 600, textAlign: lang === "ar" ? "right" : "left",
                          fontFamily: "'Noto Naskh Arabic', sans-serif",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FEE2E2")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        🗑️ {t("Delete report", "حذف التقرير")}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, paddingRight: 32 }}>
                  <span
                    style={{
                      background: style.bg,
                      color: style.text,
                      fontSize: 9,
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 4,
                      letterSpacing: 0.4,
                    }}
                  >
                    {style.label}
                  </span>
                  <span style={{ fontSize: 11, color: "#595959" }}>
                    {new Date(r.generated_at).toLocaleString()}
                  </span>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#160F3E", margin: 0, lineHeight: 1.3 }}>
                  {lang === "en" ? r.title_en : r.title_ar}
                </h3>
                {r.description_en && (
                  <p style={{ fontSize: 12, color: "#323232", margin: 0, lineHeight: 1.5 }}>
                    {lang === "en" ? r.description_en : r.description_ar}
                  </p>
                )}
                <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #F1F1F1" }}>
                  <span style={{ fontSize: 11, color: "#888" }}>{r.author}</span>
                  {r.file_path ? (
                    <a
                      href={r.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      style={{
                        padding: "6px 16px",
                        background: "#26634B",
                        color: "#fff",
                        borderRadius: 14,
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: "none",
                        fontFamily: "'Noto Naskh Arabic', sans-serif",
                      }}
                    >
                      {t("⬇ Download PDF", "⬇ تنزيل PDF")}
                    </a>
                  ) : (
                    <span style={{ fontSize: 11, color: "#888" }}>{t("No PDF attached", "لا يوجد PDF مرفق")}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
