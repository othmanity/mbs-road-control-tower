import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Lang, ActivityType } from "../types";
import { getZone, getZonePolyline, POC_ZONE_IDS, zones } from "../data/corridor";
import { findingsForZone, assetsForZone } from "../data/findings";
import { getAgency } from "../data/agencies";
import FindingCard from "../components/FindingCard";

interface ZoneDetailProps {
  lang: Lang;
  zoneId: number;
  onChangeZone: (id: number) => void;
  onBackToMap: () => void;
}

function FlyToZoneCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

export default function ZoneDetail({ lang, zoneId, onChangeZone, onBackToMap }: ZoneDetailProps) {
  const [tab, setTab] = useState<ActivityType | "all">("all");

  const z = getZone(zoneId);
  const findings = findingsForZone(zoneId);
  const assets = assetsForZone(zoneId);
  const zonePolyline = useMemo(() => getZonePolyline(zoneId), [zoneId]);

  if (!z) {
    return <div style={{ padding: 20 }}>Zone not found</div>;
  }

  const filtered = findings.filter((f) => tab === "all" || f.activityType === tab);

  const devCount = findings.filter((f) => f.activityType === "development").length;
  const opsCount = findings.filter((f) => f.activityType === "operational").length;
  const openCount = findings.filter((f) => f.status !== "done").length;
  const doneCount = findings.filter((f) => f.status === "done").length;

  const totalBudget = findings.reduce((s, f) => s + (f.budgetSAR ?? 0), 0);
  const totalSpent = findings.reduce((s, f) => s + (f.spentSAR ?? 0), 0);

  // Group owner agencies for the chip row
  const ownerAgencyIds = Array.from(new Set(findings.map((f) => f.ownerAgencyId)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Top bar */}
      <div
        style={{
          background: "#fff", borderRadius: 12, border: "1px solid #EAEAEA",
          padding: "16px 20px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 16, alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <button className="btn" onClick={onBackToMap}>
              {lang === "ar" ? "→ خريطة المحور" : "← Corridor map"}
            </button>
            <select
              value={zoneId}
              onChange={(e) => {
                const id = Number(e.target.value);
                if ((POC_ZONE_IDS as readonly number[]).includes(id)) onChangeZone(id);
              }}
              style={{
                padding: "6px 12px", borderRadius: 48,
                border: "1px solid #EAEAEA", fontSize: 13, color: "#323232", cursor: "pointer",
              }}
            >
              {zones.map((zz) => {
                const isPoc = (POC_ZONE_IDS as readonly number[]).includes(zz.id);
                return (
                  <option
                    key={zz.id}
                    value={zz.id}
                    disabled={!isPoc}
                    style={{ color: isPoc ? "#160F3E" : "#C0C8CC" }}
                  >
                    {lang === "en" ? zz.name.en : zz.name.ar}
                    {isPoc
                      ? "  •"
                      : (lang === "en" ? "  — no data yet" : "  — لا توجد بيانات")}
                  </option>
                );
              })}
            </select>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#160F3E" }}>
            {lang === "en" ? z.name.en : z.name.ar}
          </div>
          <div style={{ fontSize: 12, color: "#595959", marginTop: 2 }}>
            {lang === "en"
              ? `Phase ${z.phase} · km ${z.startKm}–${z.endKm} · ${z.density} distortion · ${z.trafficPerDay.toLocaleString()} vehicles/day`
              : `المرحلة ${z.phase} · كم ${z.startKm}–${z.endKm} · كثافة ${z.density} · ${z.trafficPerDay.toLocaleString()} مركبة/يوم`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <Stat label={lang === "en" ? "Findings" : "ملاحظات"} value={findings.length} />
          <Stat label={lang === "en" ? "Open" : "مفتوحة"} value={openCount} color="#AF0818" />
          <Stat label={lang === "en" ? "Done" : "منجزة"} value={doneCount} color="#006604" />
          <Stat label={lang === "en" ? "Dev / Ops" : "تطويرية/تشغيلية"} value={`${devCount}/${opsCount}`} />
        </div>
      </div>

      {/* Main 2-column: map left, agencies + budget right */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Mini-map for the zone */}
        <div
          style={{
            border: "1px solid #EAEAEA", borderRadius: 12, overflow: "hidden",
            background: "#fff", height: 320,
          }}
        >
          <MapContainer
            center={[z.centerLat, z.centerLng]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <FlyToZoneCenter lat={z.centerLat} lng={z.centerLng} />
            <Polyline
              positions={zonePolyline}
              pathOptions={{ color: "#160F3E", weight: 8, opacity: 0.6 }}
            />
            {assets.map((a) => (
              <CircleMarker
                key={a.id}
                center={[a.lat, a.lng]}
                radius={8}
                pathOptions={{ color: "#fff", weight: 2, fillColor: "#066058", fillOpacity: 1 }}
              >
                <Tooltip direction="top">
                  <div style={{ fontFamily: "'Noto Naskh Arabic', sans-serif", fontSize: 12 }}>
                    <strong>{lang === "en" ? a.name.en : a.name.ar}</strong>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Owner agencies (RACI chips) */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, color: "#160F3E", marginBottom: 8 }}>
              {lang === "en" ? "Agencies involved in this zone" : "الجهات المشاركة في هذا النطاق"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ownerAgencyIds.map((id) => {
                const a = getAgency(id)!;
                const count = findings.filter((f) => f.ownerAgencyId === id).length;
                return (
                  <span key={id} className="pill" style={{ background: "#F4F6F8", color: "#066058", fontSize: 11 }}>
                    {a.acronym} · {count}
                  </span>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: "#9DB5AC", marginTop: 8 }}>
              {lang === "en"
                ? "Overlap is one of the 4 root causes the report calls out (slide 9)."
                : "تعدد الجهات أحد الأسباب الجذرية الأربعة (شريحة 9)."}
            </div>
          </div>

          {/* Budget bar */}
          {totalBudget > 0 && (
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, color: "#160F3E", marginBottom: 8 }}>
                {lang === "en" ? "Development budget — this zone" : "ميزانية التطوير — هذا النطاق"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#595959", marginBottom: 4 }}>
                <span>{lang === "en" ? "Spent" : "المصروف"}: SAR {totalSpent.toLocaleString()}</span>
                <span>{lang === "en" ? "Budget" : "الميزانية"}: SAR {totalBudget.toLocaleString()}</span>
              </div>
              <div style={{ height: 8, background: "#EAEAEA", borderRadius: 6, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%`,
                    height: "100%",
                    background: "#066058",
                    borderRadius: 6,
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: "#9DB5AC", marginTop: 6 }}>
                {Math.round((totalSpent / totalBudget) * 100)}% {lang === "en" ? "of budget spent" : "من الميزانية مصروف"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Findings list with activity tab */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: "flex", borderBottom: "1px solid #EAEAEA", padding: "0 16px" }}>
          <TabBtn active={tab === "all"} onClick={() => setTab("all")}>
            {lang === "en" ? "All findings" : "كل الملاحظات"} ({findings.length})
          </TabBtn>
          <TabBtn active={tab === "development"} onClick={() => setTab("development")}>
            {lang === "en" ? "Development" : "أنشطة تطويرية"} ({devCount})
          </TabBtn>
          <TabBtn active={tab === "operational"} onClick={() => setTab("operational")}>
            {lang === "en" ? "Operational" : "أنشطة تشغيلية"} ({opsCount})
          </TabBtn>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "#9DB5AC", fontSize: 13 }}>
              {lang === "en" ? "No findings for this filter" : "لا توجد ملاحظات للمصفّي"}
            </div>
          )}
          {filtered.map((f) => <FindingCard key={f.id} lang={lang} finding={f} />)}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 64 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: color ?? "#160F3E", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#595959", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "12px 16px",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        color: active ? "#066058" : "#595959",
        borderBottom: active ? "2.5px solid #066058" : "2.5px solid transparent",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}
