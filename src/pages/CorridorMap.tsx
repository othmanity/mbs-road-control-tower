import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Lang, PhaseId, SubStretchId, Zone } from "../types";
import {
  zones, subStretches, getCorridorPolyline, getZonePolyline, getZone, POC_ZONE_IDS,
} from "../data/corridor";
import { assets, findingsForZone } from "../data/findings";

interface CorridorMapProps {
  lang: Lang;
  onOpenZone: (zoneId: number) => void;
}

const densityFill = (d: string) =>
  d === "high" ? "#AF0818" : d === "medium" ? "#FD7E14" : "#27AA8C";

const ASSET_ICON: Record<string, { color: string; symbol: string; en: string; ar: string }> = {
  bridge:           { color: "#160F3E", symbol: "▤", en: "Bridge",           ar: "كبري" },
  fuel_station:     { color: "#FD7E14", symbol: "⛽", en: "Fuel station",     ar: "محطة وقود" },
  inspection_point: { color: "#005A96", symbol: "▥", en: "Inspection point", ar: "نقطة تفتيش" },
  service_center:   { color: "#27AA8C", symbol: "✚", en: "Service center",   ar: "مركز خدمات" },
  slum_area:        { color: "#AF0818", symbol: "△", en: "Slum area",        ar: "عشوائيات" },
  green_area:       { color: "#066058", symbol: "❀", en: "Greenery",         ar: "تشجير" },
};

function FlyToView({
  zoneId,
  visibleZones,
}: {
  zoneId: number | null;
  visibleZones: Zone[];
}) {
  const map = useMap();
  useEffect(() => {
    // A specific zone takes precedence over the filter
    if (zoneId != null) {
      const z = getZone(zoneId);
      if (z) map.flyTo([z.centerLat, z.centerLng], 15, { duration: 1.4 });
      return;
    }
    // No zone selected but the user has narrowed the view via filters → fit those
    if (visibleZones.length > 0 && visibleZones.length < zones.length) {
      const lats = visibleZones.map((z) => z.centerLat);
      const lngs = visibleZones.map((z) => z.centerLng);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ];
      map.flyToBounds(bounds, { duration: 1.2, padding: [60, 60], maxZoom: 13 });
      return;
    }
    // No filter, no selection → whole-corridor view
    map.flyToBounds([[21.42, 39.17], [21.50, 39.84]], { duration: 1.2, padding: [40, 40] });
  }, [zoneId, visibleZones, map]);
  return null;
}

export default function CorridorMap({ lang, onOpenZone }: CorridorMapProps) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseId | "all">("all");
  const [stretchFilter, setStretchFilter] = useState<SubStretchId | "all">("all");
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [layers, setLayers] = useState({
    density: true,
    assets: true,
    pocOnly: false,
  });

  const visibleZones = useMemo(() => zones.filter((z) => {
    if (phaseFilter !== "all" && z.phase !== phaseFilter) return false;
    if (stretchFilter !== "all" && z.subStretch !== stretchFilter) return false;
    if (layers.pocOnly && !(POC_ZONE_IDS as readonly number[]).includes(z.id)) return false;
    return true;
  }), [phaseFilter, stretchFilter, layers.pocOnly]);

  const corridor = useMemo(() => getCorridorPolyline(), []);
  const selectedPolyline = useMemo(
    () => (selectedZone ? getZonePolyline(selectedZone) : []),
    [selectedZone]
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, height: "calc(100vh - 130px)" }}>
      {/* Left filter panel */}
      <aside
        style={{
          background: "#fff", borderRadius: 10, border: "1px solid #EAEAEA",
          padding: 16, overflow: "auto",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: "#160F3E", marginBottom: 12 }}>
          {lang === "en" ? "Corridor filters" : "تصفية المحور"}
        </div>

        {/* Phase selector */}
        <div style={{ marginBottom: 16 }}>
          <Label en="Phase (rollout)" ar="المرحلة (الإطلاق)" lang={lang} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 6 }}>
            <ChipBtn active={phaseFilter === "all"} onClick={() => setPhaseFilter("all")}>
              {lang === "en" ? "All" : "الكل"}
            </ChipBtn>
            {[1, 2, 3, 4, 5].map((p) => (
              <ChipBtn key={p} active={phaseFilter === p} onClick={() => setPhaseFilter(p as PhaseId)}>
                {p}
              </ChipBtn>
            ))}
          </div>
        </div>

        {/* Sub-stretch selector */}
        <div style={{ marginBottom: 16 }}>
          <Label en="Sub-stretch (geography)" ar="القطاع الجغرافي" lang={lang} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
            <ChipBtn active={stretchFilter === "all"} onClick={() => setStretchFilter("all")} block>
              {lang === "en" ? "All sub-stretches" : "جميع القطاعات"}
            </ChipBtn>
            {subStretches.map((s) => (
              <ChipBtn key={s.id} active={stretchFilter === s.id} onClick={() => setStretchFilter(s.id)} block>
                {lang === "en" ? s.name.en : s.name.ar}
              </ChipBtn>
            ))}
          </div>
        </div>

        {/* Layers */}
        <div style={{ marginBottom: 16 }}>
          <Label en="Map layers" ar="طبقات الخريطة" lang={lang} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
            <Toggle
              checked={layers.density}
              onChange={(v) => setLayers((l) => ({ ...l, density: v }))}
              label={lang === "en" ? "Distortion density" : "كثافة التشوه"}
            />
            <Toggle
              checked={layers.assets}
              onChange={(v) => setLayers((l) => ({ ...l, assets: v }))}
              label={lang === "en" ? "Assets (bridges, fuel, slums…)" : "الأصول (كباري، وقود، عشوائيات…)"}
            />
            <Toggle
              checked={layers.pocOnly}
              onChange={(v) => setLayers((l) => ({ ...l, pocOnly: v }))}
              label={lang === "en" ? "Show only PoC zones (Z8, Z35, Z70)" : "إظهار نطاقات التجربة فقط"}
            />
          </div>
        </div>

        {/* Selected zone summary */}
        {selectedZone && (() => {
          const z = getZone(selectedZone)!;
          const fz = findingsForZone(selectedZone);
          const open = fz.filter((f) => f.status !== "done").length;
          return (
            <div style={{ background: "#F4F6F8", borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ fontSize: 12, color: "#595959", marginBottom: 4 }}>
                {lang === "en" ? "Selected" : "المحدد"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#160F3E" }}>
                {lang === "en" ? z.name.en : z.name.ar}
              </div>
              <div style={{ fontSize: 11, color: "#595959", marginTop: 4 }}>
                {lang === "en" ? `Phase ${z.phase}` : `المرحلة ${z.phase}`} · km {z.startKm}–{z.endKm}
              </div>
              <div style={{ fontSize: 11, color: "#595959", marginTop: 2 }}>
                {fz.length > 0
                  ? (lang === "en"
                      ? `${fz.length} findings · ${open} open`
                      : `${fz.length} ملاحظة · ${open} مفتوحة`)
                  : (lang === "en" ? "No PoC data for this zone" : "لا توجد بيانات لهذا النطاق")
                }
              </div>
              {fz.length > 0 && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 10, width: "100%" }}
                  onClick={() => onOpenZone(selectedZone)}
                >
                  {lang === "en" ? "Open zone detail" : "فتح تفاصيل النطاق"}
                </button>
              )}
              <button
                className="btn"
                style={{ marginTop: 6, width: "100%" }}
                onClick={() => setSelectedZone(null)}
              >
                {lang === "en" ? "Clear selection" : "إلغاء التحديد"}
              </button>
            </div>
          );
        })()}
      </aside>

      {/* Map */}
      <div style={{ position: "relative", border: "1px solid #EAEAEA", borderRadius: 10, overflow: "hidden" }}>
        <MapContainer
          center={[21.45, 39.5]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <FlyToView zoneId={selectedZone} visibleZones={visibleZones} />

          {/* Base corridor polyline */}
          <Polyline
            positions={corridor}
            pathOptions={{ color: "#160F3E", weight: 4, opacity: 0.35 }}
          />

          {/* Per-zone polyline overlays (colored by density) */}
          {layers.density && visibleZones.map((z) => {
            const pts = getZonePolyline(z.id);
            return (
              <Polyline
                key={`zp-${z.id}`}
                positions={pts}
                pathOptions={{
                  color: densityFill(z.density),
                  weight: 8,
                  opacity: 0.85,
                  lineCap: "butt",
                }}
                eventHandlers={{ click: () => setSelectedZone(z.id) }}
              />
            );
          })}

          {/* Zone center dots for click targets */}
          {visibleZones.map((z) => {
            const isPoc = (POC_ZONE_IDS as readonly number[]).includes(z.id);
            return (
              <CircleMarker
                key={`zc-${z.id}`}
                center={[z.centerLat, z.centerLng]}
                radius={isPoc ? 7 : 4}
                pathOptions={{
                  color: isPoc ? "#160F3E" : "#fff",
                  fillColor: densityFill(z.density),
                  fillOpacity: 1,
                  weight: isPoc ? 2.5 : 1.5,
                }}
                eventHandlers={{ click: () => setSelectedZone(z.id) }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  <div style={{ fontFamily: "'Noto Naskh Arabic', sans-serif", fontSize: 12 }}>
                    <strong>{lang === "en" ? z.name.en : z.name.ar}</strong><br />
                    {lang === "en" ? `Phase ${z.phase}` : `المرحلة ${z.phase}`} · {z.density}
                    {isPoc && <><br /><em>{lang === "en" ? "PoC zone — has data" : "نطاق تجريبي — به بيانات"}</em></>}
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* Selected zone highlight */}
          {selectedPolyline.length > 0 && (
            <Polyline
              positions={selectedPolyline}
              pathOptions={{ color: "#160F3E", weight: 12, opacity: 0.6 }}
            />
          )}

          {/* Asset markers for visible zones */}
          {layers.assets && assets
            .filter((a) => visibleZones.some((z) => z.id === a.zoneId))
            .map((a) => {
              const icon = ASSET_ICON[a.type];
              return (
                <CircleMarker
                  key={a.id}
                  center={[a.lat, a.lng]}
                  radius={6}
                  pathOptions={{
                    color: "#fff", weight: 2,
                    fillColor: icon.color, fillOpacity: 1,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -6]}>
                    <div style={{ fontFamily: "'Noto Naskh Arabic', sans-serif", fontSize: 12 }}>
                      <strong>{lang === "en" ? a.name.en : a.name.ar}</strong><br />
                      {lang === "en" ? icon.en : icon.ar}
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
        </MapContainer>

        {/* Legend */}
        <div
          style={{
            position: "absolute", bottom: 12, left: 12, zIndex: 500,
            background: "#fff", borderRadius: 8, padding: "10px 14px",
            border: "1px solid #EAEAEA", fontSize: 11, color: "#323232",
            display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap",
          }}
        >
          <strong style={{ color: "#160F3E" }}>{lang === "en" ? "Density" : "الكثافة"}:</strong>
          <LegendDot c="#27AA8C">{lang === "en" ? "Low" : "منخفضة"}</LegendDot>
          <LegendDot c="#FD7E14">{lang === "en" ? "Medium" : "متوسطة"}</LegendDot>
          <LegendDot c="#AF0818">{lang === "en" ? "High" : "عالية"}</LegendDot>
          <span style={{ width: 1, height: 16, background: "#EAEAEA" }} />
          <strong style={{ color: "#160F3E" }}>{lang === "en" ? "Assets" : "الأصول"}:</strong>
          {Object.entries(ASSET_ICON).map(([key, v]) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: v.color, display: "inline-block" }} />
              {lang === "en" ? v.en : v.ar}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Label({ en, ar, lang }: { en: string; ar: string; lang: Lang }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#595959", letterSpacing: 0.5, textTransform: "uppercase" }}>
      {lang === "en" ? en : ar}
    </div>
  );
}

function ChipBtn({ active, onClick, children, block }: {
  active: boolean; onClick: () => void; children: React.ReactNode; block?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: block ? "100%" : undefined,
        padding: "6px 10px",
        borderRadius: 48,
        border: active ? "2px solid #066058" : "1px solid #EAEAEA",
        background: active ? "rgba(38,99,75,0.10)" : "#fff",
        color: active ? "#066058" : "#323232",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: "#066058", width: 16, height: 16 }}
      />
      {label}
    </label>
  );
}

function LegendDot({ c, children }: { c: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: c, display: "inline-block" }} />
      {children}
    </span>
  );
}
