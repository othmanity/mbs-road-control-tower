// 75 km corridor: Jeddah Islamic Port → Bahrah Bridge → Prince Naif Bridge → Masjid Al-Haram
// Divided into 75 zones of ~1 km each, grouped into 5 Phases × 15 zones
// and into 3 geographic sub-stretches (port / middle / haram).

import type { SubStretch, Zone, PhaseId, SubStretchId, DensityLevel } from "../types";

export const CORRIDOR_TOTAL_KM = 75;

// Approximate route waypoints along MBS Road (km marker → lat,lng)
// Coordinates are illustrative; the corridor curves slightly south then bends NE toward Makkah.
const ROUTE_WAYPOINTS: { km: number; lat: number; lng: number }[] = [
  { km: 0,  lat: 21.4830, lng: 39.1820 }, // Jeddah Islamic Port
  { km: 12, lat: 21.4720, lng: 39.2950 },
  { km: 24, lat: 21.4540, lng: 39.4100 },
  { km: 30, lat: 21.4380, lng: 39.4970 }, // Bahrah Bridge
  { km: 42, lat: 21.4280, lng: 39.5900 },
  { km: 55, lat: 21.4250, lng: 39.6800 },
  { km: 64, lat: 21.4220, lng: 39.7430 }, // Prince Naif Bridge
  { km: 70, lat: 21.4230, lng: 39.7920 },
  { km: 75, lat: 21.4225, lng: 39.8262 }, // Masjid Al-Haram
];

function interpolateAtKm(km: number): { lat: number; lng: number } {
  for (let i = 0; i < ROUTE_WAYPOINTS.length - 1; i++) {
    const a = ROUTE_WAYPOINTS[i];
    const b = ROUTE_WAYPOINTS[i + 1];
    if (km >= a.km && km <= b.km) {
      const t = (km - a.km) / (b.km - a.km);
      return {
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
      };
    }
  }
  const last = ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1];
  return { lat: last.lat, lng: last.lng };
}

export const subStretches: SubStretch[] = [
  {
    id: "port",
    name: { en: "Port → Bahrah", ar: "الميناء إلى بحرة" },
    startKm: 0,
    endKm: 30,
    description: {
      en: "Logistics, port traffic, workshops & warehouses",
      ar: "النقل واللوجستيات، ورش ومستودعات",
    },
  },
  {
    id: "middle",
    name: { en: "Bahrah → Prince Naif", ar: "بحرة إلى كبري الأمير نايف" },
    startKm: 30,
    endKm: 64,
    description: {
      en: "Inter-city, fuel stations, ad boards, slum pockets",
      ar: "النقل بين المدن، محطات وقود، لوحات إعلانية، عشوائيات",
    },
  },
  {
    id: "haram",
    name: { en: "Prince Naif → Holy Mosque", ar: "كبري الأمير نايف إلى الحرم" },
    startKm: 64,
    endKm: 75,
    description: {
      en: "Pilgrim approach to Al-Masjid Al-Haram (high scrutiny)",
      ar: "مدخل الحجاج إلى المسجد الحرام (تدقيق عالٍ)",
    },
  },
];

function subStretchForZone(zoneId: number): SubStretchId {
  if (zoneId <= 30) return "port";
  if (zoneId <= 64) return "middle";
  return "haram";
}

function phaseForZone(zoneId: number): PhaseId {
  // Phase 1: 1-15, Phase 2: 16-30, Phase 3: 31-45, Phase 4: 46-60, Phase 5: 61-75
  return (Math.ceil(zoneId / 15) as PhaseId);
}

// Deterministic pseudo-random density distribution
// Heavier distortion concentration in workshops belt (8-14), slum belt (33-40),
// fuel/ads belt (45-55), and pilgrim approach Haram (66-72).
function densityForZone(zoneId: number): DensityLevel {
  const highBelts = [
    [8, 14],   // workshop & warehouse cluster
    [33, 40],  // slum + ad-board cluster
    [50, 56],  // fuel-station & barrier cluster
    [66, 72],  // pilgrim-approach distortion
  ];
  const mediumBelts = [
    [3, 7], [15, 18], [28, 32], [41, 49], [57, 65], [73, 75],
  ];
  const inBelt = (belts: number[][]) => belts.some(([a, b]) => zoneId >= a && zoneId <= b);
  if (inBelt(highBelts)) return "high";
  if (inBelt(mediumBelts)) return "medium";
  return "low";
}

function trafficForZone(zoneId: number): number {
  // Pilgrim approach has higher density; logistics belt also heavy
  const sub = subStretchForZone(zoneId);
  const base = sub === "haram" ? 175_000 : sub === "middle" ? 130_000 : 95_000;
  return base + ((zoneId * 137) % 20_000); // tiny pseudo-random spread
}

export const zones: Zone[] = Array.from({ length: 75 }, (_, i) => {
  const id = i + 1;
  const startKm = i;
  const endKm = i + 1;
  const midKm = i + 0.5;
  const { lat, lng } = interpolateAtKm(midKm);
  return {
    id,
    phase: phaseForZone(id),
    subStretch: subStretchForZone(id),
    name: {
      en: `Zone ${id}`,
      ar: `النطاق ${id}`,
    },
    startKm,
    endKm,
    centerLat: lat,
    centerLng: lng,
    density: densityForZone(id),
    trafficPerDay: trafficForZone(id),
  };
});

export function getZone(id: number): Zone | undefined {
  return zones.find((z) => z.id === id);
}

export function getZonePolyline(zoneId: number): [number, number][] {
  // Generate a small polyline that traces the 1 km zone
  const samples = 8;
  const z = getZone(zoneId);
  if (!z) return [];
  const pts: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const km = z.startKm + (i / samples) * (z.endKm - z.startKm);
    const { lat, lng } = interpolateAtKm(km);
    pts.push([lat, lng]);
  }
  return pts;
}

export function getCorridorPolyline(): [number, number][] {
  const pts: [number, number][] = [];
  for (let km = 0; km <= CORRIDOR_TOTAL_KM; km += 0.5) {
    const { lat, lng } = interpolateAtKm(km);
    pts.push([lat, lng]);
  }
  return pts;
}

// The 3 zones chosen for the PoC — one per sub-stretch
export const POC_ZONE_IDS = [8, 35, 70] as const;
