import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polygon, CircleMarker, Polyline, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api, type District, type Layer } from "../../api/client";
import { buildLayersFor, generateBoundary, type DistrictSpec } from "../../data/districtsGeo";
import { useMediaQuery, MOBILE } from "../../hooks/useMediaQuery";

interface Props {
  lang: "en" | "ar";
}

// Ash Shati gets the elongated coastal strip from the Pix PDF; everyone else
// gets the auto-generated circular boundary from districtsGeo.
const ASH_SHATI_BOUNDARY: [number, number][] = [
  [26.4990, 50.1275], [26.4970, 50.1320], [26.4920, 50.1335], [26.4870, 50.1340],
  [26.4810, 50.1340], [26.4750, 50.1335], [26.4690, 50.1330], [26.4630, 50.1320],
  [26.4575, 50.1305], [26.4530, 50.1290], [26.4525, 50.1255], [26.4555, 50.1240],
  [26.4615, 50.1235], [26.4685, 50.1235], [26.4755, 50.1240], [26.4825, 50.1245],
  [26.4890, 50.1250], [26.4940, 50.1255], [26.4990, 50.1275],
];

const SAUDI_BOUNDS: [[number, number], [number, number]] = [[16.5, 34.5], [32.5, 55.7]];
const KSA_CENTER: [number, number] = [24.5, 45.0];

// Default-on layer keys for the per-district detail view.
const DEFAULT_ON = new Set([
  "district_boundary", "subdivision_plans", "buildings", "roads",
  "schools", "mosques", "fire_hydrants", "commercial",
]);

// Districts we want in the dropdown — ordered for the demo.
const DISTRICT_ORDER = [
  "ash-shati-ash-sharqi",
  "riyadh", "jeddah", "dammam", "makkah", "madinah", "al-ahsa",
  "al-seh",
];

function FlyTo({ target, allBounds }: { target: District | null; allBounds: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (allBounds) {
      map.flyToBounds(SAUDI_BOUNDS, { duration: 1.2, padding: [40, 40] });
    } else if (target?.center_lat && target?.center_lng) {
      // Pick zoom based on district size — sub-area zooms tighter
      const zoom = (target.area_km2 ?? 100) < 10 ? 14 : (target.area_km2 ?? 100) < 200 ? 12 : 10;
      map.flyTo([target.center_lat, target.center_lng], zoom, { duration: 1.2 });
    }
  }, [target?.id, allBounds, map]);
  return null;
}

function specFor(d: District): DistrictSpec {
  return {
    id: d.id,
    name: d.name,
    center: [d.center_lat ?? 24.5, d.center_lng ?? 45.0],
    areaKm2: d.area_km2 ?? 50,
    population: d.population ?? 50000,
  };
}

function boundaryFor(d: District): [number, number][] {
  if (d.id === "ash-shati-ash-sharqi") return ASH_SHATI_BOUNDARY;
  return generateBoundary(specFor(d));
}

export default function GIS({ lang }: Props) {
  const t = (en: string, ar: string) => (lang === "en" ? en : ar);
  const [districts, setDistricts] = useState<District[]>([]);
  const [layersByDistrict, setLayersByDistrict] = useState<Record<string, Layer[]>>({});
  const [selectedId, setSelectedId] = useState<string>("__all__");
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries([...DEFAULT_ON].map((k) => [k, true])),
  );
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery(MOBILE);

  // Load districts and their layers in parallel
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.districts.list();
        const wanted = list.districts.filter((d) => DISTRICT_ORDER.includes(d.id));
        wanted.sort((a, b) => DISTRICT_ORDER.indexOf(a.id) - DISTRICT_ORDER.indexOf(b.id));
        if (cancelled) return;
        setDistricts(wanted);

        const layerData = await Promise.all(
          wanted.map((d) => api.districts.get(d.id).then((r) => [d.id, r.layers] as const)),
        );
        if (cancelled) return;
        setLayersByDistrict(Object.fromEntries(layerData));
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const selected = districts.find((d) => d.id === selectedId) ?? null;
  const showAll = selectedId === "__all__";

  // Layer toggles always reflect Ash Shati's full 19-layer set as the union
  // (every district has the same 19 layers since the seed runs the template
  // for all of them). Use Ash Shati's layer rows for the sidebar definitions.
  const layerDefs = layersByDistrict["ash-shati-ash-sharqi"] ?? [];

  // Counts to show in the sidebar — selected district's counts, or aggregate
  // sum across all districts when "All" is selected.
  const sidebarCounts = useMemo(() => {
    if (showAll) {
      const sums: Record<string, number> = {};
      for (const layers of Object.values(layersByDistrict)) {
        for (const l of layers) sums[l.layer_key] = (sums[l.layer_key] ?? 0) + l.feature_count;
      }
      return sums;
    }
    if (!selected) return {};
    const layers = layersByDistrict[selected.id] ?? [];
    return Object.fromEntries(layers.map((l) => [l.layer_key, l.feature_count]));
  }, [showAll, selected?.id, layersByDistrict]);

  // Synthetic geometry for the rendered features — only computed for the
  // currently-visible district (the all-districts view uses boundary-only).
  const synthetic = useMemo(() => {
    if (!selected) return {};
    return buildLayersFor(specFor(selected));
  }, [selected?.id]);

  const toggle = (key: string) => setEnabled((p) => ({ ...p, [key]: !p[key] }));
  const allOn = () => setEnabled(Object.fromEntries(layerDefs.map((l) => [l.layer_key, true])));
  const allOff = () => setEnabled(Object.fromEntries(layerDefs.map((l) => [l.layer_key, false])));

  // Defensive: ensure boundary defaults to ON whenever a new district is selected
  useEffect(() => {
    setEnabled((p) => ({ ...p, district_boundary: true }));
  }, [selectedId]);

  return (
    <div style={{ padding: isMobile ? 14 : 24, background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#160F3E", margin: "0 0 4px" }}>
            {t("GIS Map View", "عرض النظم الجغرافية")}
          </h1>
          <p style={{ fontSize: 13, color: "#595959", margin: 0 }}>
            {t(
              "All districts on one map. Filter by zone to drill into a specific district's 19 GIS layers.",
              "كل الأحياء على خريطة واحدة. صفِّ حسب المنطقة للتعمق في الطبقات الجغرافية الـ19 لحي محدد.",
            )}
          </p>
        </div>

        {/* District dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#595959", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {t("Filter by district", "تصفية حسب الحي")}
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
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
              cursor: "pointer",
            }}
          >
            <option value="__all__">{t("🌍 All districts (Saudi-wide)", "🌍 جميع الأحياء (على مستوى المملكة)")}</option>
            <optgroup label={t("Districts & sub-areas", "الأحياء والمناطق الفرعية")}>
              {districts
                .filter((d) => d.kind === "district" || d.kind === "sub-area")
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {lang === "en" ? d.name : d.name_ar} · {d.area_km2} km²
                  </option>
                ))}
            </optgroup>
            <optgroup label={t("Major cities", "المدن الرئيسية")}>
              {districts
                .filter((d) => d.kind === "city")
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {lang === "en" ? d.name : d.name_ar} · {d.area_km2?.toLocaleString()} km²
                  </option>
                ))}
            </optgroup>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "#888" }}>
          {t("Loading districts and layers…", "جارٍ تحميل الأحياء والطبقات…")}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) 320px",
            gap: 12,
            height: isMobile ? "auto" : "calc(100vh - 220px)",
            minHeight: isMobile ? undefined : 600,
          }}
        >
          {/* Map */}
          <div
            style={{
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid #EAEAEA",
              position: "relative",
              height: isMobile ? 380 : "100%",
            }}
          >
            <MapContainer center={KSA_CENTER} zoom={6} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              <FlyTo target={selected} allBounds={showAll} />

              {/* All-districts view: render every district's boundary as a chip */}
              {showAll && districts.map((d) => {
                const ring = boundaryFor(d);
                return (
                  <Polygon
                    key={d.id}
                    positions={ring}
                    pathOptions={{
                      color: "#26634B",
                      weight: 2,
                      fillColor: "#26634B",
                      fillOpacity: 0.18,
                    }}
                    eventHandlers={{ click: () => setSelectedId(d.id) }}
                  >
                    <Tooltip permanent direction="center" opacity={0.9}>
                      {lang === "en" ? d.name : d.name_ar}
                    </Tooltip>
                  </Polygon>
                );
              })}

              {/* Single-district view: render boundary + each enabled layer's features */}
              {!showAll && selected && (
                <>
                  {enabled.district_boundary !== false && (
                    <Polygon
                      positions={boundaryFor(selected)}
                      pathOptions={{ color: "#26634B", weight: 3, fillColor: "#26634B", fillOpacity: 0.05 }}
                    />
                  )}
                  {layerDefs.map((l) => {
                    if (l.layer_key === "district_boundary") return null;
                    if (!enabled[l.layer_key]) return null;
                    const data = synthetic[l.layer_key];
                    if (!data) return null;
                    const isHovered = hoveredKey === l.layer_key;
                    const real = sidebarCounts[l.layer_key] ?? 0;
                    const tooltipText = `${lang === "en" ? l.name_en : l.name_ar} (${real.toLocaleString()})`;

                    if (data.type === "polygon") {
                      return (data.features as Array<[number, number][]>).map((poly, i) => (
                        <Polygon
                          key={`${l.layer_key}-${i}`}
                          positions={poly}
                          pathOptions={{
                            color: l.color,
                            weight: isHovered ? 2 : 1,
                            fillColor: l.color,
                            fillOpacity: isHovered ? 0.45 : 0.25,
                          }}
                        >
                          <Tooltip>{tooltipText}</Tooltip>
                        </Polygon>
                      ));
                    }
                    if (data.type === "line") {
                      return (data.features as Array<[number, number][]>).map((line, i) => (
                        <Polyline
                          key={`${l.layer_key}-${i}`}
                          positions={line}
                          pathOptions={{ color: l.color, weight: isHovered ? 4 : 2.5, opacity: 0.8 }}
                        >
                          <Tooltip>{tooltipText}</Tooltip>
                        </Polyline>
                      ));
                    }
                    return (data.features as Array<[number, number]>).map((pt, i) => (
                      <CircleMarker
                        key={`${l.layer_key}-${i}`}
                        center={pt}
                        radius={isHovered ? 6 : 4}
                        pathOptions={{ color: l.color, fillColor: l.color, fillOpacity: 0.85, weight: 1 }}
                      >
                        <Tooltip>{tooltipText}</Tooltip>
                      </CircleMarker>
                    ));
                  })}
                </>
              )}
            </MapContainer>

            {/* Top-left overlay */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 1000,
                background: "rgba(255,255,255,0.96)",
                border: "1px solid #EAEAEA",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                maxWidth: 320,
              }}
            >
              {showAll ? (
                <>
                  <div style={{ fontWeight: 700, color: "#160F3E", fontSize: 13 }}>
                    {t(`Saudi-wide overview · ${districts.length} districts`, `نظرة عامة على المملكة · ${districts.length} حي`)}
                  </div>
                  <div style={{ color: "#595959", marginTop: 2 }}>
                    {t("Click any boundary to drill in.", "انقر على أي حد للتعمق فيه.")}
                  </div>
                </>
              ) : selected ? (
                <>
                  <div style={{ fontWeight: 700, color: "#160F3E", fontSize: 13 }}>
                    {lang === "en" ? selected.name : selected.name_ar}
                  </div>
                  <div style={{ color: "#595959", marginTop: 2 }}>
                    {selected.area_km2?.toLocaleString()} km² · {selected.population?.toLocaleString()} {t("residents", "نسمة")}
                  </div>
                  {selected.id !== "ash-shati-ash-sharqi" && (
                    <div style={{ color: "#888", marginTop: 4, fontSize: 11, fontStyle: "italic" }}>
                      {t(
                        "Synthetic features (real Ash Shati ratios applied to local size).",
                        "معالم اصطناعية (نسب الشاطئ الشرقي الحقيقية مطبقة على الحجم المحلي).",
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Right: 19-layer panel (kept as-is per spec) */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #EAEAEA",
              borderRadius: 10,
              padding: 12,
              overflow: "auto",
              maxHeight: isMobile ? 500 : "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#160F3E", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {t(`19 GIS Layers`, `19 طبقة جغرافية`)}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={allOn} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: "1px solid #EAEAEA", background: "#fff", cursor: "pointer", color: "#26634B", fontWeight: 600 }}>
                  {t("All", "الكل")}
                </button>
                <button onClick={allOff} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: "1px solid #EAEAEA", background: "#fff", cursor: "pointer", color: "#595959", fontWeight: 600 }}>
                  {t("None", "لا شيء")}
                </button>
              </div>
            </div>

            {/* Scope indicator */}
            <div
              style={{
                fontSize: 11,
                color: "#595959",
                background: "#F1F5F4",
                border: "1px solid #C5DAD2",
                borderRadius: 6,
                padding: "6px 10px",
                marginBottom: 10,
              }}
            >
              {showAll
                ? t("Counts shown: aggregate sum across all 8 districts.", "الأعداد المعروضة: المجموع التراكمي عبر جميع الأحياء الثمانية.")
                : selected
                  ? t(
                      `Counts shown: ${selected.name} (${selected.area_km2?.toLocaleString()} km²)`,
                      `الأعداد المعروضة: ${selected.name_ar} (${selected.area_km2?.toLocaleString()} كم²)`,
                    )
                  : null}
            </div>

            {layerDefs.map((l) => {
              const isOn = !!enabled[l.layer_key];
              const count = sidebarCounts[l.layer_key] ?? 0;
              return (
                <label
                  key={l.layer_key}
                  onMouseEnter={() => setHoveredKey(l.layer_key)}
                  onMouseLeave={() => setHoveredKey((k) => (k === l.layer_key ? null : k))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 4px",
                    cursor: showAll ? "default" : "pointer",
                    borderRadius: 4,
                    background: hoveredKey === l.layer_key ? "#F1F5F4" : "transparent",
                    fontSize: 12,
                    opacity: showAll ? 0.65 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isOn}
                    disabled={showAll}
                    onChange={() => !showAll && toggle(l.layer_key)}
                    style={{ accentColor: l.color, width: 14, height: 14 }}
                  />
                  <span style={{ width: 12, height: 12, background: l.color, borderRadius: 3, flexShrink: 0 }} />
                  <span style={{ flex: 1, color: "#160F3E", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {lang === "en" ? l.name_en : l.name_ar}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#26634B",
                      background: "#E8F4F0",
                      padding: "2px 6px",
                      borderRadius: 10,
                      flexShrink: 0,
                    }}
                  >
                    {count.toLocaleString()}
                  </span>
                </label>
              );
            })}

            <div style={{ marginTop: 12, padding: 8, background: "#FAFBFB", borderRadius: 6, fontSize: 11, color: "#595959", lineHeight: 1.5 }}>
              {showAll
                ? t(
                    "Switch to a single district to enable layer toggles and see features rendered on the map.",
                    "اختر حياً واحداً لتفعيل مفاتيح الطبقات ورؤية المعالم على الخريطة.",
                  )
                : t(
                    "Geometry is synthetic per-district (deterministic PRNG); counts come from realistic ratios derived from the real Ash Shati layers.",
                    "الأشكال الهندسية اصطناعية لكل حي (PRNG حتمي)؛ الأعداد مستمدة من نسب واقعية مأخوذة من طبقات الشاطئ الشرقي الحقيقية.",
                  )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
