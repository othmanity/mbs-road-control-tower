import type { Lang, Zone } from "../types";
import { zones } from "../data/corridor";

const densityColor = (d: Zone["density"]) =>
  d === "high" ? "#AF0818" : d === "medium" ? "#FD7E14" : "#ACDDC7";

interface CorridorStripProps {
  lang: Lang;
  highlightedZoneIds?: number[];
  onSelectZone?: (zoneId: number) => void;
  height?: number;
}

/** Linear 75-zone heatmap strip — quick at-a-glance corridor view */
export default function CorridorStrip({
  lang,
  highlightedZoneIds = [],
  onSelectZone,
  height = 40,
}: CorridorStripProps) {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, color: "#595959" }}>
        <span>{lang === "en" ? "Jeddah Port (0 km)" : "ميناء جدة (0 كم)"}</span>
        <span>{lang === "en" ? "Bahrah (30 km)" : "بحرة (30 كم)"}</span>
        <span>{lang === "en" ? "Prince Nayef (64 km)" : "الأمير نايف (64 كم)"}</span>
        <span>{lang === "en" ? "Haram (75 km)" : "الحرم (75 كم)"}</span>
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          height,
          borderRadius: 6,
          overflow: "hidden",
          border: "1px solid #EAEAEA",
        }}
      >
        {zones.map((z) => {
          const highlighted = highlightedZoneIds.includes(z.id);
          return (
            <button
              key={z.id}
              onClick={() => onSelectZone?.(z.id)}
              title={`${lang === "en" ? z.name.en : z.name.ar} · phase ${z.phase} · ${z.density}`}
              style={{
                flex: 1,
                height: "100%",
                background: densityColor(z.density),
                border: "none",
                cursor: onSelectZone ? "pointer" : "default",
                outline: highlighted ? "2px solid #160F3E" : "none",
                outlineOffset: highlighted ? -2 : 0,
                position: "relative",
                padding: 0,
              }}
            />
          );
        })}
      </div>

      {/* Phase ruler */}
      <div style={{ display: "flex", width: "100%", marginTop: 2, fontSize: 10, color: "#595959" }}>
        {[1, 2, 3, 4, 5].map((p) => (
          <div key={p} style={{ flex: 1, textAlign: "center", padding: "3px 0", borderRight: p < 5 ? "1px solid #EAEAEA" : "none" }}>
            {lang === "en" ? `Phase ${p}` : `المرحلة ${p}`}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "#595959" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 12, height: 8, background: "#ACDDC7", borderRadius: 2 }} />
          {lang === "en" ? "Low distortion" : "كثافة تشوه منخفضة"}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 12, height: 8, background: "#FD7E14", borderRadius: 2 }} />
          {lang === "en" ? "Medium" : "متوسطة"}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 12, height: 8, background: "#AF0818", borderRadius: 2 }} />
          {lang === "en" ? "High" : "عالية"}
        </span>
      </div>
    </div>
  );
}
