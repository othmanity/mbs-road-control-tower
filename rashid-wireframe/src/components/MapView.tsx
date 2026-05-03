import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { generateCityGeoJSON, generateExpansionGeoJSON, cityStats } from "../data/mockData";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  lang: "en" | "ar";
  selectedCity: string | null;
  onSelectCity: (name: string | null) => void;
}

function FlyToCity({ selectedCity }: { selectedCity: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCity) {
      const city = cityStats.find((c) => c.name === selectedCity);
      if (city) map.flyTo(city.center, 10, { duration: 1.5 });
    } else {
      map.flyTo([24.0, 44.0], 6, { duration: 1 });
    }
  }, [selectedCity, map]);
  return null;
}

export default function MapView({ lang, selectedCity, onSelectCity }: MapViewProps) {
  const [layers, setLayers] = useState({
    boundary2024: true,
    boundary2025: true,
    expansion: true,
  });

  const geojson2024 = generateCityGeoJSON("2024");
  const geojson2025 = generateCityGeoJSON("2025");
  const expansionGeoJSON = generateExpansionGeoJSON();

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    layer.bindTooltip(
      `<div style="font-family:'Noto Naskh Arabic',sans-serif;font-size:13px">
        <strong>${props.nameAr || props.name}</strong><br/>
        ${props.year ? props.year + " — " : ""}${
        props.expansion
          ? `+${props.expansion} km² (${props.growthPct}%)`
          : `${props.area} km²`
      }</div>`,
      { sticky: true }
    );
    layer.on("click", () => onSelectCity(props.name));
  };

  const layerDefs = [
    { key: "boundary2024" as const, label: lang === "en" ? "2024 Boundary" : "حدود 2024", color: "#005A96" },
    { key: "boundary2025" as const, label: lang === "en" ? "2025 Boundary" : "حدود 2025", color: "#26634B" },
    { key: "expansion" as const, label: lang === "en" ? "Expansion Zones" : "مناطق التوسع", color: "#FD7E14" },
  ];

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <MapContainer
        center={[24.0, 44.0]}
        zoom={6}
        style={{ height: "100%", width: "100%", borderRadius: 8 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FlyToCity selectedCity={selectedCity} />

        {layers.boundary2024 && (
          <GeoJSON
            data={geojson2024 as any}
            style={{ color: "#005A96", weight: 2, fillColor: "#005A96", fillOpacity: 0.08, dashArray: "8 4" }}
            onEachFeature={onEachFeature}
          />
        )}
        {layers.boundary2025 && (
          <GeoJSON
            data={geojson2025 as any}
            style={{ color: "#26634B", weight: 2.5, fillColor: "#26634B", fillOpacity: 0.12 }}
            onEachFeature={onEachFeature}
          />
        )}
        {layers.expansion && (
          <GeoJSON
            data={expansionGeoJSON as any}
            style={{ color: "#FD7E14", weight: 1.5, fillColor: "#FD7E14", fillOpacity: 0.3 }}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* Layer controls - DGA card style */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 1000,
          background: "#fff",
          borderRadius: 8,
          padding: "14px 16px",
          border: "1px solid #EAEAEA",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          minWidth: 170,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "#160F3E", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {lang === "en" ? "Layers" : "الطبقات"}
        </div>
        {layerDefs.map((l) => (
          <label
            key={l.key}
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 13 }}
          >
            <input
              type="checkbox"
              checked={layers[l.key]}
              onChange={(e) => setLayers((prev) => ({ ...prev, [l.key]: e.target.checked }))}
              style={{ accentColor: l.color, width: 16, height: 16 }}
            />
            <span style={{ width: 14, height: 3, background: l.color, borderRadius: 1, display: "inline-block" }} />
            <span style={{ color: "#323232" }}>{l.label}</span>
          </label>
        ))}
        {selectedCity && (
          <button
            onClick={() => onSelectCity(null)}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "6px",
              borderRadius: 48,
              border: "2px solid #26634B",
              background: "transparent",
              color: "#26634B",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Noto Naskh Arabic', sans-serif",
            }}
          >
            {lang === "en" ? "Show All Cities" : "عرض جميع المدن"}
          </button>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          zIndex: 1000,
          background: "#fff",
          borderRadius: 8,
          padding: "8px 14px",
          border: "1px solid #EAEAEA",
          fontSize: 12,
          display: "flex",
          gap: 14,
          alignItems: "center",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 16, height: 0, borderTop: "2px dashed #005A96", display: "inline-block" }} /> 2024
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 16, height: 2, background: "#26634B", display: "inline-block" }} /> 2025
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 12, height: 12, background: "rgba(253,126,20,0.35)", border: "1px solid #FD7E14", display: "inline-block", borderRadius: 2 }} />
          {lang === "en" ? "Expansion" : "توسع"}
        </span>
      </div>
    </div>
  );
}
