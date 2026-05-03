// District-agnostic synthetic geometry generator.
// Renders a representative sample of features for ANY district given its
// center, area, and the layer counts coming from the backend.
//
// Each district has its OWN deterministic seed, so re-renders are stable
// and different districts get different shapes.

export interface DistrictSpec {
  id: string;
  name: string;
  center: [number, number];     // [lat, lng]
  areaKm2: number;
  population: number;
}

export interface SyntheticLayer {
  type: "polygon" | "point" | "line" | "boundary";
  features: Array<[number, number]> | Array<[number, number][]>;
}

// Sample caps — we don't render millions of features even when the real
// count IS millions; the legend shows the true count.
const SAMPLE_CAPS: Record<string, number> = {
  district_boundary: 1,
  parcels: 80,
  buildings: 70,
  building_permits: 35,
  land_use: 60,
  roads: 25,
  street_lights: 60,
  pavements: 20,
  fire_hydrants: 40,
  pump_stations: 6,
  schools: 30,
  government_facilities: 25,
  mosques: 30,
  commercial: 50,
  public_facilities: 30,
  ad_signs: 25,
  digging_permits_point: 25,
  digging_permits_linear: 15,
  subdivision_plans: 2,
};

// Mulberry32 — deterministic PRNG so renders are stable per-district.
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash a district id into a numeric seed.
function seedFromId(id: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

// Approximate radius of the district in degrees (assuming circular shape).
function radiusDeg(d: DistrictSpec): { dLat: number; dLng: number } {
  const radiusKm = Math.sqrt(d.areaKm2 / Math.PI);
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.cos((d.center[0] * Math.PI) / 180));
  return { dLat, dLng };
}

// Generate the boundary polygon — irregular blob, deterministic per district.
export function generateBoundary(d: DistrictSpec): [number, number][] {
  const rand = mulberry32(seedFromId(d.id, 1));
  const { dLat, dLng } = radiusDeg(d);
  const points: [number, number][] = [];
  const N = 32;
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * 2 * Math.PI;
    const jitter = 0.85 + rand() * 0.3; // ±15%
    const lat = d.center[0] + Math.sin(angle) * dLat * jitter;
    const lng = d.center[1] + Math.cos(angle) * dLng * jitter;
    points.push([lat, lng]);
  }
  points.push(points[0]); // close ring
  return points;
}

// Scatter N points inside the district's circular bound.
function scatterPoints(d: DistrictSpec, count: number, seedSalt: number): Array<[number, number]> {
  const rand = mulberry32(seedFromId(d.id, seedSalt));
  const { dLat, dLng } = radiusDeg(d);
  const out: Array<[number, number]> = [];
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(rand()) * 0.92;          // sqrt for uniform area
    const a = rand() * 2 * Math.PI;
    out.push([
      d.center[0] + Math.sin(a) * dLat * r,
      d.center[1] + Math.cos(a) * dLng * r,
    ]);
  }
  return out;
}

// Tiny rectangles for parcels/buildings.
function scatterPolygons(d: DistrictSpec, count: number, seedSalt: number, sizeFraction: number): Array<[number, number][]> {
  const pts = scatterPoints(d, count, seedSalt);
  const { dLat, dLng } = radiusDeg(d);
  const dLatBox = dLat * sizeFraction;
  const dLngBox = dLng * sizeFraction;
  return pts.map(([lat, lng]) => [
    [lat - dLatBox, lng - dLngBox],
    [lat - dLatBox, lng + dLngBox],
    [lat + dLatBox, lng + dLngBox],
    [lat + dLatBox, lng - dLngBox],
    [lat - dLatBox, lng - dLngBox],
  ]);
}

// Short polylines for roads/pavements/trenches.
function scatterLines(d: DistrictSpec, count: number, seedSalt: number, lengthFraction: number): Array<[number, number][]> {
  const rand = mulberry32(seedFromId(d.id, seedSalt + 1));
  const starts = scatterPoints(d, count, seedSalt);
  const { dLat, dLng } = radiusDeg(d);
  return starts.map(([lat, lng]) => {
    const angle = rand() * Math.PI * 2;
    return [
      [lat, lng],
      [
        lat + Math.sin(angle) * dLat * lengthFraction,
        lng + Math.cos(angle) * dLng * lengthFraction,
      ],
    ];
  });
}

// Two large polygons for subdivision plans (split the district roughly).
function subdivisionPlans(d: DistrictSpec): Array<[number, number][]> {
  const { dLat, dLng } = radiusDeg(d);
  return [
    [
      [d.center[0] + dLat * 0.7, d.center[1] - dLng * 0.5],
      [d.center[0] + dLat * 0.7, d.center[1] + dLng * 0.5],
      [d.center[0] - dLat * 0.1, d.center[1] + dLng * 0.5],
      [d.center[0] - dLat * 0.1, d.center[1] - dLng * 0.5],
      [d.center[0] + dLat * 0.7, d.center[1] - dLng * 0.5],
    ],
    [
      [d.center[0] - dLat * 0.2, d.center[1] - dLng * 0.5],
      [d.center[0] - dLat * 0.2, d.center[1] + dLng * 0.5],
      [d.center[0] - dLat * 0.7, d.center[1] + dLng * 0.5],
      [d.center[0] - dLat * 0.7, d.center[1] - dLng * 0.5],
      [d.center[0] - dLat * 0.2, d.center[1] - dLng * 0.5],
    ],
  ];
}

// Build all synthetic features for a district. Returns layer_key -> features.
export function buildLayersFor(d: DistrictSpec): Record<string, SyntheticLayer> {
  const cap = (key: string, real: number) => Math.min(real, SAMPLE_CAPS[key] ?? 30);
  return {
    district_boundary: { type: "boundary", features: [generateBoundary(d)] },
    parcels:                { type: "polygon", features: scatterPolygons(d, cap("parcels", 9999), 10, 0.018) },
    buildings:              { type: "polygon", features: scatterPolygons(d, cap("buildings", 9999), 11, 0.014) },
    building_permits:       { type: "point",   features: scatterPoints(d, cap("building_permits", 9999), 12) },
    land_use:               { type: "polygon", features: scatterPolygons(d, cap("land_use", 9999), 13, 0.022) },
    roads:                  { type: "line",    features: scatterLines(d, cap("roads", 9999), 14, 0.18) },
    street_lights:          { type: "point",   features: scatterPoints(d, cap("street_lights", 9999), 15) },
    pavements:              { type: "line",    features: scatterLines(d, cap("pavements", 9999), 16, 0.10) },
    fire_hydrants:          { type: "point",   features: scatterPoints(d, cap("fire_hydrants", 9999), 17) },
    pump_stations:          { type: "point",   features: scatterPoints(d, cap("pump_stations", 9999), 18) },
    schools:                { type: "point",   features: scatterPoints(d, cap("schools", 9999), 19) },
    government_facilities:  { type: "point",   features: scatterPoints(d, cap("government_facilities", 9999), 20) },
    mosques:                { type: "point",   features: scatterPoints(d, cap("mosques", 9999), 21) },
    commercial:             { type: "point",   features: scatterPoints(d, cap("commercial", 9999), 22) },
    public_facilities:      { type: "point",   features: scatterPoints(d, cap("public_facilities", 9999), 23) },
    ad_signs:               { type: "point",   features: scatterPoints(d, cap("ad_signs", 9999), 24) },
    digging_permits_point:  { type: "point",   features: scatterPoints(d, cap("digging_permits_point", 9999), 25) },
    digging_permits_linear: { type: "line",    features: scatterLines(d, cap("digging_permits_linear", 9999), 26, 0.08) },
    subdivision_plans:      { type: "polygon", features: subdivisionPlans(d) },
  };
}
