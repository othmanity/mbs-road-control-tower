// Dimmed background map for the Ask Rashid chat panel.
// Renders every district's boundary on a Saudi-wide map; flies to the
// `focusedDistrict` whenever the user (or Rashid) names one.
import { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { District } from "../api/client";
import { generateBoundary } from "../data/districtsGeo";

const SAUDI_BOUNDS: [[number, number], [number, number]] = [[16.5, 34.5], [32.5, 55.7]];
const KSA_CENTER: [number, number] = [24.5, 45.0];

// Real Ash Shati shape (matches the one in the GIS page).
const ASH_SHATI_BOUNDARY: [number, number][] = [
  [26.4990, 50.1275], [26.4970, 50.1320], [26.4920, 50.1335], [26.4870, 50.1340],
  [26.4810, 50.1340], [26.4750, 50.1335], [26.4690, 50.1330], [26.4630, 50.1320],
  [26.4575, 50.1305], [26.4530, 50.1290], [26.4525, 50.1255], [26.4555, 50.1240],
  [26.4615, 50.1235], [26.4685, 50.1235], [26.4755, 50.1240], [26.4825, 50.1245],
  [26.4890, 50.1250], [26.4940, 50.1255], [26.4990, 50.1275],
];

function boundaryFor(d: District): [number, number][] {
  if (d.id === "ash-shati-ash-sharqi") return ASH_SHATI_BOUNDARY;
  return generateBoundary({
    id: d.id,
    name: d.name,
    center: [d.center_lat ?? 24.5, d.center_lng ?? 45.0],
    areaKm2: d.area_km2 ?? 50,
    population: d.population ?? 50000,
  });
}

function FlyTo({ districts, focusedId }: { districts: District[]; focusedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!focusedId) {
      map.flyToBounds(SAUDI_BOUNDS, { duration: 1.4, padding: [20, 20] });
      return;
    }
    const d = districts.find((x) => x.id === focusedId);
    if (!d?.center_lat || !d?.center_lng) return;
    const area = d.area_km2 ?? 100;
    const zoom = area < 10 ? 14 : area < 200 ? 12 : area < 1500 ? 10 : 9;
    map.flyTo([d.center_lat, d.center_lng], zoom, { duration: 1.4 });
  }, [focusedId, districts, map]);
  return null;
}

interface Props {
  districts: District[];
  focusedDistrict: string | null;
}

export default function ChatBackgroundMap({ districts, focusedDistrict }: Props) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 10 }}>
      <MapContainer
        center={KSA_CENTER}
        zoom={6}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%", background: "#F8FAF9" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FlyTo districts={districts} focusedId={focusedDistrict} />
        {/* When a district is focused, render ONLY its boundary so the map
            stays clean. Saudi-wide view (no focus) renders every district. */}
        {districts
          .filter((d) => !focusedDistrict || d.id === focusedDistrict)
          .map((d) => {
            const isFocused = d.id === focusedDistrict;
            return (
              <Polygon
                key={d.id}
                positions={boundaryFor(d)}
                pathOptions={{
                  color: isFocused ? "#26634B" : "#0F2A24",
                  weight: isFocused ? 3 : 1.5,
                  fillColor: isFocused ? "#0AEBD7" : "#26634B",
                  fillOpacity: isFocused ? 0.45 : 0.18,
                }}
              />
            );
          })}
      </MapContainer>
    </div>
  );
}
