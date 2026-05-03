import { useEffect, useMemo, useState } from "react";
import { api, type District, type Insight, type Layer } from "../../api/client";
import { useMediaQuery, MOBILE } from "../../hooks/useMediaQuery";

interface DashboardProps {
  lang: "en" | "ar";
  onAskRashid: (prefill?: string) => void;
}

const SEVERITY_STYLE: Record<Insight["severity"], { bg: string; border: string; text: string; label: string }> = {
  CRITICAL:    { bg: "#FEE2E2", border: "#DC2626", text: "#991B1B", label: "CRITICAL" },
  HIGH:        { bg: "#FEF3C7", border: "#D97706", text: "#92400E", label: "HIGH" },
  MEDIUM:      { bg: "#FEF9C3", border: "#CA8A04", text: "#854D0E", label: "MEDIUM" },
  POSITIVE:    { bg: "#DCFCE7", border: "#16A34A", text: "#166534", label: "POSITIVE" },
  OPPORTUNITY: { bg: "#DBEAFE", border: "#2563EB", text: "#1E40AF", label: "OPPORTUNITY" },
};

// Districts surfaced in the dropdown (mirrors the GIS page).
const DISTRICT_ORDER = [
  "ash-shati-ash-sharqi",
  "riyadh", "jeddah", "dammam", "makkah", "madinah", "al-ahsa",
  "al-seh",
];

// ---------- Trend metadata per KPI ----------
// Each KPI gets a synthetic quarter-over-quarter delta and a "is up = good?"
// flag. The arrow color reflects whether the change is in the right direction.
interface TrendDef { delta: number; goodIfUp: boolean; }
const TREND: Record<string, TrendDef> = {
  population:            { delta:  1.8, goodIfUp: false }, // growth strains services
  area_km2:              { delta:  0.0, goodIfUp: true },
  buildings:             { delta:  2.1, goodIfUp: true },
  parcels:               { delta:  0.4, goodIfUp: true },
  schools:               { delta:  0.0, goodIfUp: true }, // flat = bad
  mosques:               { delta:  0.7, goodIfUp: true },
  fire_hydrants:         { delta:  1.2, goodIfUp: true },
  commercial:            { delta:  3.2, goodIfUp: true },
  street_lights:         { delta:  0.8, goodIfUp: true },
  government_facilities: { delta:  0.0, goodIfUp: true },
  pump_stations:         { delta:  0.0, goodIfUp: true },
  building_permits:      { delta:  5.4, goodIfUp: true },
  digging_permits_point: { delta: -3.6, goodIfUp: true }, // fewer disruptions
  digging_permits_linear:{ delta: -2.1, goodIfUp: true },
  ad_signs:              { delta:  4.1, goodIfUp: true },
  pavements:             { delta:  1.5, goodIfUp: true },
  roads:                 { delta:  0.3, goodIfUp: true },
  land_use:              { delta:  0.0, goodIfUp: true },
  subdivision_plans:     { delta:  0.0, goodIfUp: true },
  district_boundary:     { delta:  0.0, goodIfUp: true },
  // For the unlicensed-parcels Ash-Shati-only KPI
  undeveloped_parcels:   { delta: -2.1, goodIfUp: false }, // fewer = good
};

interface KpiTile {
  key: string;
  labelEn: string;
  labelAr: string;
  value: number;
  unit?: string;
  severity?: string;
}

// Build the standardized KPI set for any district from district + layers.
function buildKpis(d: District, layers: Layer[]): KpiTile[] {
  const get = (k: string) => layers.find((l) => l.layer_key === k)?.feature_count ?? 0;
  return [
    { key: "population",     labelEn: "Population",       labelAr: "السكان",          value: d.population ?? 0 },
    { key: "area_km2",       labelEn: "Area",             labelAr: "المساحة",         value: d.area_km2 ?? 0, unit: "km²" },
    { key: "parcels",        labelEn: "Land Parcels",     labelAr: "قطع الأراضي",     value: get("parcels") },
    { key: "buildings",      labelEn: "Buildings",        labelAr: "المباني",         value: get("buildings") },
    { key: "schools",        labelEn: "Schools",          labelAr: "المدارس",         value: get("schools") },
    { key: "mosques",        labelEn: "Mosques",          labelAr: "المساجد",         value: get("mosques") },
    { key: "fire_hydrants",  labelEn: "Fire Hydrants",    labelAr: "صنابير الإطفاء",  value: get("fire_hydrants") },
    { key: "commercial",     labelEn: "Commercial",       labelAr: "المنشآت التجارية", value: get("commercial") },
    { key: "street_lights",  labelEn: "Street Lights",    labelAr: "أعمدة الإنارة",   value: get("street_lights") },
    { key: "government_facilities", labelEn: "Government", labelAr: "المرافق الحكومية", value: get("government_facilities") },
    { key: "building_permits", labelEn: "Active Permits", labelAr: "تراخيص نشطة",     value: get("building_permits") },
    { key: "pump_stations",  labelEn: "Pump Stations",    labelAr: "محطات الضخ",      value: get("pump_stations") },
  ];
}

// Derive 5 insights for any district from its layer data using the same
// benchmark logic as the original Ash Shati 10-insight set.
function deriveInsights(d: District, layers: Layer[]): Insight[] {
  const get = (k: string) => layers.find((l) => l.layer_key === k)?.feature_count ?? 0;
  const pop = d.population ?? 0;
  const area = d.area_km2 ?? 0;
  const buildings = get("buildings");
  const lights = get("street_lights");
  const hydrants = get("fire_hydrants");
  const mosques = get("mosques");
  const schools = get("schools");
  const roadKm = area * 28.8; // derived ratio

  const lightsPerKm = roadKm > 0 ? lights / roadKm : 0;
  const buildingsPerHydrant = hydrants > 0 ? buildings / hydrants : 0;
  const popPerMosque = mosques > 0 ? pop / mosques : 0;
  const popPerSchool = schools > 0 ? pop / schools : 0;
  // WHO requires 1 per 10,000 → required = pop/10000
  const healthCentersNeeded = pop / 10000;

  return [
    {
      id: 1, district_id: d.id, position: 1,
      title_en: "Street Lighting Coverage",
      title_ar: "تغطية إنارة الشوارع",
      severity: lightsPerKm < 30 ? "HIGH" : "POSITIVE",
      metric: `${lightsPerKm.toFixed(1)} lights/km`,
      benchmark: "Urban benchmark: 30–40 lights/km",
      body_en: lightsPerKm < 30
        ? `${lights.toLocaleString()} street lights across approximately ${Math.round(roadKm).toLocaleString()} km of roads — ${lightsPerKm.toFixed(1)} per km, ${(((30 - lightsPerKm) / 30) * 100).toFixed(0)}% below the urban minimum of 30/km. Average spacing is ${(1000 / lightsPerKm).toFixed(0)} m vs the recommended 25–30 m.`
        : `${lights.toLocaleString()} street lights across ~${Math.round(roadKm).toLocaleString()} km — ${lightsPerKm.toFixed(1)} per km, within the urban 30–40/km benchmark.`,
      body_ar: lightsPerKm < 30
        ? `${lights.toLocaleString()} عمود إنارة على شبكة طرق بطول ${Math.round(roadKm).toLocaleString()} كم — ${lightsPerKm.toFixed(1)} لكل كم، ${(((30 - lightsPerKm) / 30) * 100).toFixed(0)}% أقل من الحد الأدنى الحضري.`
        : `${lights.toLocaleString()} عمود إنارة على ${Math.round(roadKm).toLocaleString()} كم — ${lightsPerKm.toFixed(1)} لكل كم، ضمن المعيار الحضري.`,
    },
    {
      id: 2, district_id: d.id, position: 2,
      title_en: "Fire Safety Coverage",
      title_ar: "تغطية السلامة من الحرائق",
      severity: buildingsPerHydrant <= 8 && buildingsPerHydrant >= 5 ? "POSITIVE" : buildingsPerHydrant > 8 ? "HIGH" : "MEDIUM",
      metric: `1 hydrant per ${buildingsPerHydrant.toFixed(1)} buildings`,
      benchmark: "NFPA standard: 1 per 5–8 buildings",
      body_en: `${hydrants.toLocaleString()} fire hydrants serve ${buildings.toLocaleString()} buildings — 1 per ${buildingsPerHydrant.toFixed(1)} ${buildingsPerHydrant <= 8 ? "(within NFPA standard)" : "(above NFPA limit)"}. Density: ${(hydrants / area).toFixed(1)} hydrants per km².`,
      body_ar: `${hydrants.toLocaleString()} صنبور إطفاء يخدم ${buildings.toLocaleString()} مبنى — 1 لكل ${buildingsPerHydrant.toFixed(1)}. الكثافة: ${(hydrants / area).toFixed(1)} صنبور لكل كم².`,
    },
    {
      id: 3, district_id: d.id, position: 3,
      title_en: "Mosque Coverage",
      title_ar: "تغطية المساجد",
      severity: popPerMosque >= 500 && popPerMosque <= 800 ? "POSITIVE" : popPerMosque > 800 ? "MEDIUM" : "POSITIVE",
      metric: `1 mosque per ${popPerMosque.toFixed(0)} residents`,
      benchmark: "Saudi standard: 1 per 500–800 residents",
      body_en: `${mosques.toLocaleString()} mosques serve a population of ${pop.toLocaleString()} — 1 per ${popPerMosque.toFixed(0)} residents ${popPerMosque <= 800 ? "(within Saudi benchmark)" : "(below benchmark — coverage gap)"}.`,
      body_ar: `${mosques.toLocaleString()} مسجد يخدم ${pop.toLocaleString()} نسمة — 1 لكل ${popPerMosque.toFixed(0)}.`,
    },
    {
      id: 4, district_id: d.id, position: 4,
      title_en: "School Coverage",
      title_ar: "تغطية المدارس",
      severity: popPerSchool >= 1000 && popPerSchool <= 1500 ? "POSITIVE" : popPerSchool > 1500 ? "HIGH" : "POSITIVE",
      metric: `1 school per ${popPerSchool.toFixed(0)} residents`,
      benchmark: "International benchmark: 1 per 1,000–1,500",
      body_en: `${schools.toLocaleString()} schools serve a population of ${pop.toLocaleString()} — 1 per ${popPerSchool.toFixed(0)} residents ${popPerSchool <= 1500 ? "(numerically adequate)" : "(under-provided)"}.`,
      body_ar: `${schools.toLocaleString()} مدرسة تخدم ${pop.toLocaleString()} نسمة — 1 لكل ${popPerSchool.toFixed(0)}.`,
    },
    {
      id: 5, district_id: d.id, position: 5,
      title_en: "Primary Healthcare Capacity",
      title_ar: "قدرة الرعاية الصحية الأولية",
      severity: "MEDIUM",
      metric: `${healthCentersNeeded.toFixed(1)} centers needed`,
      benchmark: "WHO: 1 primary center per 10,000 residents",
      body_en: `For ${pop.toLocaleString()} residents, the WHO benchmark requires at least ${healthCentersNeeded.toFixed(1)} primary health centers. The GIS layer for healthcare is not yet ingested for this district — flag for next data refresh.`,
      body_ar: `لـ${pop.toLocaleString()} نسمة، يتطلب معيار منظمة الصحة العالمية ما لا يقل عن ${healthCentersNeeded.toFixed(1)} مركز رعاية صحية أولية.`,
    },
  ];
}

// ---------- Visual building blocks ----------

function TrendArrow({ kpiKey }: { kpiKey: string }) {
  const trend = TREND[kpiKey];
  if (!trend) return null;
  const { delta, goodIfUp } = trend;
  const isUp = delta > 0;
  const isFlat = delta === 0;
  const isGood = isFlat ? null : (isUp === goodIfUp);
  const arrow = isFlat ? "→" : isUp ? "↑" : "↓";
  const color = isGood === null ? "#9CA3AF" : isGood ? "#16A34A" : "#DC2626";
  const bg = isGood === null ? "#F3F4F6" : isGood ? "#DCFCE7" : "#FEE2E2";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 7px",
        borderRadius: 10,
        background: bg,
        color,
        fontSize: 10,
        fontWeight: 700,
        marginLeft: 6,
      }}
    >
      {arrow} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

function KpiTileBox({ tile, lang }: { tile: KpiTile; lang: "en" | "ar" }) {
  const sev = tile.severity ? SEVERITY_STYLE[tile.severity as Insight["severity"]] : null;
  const display = tile.value % 1 === 0 ? tile.value.toLocaleString() : tile.value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${sev ? sev.border : "#EAEAEA"}`,
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: sev ? sev.text : "#160F3E", lineHeight: 1.1 }}>
          {display}
          {tile.unit && <span style={{ fontSize: 12, fontWeight: 500, color: "#595959", marginLeft: 4 }}>{tile.unit}</span>}
        </div>
        <TrendArrow kpiKey={tile.key} />
      </div>
      <div style={{ fontSize: 12, color: "#595959", marginTop: 6 }}>
        {lang === "en" ? tile.labelEn : tile.labelAr}
      </div>
    </div>
  );
}

function InsightCard({ insight, lang, onAsk }: { insight: Insight; lang: "en" | "ar"; onAsk: (q: string) => void }) {
  const sev = SEVERITY_STYLE[insight.severity];
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${sev.border}`,
        borderLeft: `4px solid ${sev.border}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span
          style={{
            background: sev.text,
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: 4,
            letterSpacing: 0.5,
          }}
        >
          {sev.label}
        </span>
        <span style={{ fontSize: 11, color: "#595959", fontWeight: 600 }}>#{insight.position}</span>
      </div>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: "#160F3E", margin: "0 0 4px" }}>
        {lang === "en" ? insight.title_en : insight.title_ar}
      </h4>
      <div style={{ fontSize: 13, fontWeight: 700, color: sev.text, marginBottom: 6 }}>{insight.metric}</div>
      {insight.benchmark && (
        <div style={{ fontSize: 11, color: "#595959", fontStyle: "italic", marginBottom: 8 }}>
          {lang === "en" ? "Benchmark: " : "المعيار: "}
          {insight.benchmark}
        </div>
      )}
      <p style={{ fontSize: 12, color: "#323232", lineHeight: 1.5, margin: 0 }}>
        {lang === "en" ? insight.body_en : insight.body_ar}
      </p>
      <button
        onClick={() => onAsk(lang === "en" ? insight.title_en : insight.title_ar)}
        style={{
          marginTop: 10,
          padding: "5px 12px",
          background: "transparent",
          border: `1px solid ${sev.border}`,
          color: sev.text,
          borderRadius: 16,
          fontSize: 11,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'Noto Naskh Arabic', sans-serif",
        }}
      >
        {lang === "en" ? "Ask Rashid →" : "اسأل راشد ←"}
      </button>
    </div>
  );
}

// ---------- Main page ----------

export default function Dashboard({ lang, onAskRashid }: DashboardProps) {
  const t = (en: string, ar: string) => (lang === "en" ? en : ar);
  const [districts, setDistricts] = useState<District[]>([]);
  const [layersByDistrict, setLayersByDistrict] = useState<Record<string, Layer[]>>({});
  const [insightsByDistrict, setInsightsByDistrict] = useState<Record<string, Insight[]>>({});
  const [selectedId, setSelectedId] = useState<string>("__all__");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const isMobile = useMediaQuery(MOBILE);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);

    (async () => {
      try {
        const list = await api.districts.list();
        const wanted = list.districts.filter((d) => DISTRICT_ORDER.includes(d.id));
        wanted.sort((a, b) => DISTRICT_ORDER.indexOf(a.id) - DISTRICT_ORDER.indexOf(b.id));
        if (cancelled) return;
        setDistricts(wanted);

        const detail = await Promise.all(
          wanted.map((d) => api.districts.get(d.id).then((r) => [d.id, r] as const)),
        );
        if (cancelled) return;
        const layers: Record<string, Layer[]> = {};
        const insights: Record<string, Insight[]> = {};
        for (const [id, r] of detail) {
          layers[id] = r.layers;
          insights[id] = r.insights;
        }
        setLayersByDistrict(layers);
        setInsightsByDistrict(insights);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const selected = districts.find((d) => d.id === selectedId) ?? null;
  const showAll = selectedId === "__all__";

  // Build KPIs and insights for the active scope
  const { kpis, insights, scopeLabel } = useMemo(() => {
    if (showAll) {
      // Aggregate KPIs: sum across every district
      const sum = (k: string) => districts.reduce((s, d) => s + (layersByDistrict[d.id]?.find((l) => l.layer_key === k)?.feature_count ?? 0), 0);
      const totalPop = districts.reduce((s, d) => s + (d.population ?? 0), 0);
      const totalArea = districts.reduce((s, d) => s + (d.area_km2 ?? 0), 0);
      const aggregated: KpiTile[] = [
        { key: "population",            labelEn: "Total Population", labelAr: "إجمالي السكان",     value: totalPop },
        { key: "area_km2",              labelEn: "Total Area",       labelAr: "إجمالي المساحة",    value: totalArea, unit: "km²" },
        { key: "parcels",               labelEn: "Land Parcels",     labelAr: "قطع الأراضي",       value: sum("parcels") },
        { key: "buildings",             labelEn: "Buildings",        labelAr: "المباني",           value: sum("buildings") },
        { key: "schools",               labelEn: "Schools",          labelAr: "المدارس",           value: sum("schools") },
        { key: "mosques",               labelEn: "Mosques",          labelAr: "المساجد",           value: sum("mosques") },
        { key: "fire_hydrants",         labelEn: "Fire Hydrants",    labelAr: "صنابير الإطفاء",    value: sum("fire_hydrants") },
        { key: "commercial",            labelEn: "Commercial",       labelAr: "المنشآت التجارية",  value: sum("commercial") },
        { key: "street_lights",         labelEn: "Street Lights",    labelAr: "أعمدة الإنارة",     value: sum("street_lights") },
        { key: "government_facilities", labelEn: "Government",       labelAr: "المرافق الحكومية",  value: sum("government_facilities") },
        { key: "building_permits",      labelEn: "Active Permits",   labelAr: "تراخيص نشطة",       value: sum("building_permits") },
        { key: "pump_stations",         labelEn: "Pump Stations",    labelAr: "محطات الضخ",        value: sum("pump_stations") },
      ];
      // Aggregate insights: take Ash Shati's real ones (canonical) — they reflect the deepest data we have
      const ashInsights = insightsByDistrict["ash-shati-ash-sharqi"] ?? [];
      return {
        kpis: aggregated,
        insights: ashInsights,
        scopeLabel: t("All Saudi districts (aggregate)", "جميع الأحياء السعودية (تجميعي)"),
      };
    }
    if (!selected) return { kpis: [], insights: [], scopeLabel: "" };
    const districtLayers = layersByDistrict[selected.id] ?? [];
    const districtInsights = insightsByDistrict[selected.id] ?? [];
    const useReal = districtInsights.length > 0;
    return {
      kpis: buildKpis(selected, districtLayers),
      insights: useReal ? districtInsights : deriveInsights(selected, districtLayers),
      scopeLabel: lang === "en" ? selected.name : selected.name_ar,
    };
  }, [showAll, selected?.id, districts, layersByDistrict, insightsByDistrict, lang]);

  const sevCounts = {
    CRITICAL: insights.filter((i) => i.severity === "CRITICAL").length,
    HIGH: insights.filter((i) => i.severity === "HIGH").length,
    MEDIUM: insights.filter((i) => i.severity === "MEDIUM").length,
    POSITIVE: insights.filter((i) => i.severity === "POSITIVE").length,
    OPPORTUNITY: insights.filter((i) => i.severity === "OPPORTUNITY").length,
  };

  return (
    <div style={{ padding: isMobile ? 14 : 24, background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Page header + dropdown */}
      <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#160F3E", margin: "0 0 4px" }}>
            {t("Insights Dashboard", "لوحة الرؤى")}
          </h1>
          <p style={{ fontSize: 13, color: "#595959", margin: 0 }}>
            {t(
              "Pick an area to surface its key statistics and severity-coded insights.",
              "اختر منطقة لعرض إحصائياتها الرئيسية ورؤاها المصنفة بالأولوية.",
            )}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#595959", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {t("Filter by district", "تصفية حسب الحي")}
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={loading}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #C5DAD2",
              background: "#fff",
              color: "#160F3E",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Noto Naskh Arabic', sans-serif",
              minWidth: isMobile ? 0 : 240,
              width: isMobile ? "100%" : "auto",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <option value="__all__">{t("🌍 All districts (Saudi-wide)", "🌍 جميع الأحياء (على مستوى المملكة)")}</option>
            <optgroup label={t("Districts & sub-areas", "الأحياء والمناطق الفرعية")}>
              {districts.filter((d) => d.kind === "district" || d.kind === "sub-area").map((d) => (
                <option key={d.id} value={d.id}>
                  {lang === "en" ? d.name : d.name_ar} · {d.area_km2} km²
                </option>
              ))}
            </optgroup>
            <optgroup label={t("Major cities", "المدن الرئيسية")}>
              {districts.filter((d) => d.kind === "city").map((d) => (
                <option key={d.id} value={d.id}>
                  {lang === "en" ? d.name : d.name_ar} · {d.area_km2?.toLocaleString()} km²
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {loading && <div style={{ padding: 60, textAlign: "center", color: "#888" }}>{t("Loading…", "جارٍ التحميل…")}</div>}
      {error && (
        <div style={{ padding: 16, background: "#FEE", border: "1px solid #FCC", borderRadius: 8, color: "#A00" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary banner */}
          <div
            style={{
              background: "linear-gradient(to right, #066058, #26634B)",
              color: "#fff",
              padding: "16px 20px",
              borderRadius: 10,
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {t("Active scope", "النطاق الحالي")}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{scopeLabel}</div>
              {!showAll && selected && (
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                  {selected.population?.toLocaleString()} {t("residents", "نسمة")} · {selected.area_km2} km² ·{" "}
                  {t(`Validated ${selected.data_validated_at ?? "—"}`, `آخر تحقق ${selected.data_validated_at ?? "—"}`)}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 13 }}>
              {(["CRITICAL", "HIGH", "MEDIUM", "OPPORTUNITY", "POSITIVE"] as const).map((sev) => {
                const sty = SEVERITY_STYLE[sev];
                return (
                  <div key={sev} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: sty.bg }}>{sevCounts[sev]}</div>
                    <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700, letterSpacing: 0.4 }}>{sty.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ marginBottom: 12, display: "flex", alignItems: "baseline", gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#160F3E", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {t("Key Statistics", "الإحصائيات الرئيسية")}
            </h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#26634B", background: "#E8F4F0", padding: "3px 8px", borderRadius: 10 }}>
              {kpis.length}
            </span>
            <span style={{ fontSize: 12, color: "#595959" }}>
              {t("Quarter-over-quarter trend in green/red.", "الاتجاه ربع سنوي بالأخضر/الأحمر.")}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {kpis.map((k) => <KpiTileBox key={k.key} tile={k} lang={lang} />)}
          </div>

          {/* Insights — entire section collapsible (cards themselves stay full) */}
          <button
            onClick={() => setInsightsOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "10px 0",
              marginBottom: 12,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: lang === "ar" ? "right" : "left",
              fontFamily: "'Noto Naskh Arabic', sans-serif",
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: "#26634B",
                fontWeight: 700,
                width: 18,
                display: "inline-block",
                transition: "transform 0.15s",
                transform: insightsOpen ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              ▶
            </span>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#160F3E", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {t("Insights", "الرؤى")}
            </h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#26634B", background: "#E8F4F0", padding: "3px 8px", borderRadius: 10 }}>
              {insights.length}
            </span>
            <span style={{ fontSize: 12, color: "#595959" }}>
              {insightsOpen
                ? t("Click to collapse the section.", "انقر لطيّ القسم.")
                : t("Click to expand and see all insights.", "انقر لتوسيع القسم ورؤية جميع الرؤى.")}
            </span>
          </button>

          {insightsOpen && (insights.length === 0 ? (
            <div
              style={{
                padding: "32px 20px",
                textAlign: "center",
                background: "#fff",
                border: "1px dashed #C5DAD2",
                borderRadius: 10,
                color: "#595959",
                fontSize: 13,
              }}
            >
              {t("No insights for this scope yet.", "لا توجد رؤى لهذا النطاق بعد.")}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 12,
              }}
            >
              {insights.map((i) => (
                <InsightCard
                  key={`${i.district_id}-${i.position}`}
                  insight={i}
                  lang={lang}
                  onAsk={onAskRashid}
                />
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
