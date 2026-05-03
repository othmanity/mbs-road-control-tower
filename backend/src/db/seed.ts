// Seeds the rashid.db with all three datasets:
//   1. multi-cities (6 major Saudi cities, 2024 vs 2025 expansion)
//   2. al-seh sub-area (under Al-Ahsa)
//   3. ash-shati-ash-sharqi (the new Dammam coastal district, 19 GIS layers)
//
// All numbers come from the MOMAH documents in /New-documents-received/.
import { getDb } from "./connection.js";

const db = getDb();
const now = () => new Date().toISOString();

// Wipe everything in the right FK order so seeding is idempotent.
db.exec(`
  DELETE FROM chat_messages;
  DELETE FROM chat_sessions;
  DELETE FROM qa_bank;
  DELETE FROM keywords;
  DELETE FROM gis_layers;
  DELETE FROM insights;
  DELETE FROM district_kpis;
  DELETE FROM reports;
  DELETE FROM sub_areas;
  DELETE FROM multi_city_stats;
  DELETE FROM districts;
  DELETE FROM users;
`);

// ---------- USERS (mirrors existing frontend AuthContext) ----------
const insertUser = db.prepare(
  `INSERT INTO users (username, password, display_name, display_name_ar, role) VALUES (?, ?, ?, ?, ?)`,
);
[
  ["admin", "admin123", "Admin User", "المسؤول", "admin"],
  ["demo", "demo", "Demo User", "مستخدم تجريبي", "viewer"],
  ["rashid", "rashid2025", "Rashid Reviewer", "مراجع راشد", "viewer"],
].forEach((u) => insertUser.run(...u));

// ---------- DISTRICTS ----------
const insertDistrict = db.prepare(`
  INSERT INTO districts (id, name, name_ar, kind, parent, municipality, municipality_ar,
                         population, area_km2, perimeter_km, center_lat, center_lng,
                         data_validated_at, summary_en, summary_ar)
  VALUES (@id, @name, @name_ar, @kind, @parent, @municipality, @municipality_ar,
          @population, @area_km2, @perimeter_km, @center_lat, @center_lng,
          @data_validated_at, @summary_en, @summary_ar)
`);

insertDistrict.run({
  id: "ash-shati-ash-sharqi",
  name: "Ash Shati Ash Sharqi",
  name_ar: "الشاطئ الشرقي",
  kind: "district",
  parent: "Dammam",
  municipality: "Eastern Province Municipality",
  municipality_ar: "أمانة المنطقة الشرقية",
  population: 16380,
  area_km2: 4.48,
  perimeter_km: 12.2,
  center_lat: 26.4725,
  center_lng: 50.1275,
  data_validated_at: "2026-04-01",
  summary_en:
    "Major coastal district in Dammam, Eastern Province (code 00500001062). 19 GIS layers, 9,416 features, predominantly residential supported by robust commercial corridors.",
  summary_ar:
    "حي ساحلي رئيسي في الدمام، المنطقة الشرقية (الرمز 00500001062). 19 طبقة جغرافية، 9,416 معلماً، طابع سكني غالب مدعوم بممرات تجارية قوية.",
});

insertDistrict.run({
  id: "al-seh",
  name: "Al-Seh",
  name_ar: "السيح",
  kind: "sub-area",
  parent: "Al-Ahsa",
  municipality: "Al-Jafr Municipality",
  municipality_ar: "أمانة الجفر",
  population: 2830,
  area_km2: 1.31,
  perimeter_km: null as any,
  center_lat: 25.36,
  center_lng: 49.59,
  data_validated_at: "2025-12-15",
  summary_en:
    "Sub-area within Al-Ahsa governed by Al-Seh Hijra Plan (No. 4/646). Population grew 216% between 2020 and 2025; westward controlled expansion recommended.",
  summary_ar:
    "منطقة ضمن الأحساء تخضع لتخطيط هجرة السيح (رقم 4/646). نما عدد السكان بنسبة 216% بين 2020 و2025؛ يُوصى بتوسع غربي منضبط.",
});

// 6 major cities so we can route the existing multi-city dashboard through districts too
const cities: Array<[string, string, string, number, number, number, number]> = [
  // [id,            name,    name_ar,         pop,     area, lat,     lng]
  ["riyadh", "Riyadh", "الرياض", 7600000, 1945, 24.7136, 46.6753],
  ["jeddah", "Jeddah", "جدة", 4780000, 1268, 21.4858, 39.1925],
  ["dammam", "Dammam", "الدمام", 1255211, 562, 26.3927, 49.9777],
  ["makkah", "Makkah", "مكة المكرمة", 2042000, 871, 21.3891, 39.8579],
  ["madinah", "Madinah", "المدينة المنورة", 1488000, 638, 24.4539, 39.6142],
  ["al-ahsa", "Al-Ahsa", "الأحساء", 1300000, 1472, 25.3647, 49.5879],
];
cities.forEach(([id, name, name_ar, pop, area, lat, lng]) =>
  insertDistrict.run({
    id,
    name,
    name_ar,
    kind: "city",
    parent: "Saudi Arabia",
    municipality: name + " Municipality",
    municipality_ar: "أمانة " + name_ar,
    population: pop,
    area_km2: area,
    perimeter_km: null as any,
    center_lat: lat,
    center_lng: lng,
    data_validated_at: "2025-12-31",
    summary_en: `${name} — major Saudi city, urban expansion analysis 2024 vs 2025.`,
    summary_ar: `${name_ar} — مدينة سعودية رئيسية، تحليل التوسع العمراني 2024 مقابل 2025.`,
  }),
);

// ---------- KPIs (the 8-tile dashboard for Ash Shati from Pix p.4) ----------
const insertKpi = db.prepare(`
  INSERT INTO district_kpis (district_id, key, label_en, label_ar, value, unit, severity, year)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const ash = "ash-shati-ash-sharqi";
const kpis: Array<[string, string, string, string, number, string | null, string | null, number | null]> = [
  [ash, "population", "Population", "السكان", 16380, null, null, 2026],
  [ash, "land_parcels", "Land Parcels", "قطع الأراضي", 2676, null, null, 2026],
  [ash, "buildings", "Buildings", "المباني", 1979, null, null, 2026],
  [ash, "units", "Units", "الوحدات", 4818, null, null, 2026],
  [ash, "roads", "Road Segments", "أجزاء الطرق", 220, null, null, 2026],
  [ash, "street_lights", "Street Lights", "أعمدة الإنارة", 1829, null, null, 2026],
  [ash, "fire_hydrants", "Fire Hydrants", "صنابير الإطفاء", 265, null, null, 2026],
  [ash, "commercial", "Commercial Establishments", "المنشآت التجارية", 303, null, null, 2026],
  [ash, "developed_parcels", "Developed Parcels", "القطع المطورة", 2256, null, null, 2026],
  [ash, "licensed_parcels", "Licensed Parcels", "القطع المرخصة", 1478, null, null, 2026],
  [ash, "undeveloped_parcels", "Undeveloped Parcels", "القطع غير المطورة", 428, null, null, 2026],
  [ash, "schools", "Schools (all private)", "المدارس (جميعها أهلية)", 14, null, "CRITICAL", 2026],
  [ash, "mosques", "Mosques (incl. 1 Jami)", "المساجد (منها 1 جامع)", 23, null, null, 2026],
  [ash, "government_facilities", "Government Facilities", "المرافق الحكومية", 20, null, null, 2026],
  [ash, "road_network_km", "Road Network", "شبكة الطرق", 128.9, "km", null, 2026],
  [ash, "footprint_m2", "Building Footprint", "بصمة المباني", 634565, "m²", null, 2026],
  [ash, "pavement_m2", "Pavement Coverage", "مساحة الأرصفة", 262277, "m²", null, 2026],
  [ash, "active_permits", "Active Building Permits", "تراخيص البناء النشطة", 1012, null, null, 2026],
  [ash, "digging_permits", "Digging Permits", "تصاريح الحفر", 389, null, null, 2026],
  [ash, "ad_signs", "Advertising Signs", "اللافتات الإعلانية", 69, null, null, 2026],
  [ash, "pump_stations", "Pump Stations", "محطات الضخ", 4, null, null, 2026],
  [ash, "public_facilities", "Public Facilities", "المرافق العامة", 42, null, null, 2026],
];
kpis.forEach((k) => insertKpi.run(...k));

// ---------- INSIGHTS (the 10 MOMAH executive findings) ----------
const insertInsight = db.prepare(`
  INSERT INTO insights (district_id, position, title_en, title_ar, severity, metric, benchmark, body_en, body_ar)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insights: Array<[string, number, string, string, string, string, string | null, string, string]> = [
  [
    ash, 1,
    "Educational Equity & Privatization Gap",
    "فجوة العدالة التعليمية والخصخصة",
    "CRITICAL",
    "0 public schools",
    "100% of 14 schools are private",
    "School capacity (3,219) covers 98.3% of the school-age population (3,276), but 100% of the 14 schools are private (أهلية). Zero public educational facilities are registered — potentially conflicting with national equity standards.",
    "السعة المدرسية (3,219) تغطي 98.3% من السكان في سن الدراسة (3,276)، لكن 100% من المدارس الـ14 خاصة (أهلية). لا توجد أي مدارس حكومية مسجلة — قد يتعارض مع معايير العدالة الوطنية.",
  ],
  [
    ash, 2,
    "Unlicensed Development Gap",
    "فجوة التطوير غير المرخص",
    "CRITICAL",
    "778 parcels unlicensed",
    "29.1% of developed parcels lack active licenses",
    "2,256 parcels (84.3%) are physically developed, but only 1,478 hold active building permits. The compliance gap of 778 parcels (29.1%) represents a major opportunity for regularization and municipal revenue generation.",
    "تم تطوير 2,256 قطعة (84.3%) فعلياً، لكن فقط 1,478 تحمل تراخيص بناء نشطة. تمثل فجوة الامتثال البالغة 778 قطعة (29.1%) فرصة كبيرة للتقنين وتوليد إيرادات بلدية.",
  ],
  [
    ash, 3,
    "Primary Healthcare Deficit",
    "نقص الرعاية الصحية الأولية",
    "CRITICAL",
    "0 primary health centers",
    "WHO requires 1.5 centers per 16,380 residents",
    "For 16,380 residents WHO requires at least 1.5 primary health centers (1 per 10,000). The GIS data reveals zero primary care facilities — only one parcel zoned for a general hospital and three commercial pharmacies exist.",
    "لـ16,380 نسمة تتطلب منظمة الصحة العالمية ما لا يقل عن 1.5 مركز رعاية صحية أولية (1 لكل 10,000). تكشف البيانات الجغرافية وجود صفر مركز رعاية أولية — فقط قطعة واحدة مخصصة لمستشفى عام وثلاث صيدليات تجارية.",
  ],
  [
    ash, 4,
    "Severe Green Space Deficit",
    "نقص حاد في المساحات الخضراء",
    "CRITICAL",
    "2 small parks",
    "WHO requires 9 m² per capita = 147,420 m² needed",
    "Only 2 small parcels are designated as parks/recreational spaces across the entire 4.48 km² district. WHO recommends 9 m² of green space per capita (147,420 m² required), so the district falls drastically short.",
    "تم تخصيص قطعتين صغيرتين فقط كحدائق/مساحات ترفيهية في الحي بأكمله (4.48 كم²). توصي منظمة الصحة العالمية بـ9 م² لكل فرد (مطلوب 147,420 م²)، فالحي بعيد جداً عن المعيار.",
  ],
  [
    ash, 5,
    "Street Lighting Deficit",
    "نقص الإنارة في الشوارع",
    "HIGH",
    "14.2 lights/km",
    "Benchmark: 30–40 lights/km (53% below minimum)",
    "The 128.9 km road network has 1,829 street lights — 14.2 per km, with average spacing of 70.5 m. Urban residential benchmarks require 30–40 lights/km (25–30 m spacing). The district is 53% below minimum.",
    "شبكة الطرق البالغة 128.9 كم تحتوي 1,829 عمود إنارة — 14.2 لكل كم بمتوسط تباعد 70.5 م. المعايير السكنية الحضرية تتطلب 30-40 عمود/كم (تباعد 25-30 م). الحي أقل بنسبة 53% من الحد الأدنى.",
  ],
  [
    ash, 6,
    "Public Parking Shortage",
    "نقص مواقف السيارات العامة",
    "MEDIUM",
    "0.13 lots per business",
    "303 commercial establishments share 38 public lots",
    "303 commercial establishments share only 38 designated public parking lots (0.13 per business, ~1 lot per 8 businesses). Likely causes peak-hour congestion and illegal street parking.",
    "303 منشأة تجارية تتشارك 38 موقفاً عاماً فقط (0.13 لكل منشأة، ~1 موقف لكل 8 منشآت). يسبب على الأرجح ازدحاماً في ساعات الذروة ووقوفاً غير نظامي.",
  ],
  [
    ash, 7,
    "Jami Mosque Shortage",
    "نقص الجوامع",
    "MEDIUM",
    "1 Jami mosque",
    "Population of 16,380 typically requires 2–3 Jami mosques",
    "23 mosques serve the population (1 per 712, within the Saudi 500–800 benchmark). However, only 1 Jami (Friday) mosque exists where 2–3 are typically required for Friday prayer capacity.",
    "23 مسجداً تخدم السكان (1 لكل 712، ضمن المعيار السعودي 500-800). لكن يوجد جامع واحد فقط حيث يلزم عادة 2-3 جوامع لاستيعاب صلاة الجمعة.",
  ],
  [
    ash, 8,
    "Undeveloped Land Opportunity",
    "فرصة الأراضي غير المطورة",
    "OPPORTUNITY",
    "27.9 hectares (428 parcels)",
    "Prime coastal land available for development",
    "428 parcels remain undeveloped — 27.9 hectares (279,201 m²) of prime coastal real estate. MOMAH can target these for White Land Tax enforcement or partner with developers to resolve school, healthcare and green-space deficits.",
    "428 قطعة لا تزال غير مطورة — 27.9 هكتار (279,201 م²) من العقارات الساحلية الفاخرة. يمكن لوزارة البلديات استهدافها لتطبيق ضريبة الأراضي البيضاء أو الشراكة مع المطورين لمعالجة عجز المدارس والصحة والمساحات الخضراء.",
  ],
  [
    ash, 9,
    "Fire Safety Preparedness",
    "الجاهزية لمكافحة الحرائق",
    "POSITIVE",
    "1 hydrant per 7.5 buildings",
    "Within NFPA standard (1 per 5–8)",
    "265 fire hydrants serve 1,979 buildings — 1 hydrant per 7.5 buildings, well within the strict NFPA standard benchmark of 1 per 5–8. Hydrant density is 59.2 per km².",
    "265 صنبوراً للإطفاء تخدم 1,979 مبنى — 1 صنبور لكل 7.5 مبنى، ضمن معيار NFPA الصارم البالغ 1 لكل 5-8. كثافة الصنابير 59.2 لكل كم².",
  ],
  [
    ash, 10,
    "Pedestrian Walkability",
    "التنقل المشاة",
    "POSITIVE",
    "262,277 m² of pavement",
    "2,034 m² per km of road",
    "591 dedicated pavement segments cover 262,277 m² — averaging 2,034 m² per km of road, supporting the high commercial density and promoting a walkable urban environment.",
    "591 جزءاً مخصصاً للأرصفة يغطي 262,277 م² — بمعدل 2,034 م² لكل كم من الطرق، مما يدعم الكثافة التجارية العالية ويعزز بيئة حضرية صديقة للمشاة.",
  ],
];
insights.forEach((i) => insertInsight.run(...i));

// ---------- GIS LAYERS (19 layers for Ash Shati + 3 layers for multi-cities) ----------
const insertLayer = db.prepare(`
  INSERT INTO gis_layers (district_id, layer_key, name_en, name_ar, color, geometry_type,
                          feature_count, description_en, description_ar)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const ashLayers: Array<[string, string, string, string, string, number, string, string]> = [
  // [key, name_en, name_ar, color, geometry, count, desc_en, desc_ar]
  ["district_boundary", "District Boundary", "حدود الحي", "#26634B", "Polygon", 1,
    "Coastal district outline (4.48 km²)", "حدود الحي الساحلي (4.48 كم²)"],
  ["parcels", "Land Parcels", "قطع الأراضي", "#005A96", "Polygon", 2676,
    "Cadastral parcels — 2.69 km², median 750 m²", "القطع المساحية — 2.69 كم²، الوسيط 750 م²"],
  ["buildings", "Buildings", "المباني", "#FD7E14", "Polygon", 1979,
    "Standing buildings, total footprint 634,565 m²", "المباني القائمة، إجمالي البصمة 634,565 م²"],
  ["building_permits", "Building Permits", "تراخيص البناء", "#5505CD", "Point", 1012,
    "Active permits across 48 blocks", "التراخيص النشطة عبر 48 بلوكاً"],
  ["land_use", "Land Use", "استخدام الأراضي", "#0AEBD7", "Polygon", 2676,
    "34 distinct land-use categories", "34 فئة استخدام مختلفة"],
  ["roads", "Roads", "الطرق", "#160F3E", "LineString", 220,
    "128.9 km network, 217 named streets", "شبكة 128.9 كم، 217 شارعاً مسمى"],
  ["street_lights", "Street Lights", "أعمدة الإنارة", "#C8A951", "Point", 1829,
    "14.2 lights/km (below 30–40 benchmark)", "14.2 عمود/كم (أقل من معيار 30-40)"],
  ["pavements", "Pavements", "الأرصفة", "#888888", "LineString", 591,
    "262,277 m² walkable surface", "262,277 م² من الأسطح القابلة للمشي"],
  ["fire_hydrants", "Fire Hydrants", "صنابير الإطفاء", "#AF0818", "Point", 265,
    "1 per 7.5 buildings (NFPA-compliant)", "1 لكل 7.5 مبنى (متوافق مع NFPA)"],
  ["pump_stations", "Pump Stations", "محطات الضخ", "#0066CC", "Point", 4,
    "Operated by GD of Emergencies & Crises", "تشغلها الإدارة العامة للطوارئ والأزمات"],
  ["schools", "Schools", "المدارس", "#7C3AED", "Point", 14,
    "All 14 are private (zero public)", "جميعها 14 مدرسة خاصة (لا توجد حكومية)"],
  ["government_facilities", "Government Facilities", "المرافق الحكومية", "#DC2626", "Point", 20,
    "Courts, civil affairs, utilities admin", "محاكم، أحوال مدنية، إدارة المرافق"],
  ["mosques", "Mosques", "المساجد", "#16A34A", "Point", 23,
    "22 regular + 1 Jami (Friday) mosque", "22 مسجداً عادياً + 1 جامع"],
  ["commercial", "Commercial Establishments", "المنشآت التجارية", "#F59E0B", "Point", 303,
    "Anchored by Al Shati Mall, Lulu, Panda", "مرتكزة على مول الشاطئ، لولو، بندة"],
  ["public_facilities", "Public Facilities", "المرافق العامة", "#06B6D4", "Point", 42,
    "Includes 38 public parking lots", "تشمل 38 موقفاً عاماً للسيارات"],
  ["ad_signs", "Advertising Signs", "اللافتات الإعلانية", "#EAB308", "Point", 69,
    "8 contracts, mostly Gulf & King Abdullah Rd", "8 عقود، معظمها على شارع الخليج والملك عبدالله"],
  ["digging_permits_point", "Digging Permits (Point)", "تصاريح الحفر (نقطية)", "#A855F7", "Point", 136,
    "Localized works 2015–2016 (electricity, FTTH, signals)", "أعمال موضعية 2015-2016 (كهرباء، ألياف، إشارات)"],
  ["digging_permits_linear", "Digging Permits (Linear)", "تصاريح الحفر (خطية)", "#7C3AED", "LineString", 253,
    "15.6 km network upgrades 2022–2023", "ترقيات شبكة بطول 15.6 كم 2022-2023"],
  ["subdivision_plans", "Subdivision Plans", "مخططات التقسيم", "#26634B", "Polygon", 2,
    "Plan 1/337 (1408 AH) and Sh D 908 (1423 AH)", "مخطط 337/1 (1408هـ) و ش د 908 (1423هـ)"],
];
ashLayers.forEach(([k, ne, na, c, g, fc, de, da]) =>
  insertLayer.run(ash, k, ne, na, c, g, fc, de, da),
);

// Multi-city expansion layers (preserve existing demo)
const cityLayers: Array<[string, string, string, string, string, string, number, string, string]> = [
  ["multi-cities", "boundary_2024", "2024 Boundary", "حدود 2024", "#005A96", "Polygon", 6,
    "Previous-year urban boundaries", "حدود عمرانية للعام السابق"],
  ["multi-cities", "boundary_2025", "2025 Boundary", "حدود 2025", "#26634B", "Polygon", 6,
    "Current-year urban boundaries", "حدود عمرانية للعام الحالي"],
  ["multi-cities", "expansion_zones", "Expansion Zones", "مناطق التوسع", "#FD7E14", "Polygon", 6,
    "Computed difference polygons", "مضلعات الفرق المحسوبة"],
];
// We need the multi-cities district to exist as a virtual record so the FK is valid.
insertDistrict.run({
  id: "multi-cities",
  name: "Major Saudi Cities — Urban Expansion",
  name_ar: "المدن السعودية الرئيسية — التوسع العمراني",
  kind: "region",
  parent: "Saudi Arabia",
  municipality: "MOMAH (national)",
  municipality_ar: "وزارة البلديات والإسكان",
  population: cities.reduce((s, c) => s + (c[3] as number), 0),
  area_km2: cities.reduce((s, c) => s + (c[4] as number), 0),
  perimeter_km: null as any,
  center_lat: 24.0,
  center_lng: 44.0,
  data_validated_at: "2025-12-31",
  summary_en: "Year-over-year urban-boundary expansion analysis across 6 major Saudi cities.",
  summary_ar: "تحليل التوسع العمراني السنوي لـ6 مدن سعودية رئيسية.",
});
cityLayers.forEach((l) => insertLayer.run(...l));

// ---------- SYNTHETIC 19-LAYER COVERAGE FOR EVERY CITY + AL-SEH ----------
// Ratios derived from Ash Shati real data (16,380 pop · 4.48 km² · 19 layers).
// Counts here are realistic per-district extrapolations so the GIS map can
// render any district with the same right-sidebar layer toggles.
const RATIOS = {
  PARCELS_PER_KM2:        2676 / 4.48,    // ≈ 597
  BUILDINGS_PER_KM2:      1979 / 4.48,    // ≈ 442
  ROADS_PER_KM2:           220 / 4.48,    // ≈ 49
  ROAD_KM_PER_KM2:        128.9 / 4.48,   // ≈ 28.8
  PERMITS_PER_PARCEL:     1012 / 2676,    // ≈ 0.378
  HYDRANTS_PER_BUILDING:   265 / 1979,    // ≈ 0.134
  STREET_LIGHTS_PER_RDKM: 1829 / 128.9,   // ≈ 14.2
  PAVEMENTS_PER_RDKM:      591 / 128.9,   // ≈ 4.58
  AD_SIGNS_PER_RDKM:        69 / 128.9,   // ≈ 0.535
  DIGGING_PT_PER_KM2:      136 / 4.48,    // ≈ 30.4
  DIGGING_LIN_PER_KM2:     253 / 4.48,    // ≈ 56.5
  SCHOOLS_PER_POP:          14 / 16380,   // ≈ 0.000855 → 1 per 1,170
  MOSQUES_PER_POP:          23 / 16380,   // ≈ 0.001405 → 1 per 712
  GOV_PER_POP:              20 / 16380,   // ≈ 0.001221
  COMMERCIAL_PER_POP:      303 / 16380,   // ≈ 0.0185
  PUBLIC_FAC_PER_POP:       42 / 16380,   // ≈ 0.00256
  PUMPS_PER_POP:             4 / 16380,   // ≈ 0.000244
};

// Layer style guide kept consistent with Ash Shati so the same colors apply
// across districts (right sidebar is visually identical).
const LAYER_TEMPLATES: Array<{
  key: string; en: string; ar: string; color: string; geom: string;
  count: (area: number, pop: number) => number;
  desc_en: string; desc_ar: string;
}> = [
  { key: "district_boundary", en: "District Boundary", ar: "حدود الحي", color: "#26634B", geom: "Polygon",
    count: () => 1,
    desc_en: "Administrative outline", desc_ar: "الحدود الإدارية" },
  { key: "parcels", en: "Land Parcels", ar: "قطع الأراضي", color: "#005A96", geom: "Polygon",
    count: (a) => Math.round(a * RATIOS.PARCELS_PER_KM2),
    desc_en: "Cadastral parcels", desc_ar: "القطع المساحية" },
  { key: "buildings", en: "Buildings", ar: "المباني", color: "#FD7E14", geom: "Polygon",
    count: (a) => Math.round(a * RATIOS.BUILDINGS_PER_KM2),
    desc_en: "Standing building footprints", desc_ar: "بصمات المباني القائمة" },
  { key: "building_permits", en: "Building Permits", ar: "تراخيص البناء", color: "#5505CD", geom: "Point",
    count: (a) => Math.round(a * RATIOS.PARCELS_PER_KM2 * RATIOS.PERMITS_PER_PARCEL),
    desc_en: "Active construction permits", desc_ar: "تراخيص بناء نشطة" },
  { key: "land_use", en: "Land Use", ar: "استخدام الأراضي", color: "#0AEBD7", geom: "Polygon",
    count: (a) => Math.round(a * RATIOS.PARCELS_PER_KM2),
    desc_en: "Land-use classification per parcel", desc_ar: "تصنيف الاستخدام لكل قطعة" },
  { key: "roads", en: "Roads", ar: "الطرق", color: "#160F3E", geom: "LineString",
    count: (a) => Math.round(a * RATIOS.ROADS_PER_KM2),
    desc_en: "Road network segments", desc_ar: "أجزاء شبكة الطرق" },
  { key: "street_lights", en: "Street Lights", ar: "أعمدة الإنارة", color: "#C8A951", geom: "Point",
    count: (a) => Math.round(a * RATIOS.ROAD_KM_PER_KM2 * RATIOS.STREET_LIGHTS_PER_RDKM),
    desc_en: "Lighting poles", desc_ar: "أعمدة الإنارة" },
  { key: "pavements", en: "Pavements", ar: "الأرصفة", color: "#888888", geom: "LineString",
    count: (a) => Math.round(a * RATIOS.ROAD_KM_PER_KM2 * RATIOS.PAVEMENTS_PER_RDKM),
    desc_en: "Pedestrian pavement segments", desc_ar: "أجزاء الأرصفة" },
  { key: "fire_hydrants", en: "Fire Hydrants", ar: "صنابير الإطفاء", color: "#AF0818", geom: "Point",
    count: (a) => Math.round(a * RATIOS.BUILDINGS_PER_KM2 * RATIOS.HYDRANTS_PER_BUILDING),
    desc_en: "Fire-safety hydrants", desc_ar: "صنابير السلامة من الحرائق" },
  { key: "pump_stations", en: "Pump Stations", ar: "محطات الضخ", color: "#0066CC", geom: "Point",
    count: (_a, p) => Math.max(2, Math.round(p * RATIOS.PUMPS_PER_POP)),
    desc_en: "Water-pressure pump stations", desc_ar: "محطات ضخ المياه" },
  { key: "schools", en: "Schools", ar: "المدارس", color: "#7C3AED", geom: "Point",
    count: (_a, p) => Math.round(p * RATIOS.SCHOOLS_PER_POP),
    desc_en: "K-12 educational facilities", desc_ar: "المرافق التعليمية" },
  { key: "government_facilities", en: "Government Facilities", ar: "المرافق الحكومية", color: "#DC2626", geom: "Point",
    count: (_a, p) => Math.round(p * RATIOS.GOV_PER_POP),
    desc_en: "Civil, judicial, utility offices", desc_ar: "المرافق المدنية والقضائية والخدمية" },
  { key: "mosques", en: "Mosques", ar: "المساجد", color: "#16A34A", geom: "Point",
    count: (_a, p) => Math.round(p * RATIOS.MOSQUES_PER_POP),
    desc_en: "Mosques and Jami mosques", desc_ar: "المساجد والجوامع" },
  { key: "commercial", en: "Commercial Establishments", ar: "المنشآت التجارية", color: "#F59E0B", geom: "Point",
    count: (_a, p) => Math.round(p * RATIOS.COMMERCIAL_PER_POP),
    desc_en: "Retail and service businesses", desc_ar: "منشآت التجزئة والخدمات" },
  { key: "public_facilities", en: "Public Facilities", ar: "المرافق العامة", color: "#06B6D4", geom: "Point",
    count: (_a, p) => Math.round(p * RATIOS.PUBLIC_FAC_PER_POP),
    desc_en: "Parking lots, parks, civic spaces", desc_ar: "المواقف، الحدائق، الفضاءات العامة" },
  { key: "ad_signs", en: "Advertising Signs", ar: "اللافتات الإعلانية", color: "#EAB308", geom: "Point",
    count: (a) => Math.round(a * RATIOS.ROAD_KM_PER_KM2 * RATIOS.AD_SIGNS_PER_RDKM),
    desc_en: "Licensed outdoor signs", desc_ar: "اللافتات الخارجية المرخصة" },
  { key: "digging_permits_point", en: "Digging Permits (Point)", ar: "تصاريح الحفر (نقطية)", color: "#A855F7", geom: "Point",
    count: (a) => Math.round(a * RATIOS.DIGGING_PT_PER_KM2),
    desc_en: "Localized excavation permits", desc_ar: "تصاريح حفر موضعية" },
  { key: "digging_permits_linear", en: "Digging Permits (Linear)", ar: "تصاريح الحفر (خطية)", color: "#7C3AED", geom: "LineString",
    count: (a) => Math.round(a * RATIOS.DIGGING_LIN_PER_KM2),
    desc_en: "Linear trench excavation permits", desc_ar: "تصاريح حفر خنادق خطية" },
  { key: "subdivision_plans", en: "Subdivision Plans", ar: "مخططات التقسيم", color: "#26634B", geom: "Polygon",
    count: () => 2,
    desc_en: "Approved master subdivision plans", desc_ar: "مخططات التقسيم المعتمدة" },
];

// Districts that should get the synthetic coverage (everyone except Ash Shati,
// which has real data already, and the multi-cities region wrapper).
const SYNTH_DISTRICTS: Array<[string, number, number]> = [
  // [district_id, area_km2, population]
  ["riyadh",  1945, 7600000],
  ["jeddah",  1268, 4780000],
  ["dammam",   562, 1255211],
  ["makkah",   871, 2042000],
  ["madinah",  638, 1488000],
  ["al-ahsa", 1472, 1300000],
  ["al-seh",  1.31,    2830],
];

for (const [districtId, area, pop] of SYNTH_DISTRICTS) {
  for (const tpl of LAYER_TEMPLATES) {
    insertLayer.run(
      districtId, tpl.key, tpl.en, tpl.ar, tpl.color, tpl.geom,
      tpl.count(area, pop), tpl.desc_en, tpl.desc_ar,
    );
  }
}

// ---------- KEYWORDS (24 trigger words for Beyond Presence avatar mode) ----------
const insertKeyword = db.prepare(
  `INSERT INTO keywords (district_id, trigger_word, response_en, response_ar) VALUES (?, ?, ?, ?)`,
);
const keywords: Array<[string, string, string]> = [
  [
    "district overview",
    "Ash Shati Ash Sharqi is a major coastal district in Dammam, Eastern Province. It has a registered population of 16,380 residents and covers a computed area of 4.48 square kilometers with a perimeter of 12.2 kilometers. The district falls under the Eastern Province Municipality and contains 2,676 land parcels, 1,979 buildings, and a 128.9-kilometer road network across 217 named streets.",
    "الشاطئ الشرقي حي ساحلي رئيسي في الدمام بالمنطقة الشرقية. يبلغ عدد سكانه المسجلين 16,380 نسمة، ومساحته المحسوبة 4.48 كم² بمحيط 12.2 كم. يتبع لأمانة المنطقة الشرقية ويضم 2,676 قطعة أرض، 1,979 مبنى، وشبكة طرق بطول 128.9 كم عبر 217 شارعاً مسمى.",
  ],
  [
    "land use",
    "The district contains 2,676 land parcels across 34 distinct land use categories. Residential dominates with 1,966 parcels. Commercial accounts for 248. Religious facilities including 22 mosques, 1 Jami, and 46 housing units occupy 68 parcels. Educational facilities take 12 parcels, and 37 are designated public parking.",
    "يحتوي الحي على 2,676 قطعة عبر 34 فئة استخدام. السكني هو الغالب بـ1,966 قطعة. التجاري 248 قطعة. المرافق الدينية بما فيها 22 مسجداً وجامع واحد و46 وحدة سكنية تشغل 68 قطعة. المرافق التعليمية 12 قطعة، و37 قطعة مخصصة للمواقف العامة.",
  ],
  [
    "parcels",
    "There are 2,676 land parcels totaling 2.69 km². Median size is 750 m² (min 16, max 30,265). 2,256 parcels (84.3%) are developed, 1,478 hold active licenses, 123 are municipal investments. Critically, 778 parcels (29.1%) are developed but unlicensed — a significant compliance gap.",
    "هناك 2,676 قطعة بإجمالي 2.69 كم². الوسيط 750 م² (الحد الأدنى 16، الأقصى 30,265). 2,256 قطعة (84.3%) مطورة، 1,478 لها تراخيص نشطة، 123 استثمارات بلدية. والأهم أن 778 قطعة (29.1%) مطورة دون تراخيص — فجوة امتثال كبيرة.",
  ],
  [
    "buildings",
    "The district has 1,979 standing buildings with a total footprint of 634,565 m². Median footprint is 216 m², largest is 10,532 m². Data sourced from the General Authority for Survey and Geospatial Information. 1,012 active building permits are tracked across 48 blocks, with Block 40 most active (62 permits).",
    "يضم الحي 1,979 مبنى قائماً ببصمة إجمالية 634,565 م². الوسيط 216 م²، أكبر مبنى 10,532 م². البيانات من الهيئة العامة للمساحة والمعلومات الجيومكانية. 1,012 ترخيص بناء نشط موزع على 48 بلوكاً، الأكثر نشاطاً البلوك 40 بـ62 ترخيصاً.",
  ],
  [
    "permits",
    "There are 1,012 active building permits: 961 residential, 22 commercial, 18 investment, 6 religious, 3 educational, 1 pump station, 1 post office. Areas range 450–14,601 m² (median 890). Peak construction was 1425 AH with 121 permits. All under subdivision plan 337.",
    "1,012 ترخيص بناء نشط: 961 سكني، 22 تجاري، 18 استثماري، 6 ديني، 3 تعليمي، 1 محطة ضخ، 1 بريد. المساحات بين 450-14,601 م² (الوسيط 890). ذروة البناء كانت في 1425هـ بـ121 ترخيصاً. جميعها تحت مخطط 337.",
  ],
  [
    "roads",
    "The district has a 128.9 km road network: 220 segments, 217 uniquely named streets, classified as 194 local, 13 collector, 8 arterial, 4 highway-grade. The three major corridors are Prince Mohammed bin Fahd Road (24.1 km), King Abdullah Road (21.2 km), and Gulf Road (17.8 km).",
    "شبكة طرق بطول 128.9 كم: 220 جزءاً، 217 شارعاً مسمى، مصنفة إلى 194 محلية، 13 ناقلة، 8 شريانية، 4 سريعة. الممرات الثلاثة الرئيسية: طريق الأمير محمد بن فهد (24.1 كم)، طريق الملك عبدالله (21.2 كم)، طريق الخليج (17.8 كم).",
  ],
  [
    "road widths",
    "Road widths span 8 categories: 18 m (125 roads — most common), 8 m (48), 16 m (22), 20 m (12), 25 m (8), 30 m (2), 60 m (2 — widest arterials), and 40 m (1). The 18-meter width is the standard for the local grid.",
    "عرض الطرق على 8 فئات: 18 م (125 طريقاً - الأكثر شيوعاً)، 8 م (48)، 16 م (22)، 20 م (12)، 25 م (8)، 30 م (2)، 60 م (2 - الأعرض)، و40 م (1). عرض 18 م هو المعيار للشبكة المحلية.",
  ],
  [
    "lighting",
    "There are 1,829 street light poles — 14.2 lights/km, 53% below the 30–40/km urban benchmark. Average spacing is 70.5 m vs the 25–30 m recommended. Nearly all lights (1,823) use material code 2.",
    "1,829 عمود إنارة — 14.2 عمود/كم، أقل بنسبة 53% من معيار 30-40 الحضري. متوسط التباعد 70.5 م مقابل 25-30 م الموصى. تقريباً جميع الأعمدة (1,823) من المادة رمز 2.",
  ],
  [
    "schools",
    "The district has 14 educational facilities with total capacity 3,219 students (98.3% of school-age population). Largest is Noor Al-Islam Primary at 418. International programs offered through Al-Bassam complex. Critical finding: 100% of schools are private with zero public options.",
    "14 مرفقاً تعليمياً بسعة 3,219 طالباً (98.3% من السكان في سن الدراسة). الأكبر مدرسة نور الإسلام الابتدائية بـ418. برامج دولية عبر مجمع البسام. الاكتشاف الحرج: 100% من المدارس خاصة وصفر مدارس حكومية.",
  ],
  [
    "government services",
    "20 government facilities including the Administrative Court, Human Rights Commission, North Dammam Civil Defense Center, Civil Affairs Office in Al Shati Mall, Women's Labor Office, Real Estate Development Fund, two Absher kiosks, GD of Water, and Al Shati Power Station No. 2.",
    "20 مرفقاً حكومياً بما فيها المحكمة الإدارية، هيئة حقوق الإنسان، مركز السلامة الميدانية بشمال الدمام، الأحوال المدنية في مول الشاطئ، مكتب العمل النسائي، صندوق التنمية العقارية، جهازا أبشر، الإدارة العامة للمياه، ومحطة الشاطئ للكهرباء رقم 2.",
  ],
  [
    "commercial",
    "303 commercial establishments drive the local economy. Anchors include Al Shati Mall, Lulu Hypermarket, Panda, and Pandati. The sector spans healthcare (Al-Dawaa, Arkestra), dining (Applebee's, Layalina), automotive (SASCO, Petromin), retail (City Max, Twenty4), personal care, and corporate offices like MSC Saudi.",
    "303 منشأة تجارية تقود الاقتصاد المحلي. مراسي رئيسية: مول الشاطئ، لولو، بندة، بنداتي. يغطي القطاع الصحة (الدواء، أوركسترا)، المطاعم (آبلبيز، ليالينا)، السيارات (ساسكو، بتروميـن إكسبرس)، التجزئة (سيتي ماكس، توينتي4)، العناية الشخصية، ومكاتب مثل MSC السعودية.",
  ],
  [
    "fire safety",
    "265 fire hydrants provide a coverage ratio of 1 per 7.5 buildings — within the NFPA standard of 1 per 5–8. Hydrant density is 59.2/km². Civil Defense is present through the North Dammam Field Safety Center.",
    "265 صنبوراً يوفر تغطية بنسبة 1 لكل 7.5 مبنى — ضمن معيار NFPA البالغ 1 لكل 5-8. كثافة الصنابير 59.2/كم². يحضر الدفاع المدني عبر مركز السلامة الميدانية بشمال الدمام.",
  ],
  [
    "infrastructure",
    "Infrastructure includes 1,829 street lights, 591 pavement segments (262,277 m²), 265 fire hydrants, 4 pump stations, and 69 advertising signs under 8 contracts. The municipality manages 389 digging permits covering 15.6 km of trench works by 18 contractors.",
    "البنية التحتية تشمل 1,829 عمود إنارة، 591 جزءاً للأرصفة (262,277 م²)، 265 صنبور إطفاء، 4 محطات ضخ، و69 لافتة إعلانية تحت 8 عقود. تدير البلدية 389 تصريح حفر تغطي 15.6 كم من أعمال الخنادق بواسطة 18 مقاولاً.",
  ],
  [
    "zoning",
    "10 distinct building condition codes. Standard residential (60% coverage, 2 floors, 10 m) applies to 2,188 parcels. Standard commercial (4 floors, 19 m) applies to 121. High-density commercial (10 floors, 40 m) applies to 76. Secondary residential (4 floors, 15.5 m) applies to 91.",
    "10 رموز شروط بناء مختلفة. السكني المعياري (60% تغطية، طابقان، 10 م) ينطبق على 2,188 قطعة. التجاري المعياري (4 طوابق، 19 م) على 121. التجاري عالي الكثافة (10 طوابق، 40 م) على 76. السكني الثانوي (4 طوابق، 15.5 م) على 91.",
  ],
  [
    "planning",
    "Two approved subdivision plans govern the district. Plan 1/337 (1408 AH) covers 7.23 km² north of Corniche Road with strict height & setback rules. Plan Sh D 908 (1423 AH) reorganized 32,869 m² of commercial land owned by Fawaz Al-Hokair & Partners. Four neighborhoods, largest is the Second Neighborhood Third Adjacency (818 parcels).",
    "مخططان معتمدان يحكمان الحي. المخطط 337/1 (1408هـ) يغطي 7.23 كم² شمال طريق الكورنيش بقواعد ارتفاع وارتدادات صارمة. مخطط ش د 908 (1423هـ) أعاد تنظيم 32,869 م² من الأراضي التجارية لشركة فواز الحكير وشركاؤه. أربعة أحياء، الأكبر الحي الثاني المجاورة الثالثة (818 قطعة).",
  ],
  [
    "neighborhoods",
    "The district is organized into four neighborhoods. The Second Neighborhood Third Adjacency has 818 parcels, the Third Neighborhood Fifth Adjacency 698, the First Neighborhood First Adjacency 634, and the Fourth Neighborhood Seventh Adjacency 516.",
    "ينظم الحي إلى أربعة أحياء. الحي الثاني المجاورة الثالثة 818 قطعة، الحي الثالث المجاورة الخامسة 698، الحي الأول المجاورة الأولى 634، والحي الرابع المجاورة السابعة 516.",
  ],
  [
    "digging",
    "389 digging permits: 136 point permits (2015–2016) for electricity, FTTH fiber, and traffic signals; 253 linear trench permits (2022–2023) covering 15.6 km. Most affected streets: King Abdullah Road (20 permits), Street 12D (12), Street 8D (11). Led by Al-Manar Arabian Contracting (94 permits).",
    "389 تصريح حفر: 136 تصريحاً نقطياً (2015-2016) للكهرباء والألياف وإشارات المرور؛ 253 تصريحاً خطياً (2022-2023) يغطي 15.6 كم. الشوارع الأكثر تأثراً: طريق الملك عبدالله (20 تصريحاً)، شارع 12D (12)، شارع 8D (11). يقودها مؤسسة المنار العربية للمقاولات (94 تصريحاً).",
  ],
  [
    "contractors",
    "Linear works are executed by 18 unique contractors. Top five: Al-Manar Arabian Contracting Establishment (94 permits), Alkhorayef Water and Power Technologies (64), Ali Haider Al-Yami Trading and Contracting (19), Esnad Al-Joudah Contracting (15), and Al-Janahin Contracting (10). Most projects last 6–7 days.",
    "تنفذ الأعمال الخطية 18 مقاولاً. الخمسة الأوائل: مؤسسة المنار العربية للمقاولات (94)، الخريف لتقنيات الماء والطاقة (64)، علي حيدر اليامي للتجارة والمقاولات (19)، إسناد الجودة للمقاولات (15)، الجناحين للمقاولات (10). معظم المشاريع تستغرق 6-7 أيام.",
  ],
  [
    "healthcare",
    "Critical gap. WHO requires at least 1.5 primary health centers for 16,380 residents. The GIS data reveals zero primary care centers. The only healthcare assets are one parcel zoned for a general hospital and three commercial pharmacies (Al-Dawaa with 2 branches, Arkestra).",
    "فجوة حرجة. تتطلب منظمة الصحة العالمية ما لا يقل عن 1.5 مركز صحي أولي لـ16,380 نسمة. تكشف البيانات صفر مركز رعاية أولية. الأصول الصحية الوحيدة: قطعة لمستشفى عام وثلاث صيدليات تجارية (الدواء بفرعين، أوركسترا).",
  ],
  [
    "parks",
    "Severe green-space deficit. Only 2 small parcels are designated as parks/recreational areas. WHO recommends 9 m² per capita = 147,420 m² required for this district. The current provision falls drastically short for a 4.48 km² coastal district.",
    "نقص حاد في المساحات الخضراء. فقط قطعتان صغيرتان مخصصتان كحدائق/مناطق ترفيهية. توصي منظمة الصحة العالمية بـ9 م² لكل فرد = 147,420 م² مطلوب. التوفير الحالي بعيد جداً عن المعيار لحي ساحلي بمساحة 4.48 كم².",
  ],
  [
    "mosques",
    "23 mosques (22 regular + 1 Jami). The ratio of 1 per 712 residents is within the Saudi 500–800 benchmark. However, only 1 Jami mosque exists where 2–3 are typically required for Friday prayer capacity at this population size.",
    "23 مسجداً (22 عادياً + 1 جامع). نسبة 1 لكل 712 نسمة ضمن المعيار السعودي 500-800. لكن جامع واحد فقط حيث يلزم عادة 2-3 جوامع لاستيعاب صلاة الجمعة لهذا الحجم السكاني.",
  ],
  [
    "parking",
    "Out of 42 public facilities, 38 are designated parking lots. With 303 commercial establishments, this is only 0.13 lots per business (1 lot per 8 businesses) — a severe imbalance likely causing congestion and illegal street parking.",
    "من بين 42 مرفقاً عاماً، 38 مخصصة للمواقف. مع 303 منشأة تجارية، هذا فقط 0.13 موقف لكل منشأة (1 موقف لكل 8 منشآت) — اختلال شديد يسبب على الأرجح ازدحاماً ووقوفاً غير نظامي.",
  ],
  [
    "population",
    "16,380 residents within the broader Dammam municipality of 1,255,211. Density is 3,657 per km². 4,234 units serve the population at 3.9 persons per unit. Most parcels contain duplex-style two-unit configurations.",
    "16,380 نسمة ضمن أمانة الدمام الأكبر التي تضم 1,255,211. الكثافة 3,657 لكل كم². 4,234 وحدة تخدم السكان بمتوسط 3.9 أشخاص لكل وحدة. معظم القطع تحتوي وحدتين بنمط الفيلا المزدوجة.",
  ],
  [
    "value",
    "This digital GIS capability transforms raw geodatabase queries into instant strategic insights. In seconds I identified 778 unlicensed parcels, 100% private schools, lighting 53% below standard, and zero healthcare facilities. This model can be replicated across all 17 Amanas nationwide.",
    "هذه القدرة الرقمية للنظم الجغرافية تحول استعلامات قاعدة البيانات الخام إلى رؤى استراتيجية فورية. خلال ثوانٍ حددت 778 قطعة غير مرخصة، 100% مدارس خاصة، إنارة أقل بـ53% من المعيار، وصفر مرافق صحية. يمكن تكرار هذا النموذج عبر جميع الأمانات الـ17.",
  ],
];
keywords.forEach(([w, en, ar]) => insertKeyword.run(ash, w, en, ar));

// ---------- Q&A BANK (43 questions across 10 categories) ----------
const insertQa = db.prepare(`
  INSERT INTO qa_bank (district_id, category, position, question_en, question_ar, answer_en, answer_ar)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const qa: Array<[string, number, string, string, string, string]> = [
  // Category 1 — District Overview & Administration
  ["District Overview", 1,
    "What district are we currently analyzing?",
    "ما الحي الذي نحلله حالياً؟",
    "We are viewing the geospatial data for Ash Shati Ash Sharqi (الشاطئ الشرقي) in Dammam, Eastern Province. Municipal code 00500001062, population 16,380, area 4.48 km², perimeter 12.2 km.",
    "نعرض البيانات الجغرافية لحي الشاطئ الشرقي في الدمام، المنطقة الشرقية. الرمز البلدي 00500001062، السكان 16,380، المساحة 4.48 كم²، المحيط 12.2 كم."],
  ["District Overview", 2,
    "Who is responsible for maintaining this data?",
    "من المسؤول عن صيانة هذه البيانات؟",
    "The Eastern Province Municipality (Amana) through its GIS department (FME) owns and maintains the data. Building footprints come from the General Authority for Survey and Geospatial Information (GCS); roads come from the Municipal Digital Transformation Center. Latest validation: April 2026.",
    "أمانة المنطقة الشرقية تملك وتصون البيانات عبر إدارة النظم الجغرافية (FME). بصمات المباني من الهيئة العامة للمساحة (GCS)؛ الطرق من مركز التحول الرقمي البلدي. آخر تحقق: أبريل 2026."],
  ["District Overview", 3,
    "What is the population of this district?",
    "ما عدد سكان هذا الحي؟",
    "16,380 residents — about 1.3% of the broader Dammam municipality (1,255,211). Population density is 3,657/km², within the typical Saudi urban range of 3,000–8,000.",
    "16,380 نسمة — حوالي 1.3% من أمانة الدمام الأكبر (1,255,211). الكثافة السكانية 3,657/كم²، ضمن النطاق السعودي الحضري المعتاد 3,000-8,000."],
  ["District Overview", 4,
    "How is the district organized internally?",
    "كيف يُنظَّم الحي داخلياً؟",
    "Four neighborhoods: Second Neighborhood Third Adjacency (818 parcels), Third Neighborhood Fifth Adjacency (698), First Neighborhood First Adjacency (634), Fourth Neighborhood Seventh Adjacency (516).",
    "أربعة أحياء: الحي الثاني المجاورة الثالثة (818 قطعة)، الحي الثالث المجاورة الخامسة (698)، الحي الأول المجاورة الأولى (634)، الحي الرابع المجاورة السابعة (516)."],
  // Category 2 — Urban Planning & Zoning
  ["Urban Planning", 5,
    "What are the main subdivision plans governing this district?",
    "ما المخططات الرئيسية الحاكمة للحي؟",
    "Two master plans. Plan 1/337 (1408 AH, 7.23 km² north of Corniche Road) and Plan Sh D 908 (1423 AH, 32,869 m² commercial section owned by Fawaz Al-Hokair).",
    "مخططان رئيسيان. المخطط 337/1 (1408هـ، 7.23 كم² شمال الكورنيش) ومخطط ش د 908 (1423هـ، 32,869 م² تجارية مملوكة لفواز الحكير)."],
  ["Urban Planning", 6,
    "What are the building height and setback regulations?",
    "ما هي اللوائح المتعلقة بالارتفاعات والارتدادات؟",
    "Plan 1/337 mandates 8 m max height, 1 m street setback, 5 m side setback. Specific parcels override: high-density commercial (ت-10) allows 10 floors / 40 m / 50% coverage; standard commercial (ت-1أ) allows 4 floors / 19 m.",
    "المخطط 337/1 يفرض ارتفاع أقصى 8 م، ارتداد شارع 1 م، ارتداد جانبي 5 م. تتجاوزه قطع محددة: التجاري عالي الكثافة (ت-10) يسمح بـ10 طوابق / 40 م / 50% تغطية؛ التجاري المعياري (ت-1أ) يسمح بـ4 طوابق / 19 م."],
  ["Urban Planning", 7,
    "How many different zoning condition types exist?",
    "كم عدد رموز شروط البناء المختلفة؟",
    "10 distinct codes. Most common: س-1أ standard residential (2,188 parcels), ت-1أ standard commercial (121), س-2أ secondary residential (91), خ special (84), ت-10 high-density commercial (76), م mixed (53), ت-خ special commercial (33), ت-2 low-density commercial (24), ح (3), ت-م (2).",
    "10 رموز مختلفة. الأكثر شيوعاً: س-1أ سكني معياري (2,188 قطعة)، ت-1أ تجاري معياري (121)، س-2أ سكني ثانوي (91)، خ خاص (84)، ت-10 تجاري عالي الكثافة (76)، م مختلط (53)، ت-خ تجاري خاص (33)، ت-2 تجاري منخفض الكثافة (24)، ح (3)، ت-م (2)."],
  ["Urban Planning", 8,
    "What does the standard residential zoning allow?",
    "ماذا يسمح به التصنيف السكني المعياري؟",
    "Condition س-1أ applies to 2,188 parcels (the residential core): 60% lot coverage, max 2 floors, max 10 m height.",
    "الشرط س-1أ ينطبق على 2,188 قطعة (النواة السكنية): 60% تغطية، طابقان كحد أقصى، ارتفاع أقصى 10 م."],
  // Category 3 — Land Parcels & Real Estate
  ["Land Parcels", 9,
    "How many land parcels exist and what's their size distribution?",
    "كم عدد قطع الأراضي وما توزيع أحجامها؟",
    "2,676 parcels covering 2.69 km². Median 750 m², mean 1,005 m², min 16 m² (utility rooms), max 30,265 m² (major facilities). Std dev 1,397.8 m².",
    "2,676 قطعة تغطي 2.69 كم². الوسيط 750 م²، المتوسط 1,005 م²، الحد الأدنى 16 م² (غرف خدمات)، الأقصى 30,265 م² (مرافق كبرى). الانحراف المعياري 1,397.8 م²."],
  ["Land Parcels", 10,
    "What is the development and licensing status?",
    "ما حالة التطوير والترخيص؟",
    "2,256 parcels (84.3%) developed, 420 undeveloped. 1,478 hold active licenses, 123 are municipal investments. Critically: 778 parcels (29.1%) are developed without licenses — major compliance gap.",
    "2,256 قطعة (84.3%) مطورة، 420 غير مطورة. 1,478 لها تراخيص نشطة، 123 استثمارات بلدية. والأهم: 778 قطعة (29.1%) مطورة دون تراخيص — فجوة امتثال كبيرة."],
  ["Land Parcels", 11,
    "Can you break down land use by category?",
    "هل يمكنك تفصيل الاستخدام حسب الفئة؟",
    "Residential (100000): 2,280 parcels. Commercial (200000): 254. Public/government (300000): 89. Utilities/infrastructure (400000): 53.",
    "السكني (100000): 2,280 قطعة. التجاري (200000): 254. العام/الحكومي (300000): 89. المرافق/البنية التحتية (400000): 53."],
  ["Land Parcels", 12,
    "What other land use types exist?",
    "ما الاستخدامات الأخرى الموجودة؟",
    "34 categories total. Beyond residential and commercial: 22 mosques, 1 Jami, 23 Imam + 23 Muezzin housing, 37 parking lots, 6 boys schools, 5 girls schools, 4 water wells, 2 pump stations, 2 electrical rooms, 1 kindergarten, 2 parks, 1 fuel station, 1 post office, 1 civil defense, 1 hospital, 1 telephone exchange, 1 municipal branch.",
    "34 فئة إجمالاً. ما عدا السكني والتجاري: 22 مسجداً، جامع واحد، 23 مسكن إمام و23 مسكن مؤذن، 37 موقفاً، 6 مدارس بنين، 5 بنات، 4 آبار مياه، محطتا ضخ، غرفتا كهرباء، روضة، حديقتان، محطة وقود، مكتب بريد، دفاع مدني، مستشفى، سنترال، فرع بلدي."],
  ["Land Parcels", 13,
    "How many residential units are there?",
    "كم عدد الوحدات السكنية؟",
    "4,234 registered units. 1,524 parcels contain 2 units (duplexes), 556 contain 1 unit (villas), 105 contain 6 units (small apartment buildings). ~3.9 persons/unit.",
    "4,234 وحدة مسجلة. 1,524 قطعة تضم وحدتين (دوبلكس)، 556 وحدة واحدة (فلل)، 105 ست وحدات (مبانٍ شقق صغيرة). حوالي 3.9 أشخاص/وحدة."],
  // Category 4 — Buildings & Construction
  ["Buildings & Permits", 14,
    "How many physical buildings exist?",
    "كم عدد المباني الفعلية؟",
    "1,979 buildings totaling 634,565 m² footprint. Median 216.2 m², mean 320.6 m², min 75.8 m², max 10,532 m².",
    "1,979 مبنى بإجمالي بصمة 634,565 م². الوسيط 216.2 م²، المتوسط 320.6 م²، الأدنى 75.8 م²، الأقصى 10,532 م²."],
  ["Buildings & Permits", 15,
    "What types of building permits have been issued?",
    "ما أنواع تراخيص البناء الصادرة؟",
    "1,012 active permits: 961 residential (95%), 22 commercial, 18 investment, 6 religious, 3 educational, 1 pump station, 1 post office. All under subdivision plan 337.",
    "1,012 ترخيص نشط: 961 سكني (95%)، 22 تجاري، 18 استثماري، 6 ديني، 3 تعليمي، 1 محطة ضخ، 1 بريد. جميعها تحت مخطط 337."],
  ["Buildings & Permits", 16,
    "Which blocks have the most construction activity?",
    "ما البلوكات الأكثر نشاطاً في البناء؟",
    "48 unique blocks. Most active: Block 40 (62 permits), 35 (47), 5 (44), 6 (42), 30 (37), 16 (34), 29 (33), 27 (33).",
    "48 بلوكاً. الأكثر نشاطاً: بلوك 40 (62)، 35 (47)، 5 (44)، 6 (42)، 30 (37)، 16 (34)، 29 (33)، 27 (33)."],
  ["Buildings & Permits", 17,
    "What's the historical pattern of permits?",
    "ما النمط التاريخي للتراخيص؟",
    "Peak in 1425 AH (121 permits), 1424 (99), 1423 (93), 1422 (71), 1426 (70), 1431 (66). Primary boom 1420–1432 AH with secondary wave around 1431–1432.",
    "الذروة 1425هـ (121 ترخيصاً)، 1424 (99)، 1423 (93)، 1422 (71)، 1426 (70)، 1431 (66). الازدهار الرئيسي 1420-1432هـ بموجة ثانوية حوالي 1431-1432."],
  ["Buildings & Permits", 18,
    "What are typical permit areas?",
    "ما المساحات النموذجية للتراخيص؟",
    "Range 450–14,601 m², mean 992 m², median 890 m², std dev 791 m². Most are standard residential plots; outliers represent large commercial/institutional projects.",
    "النطاق 450-14,601 م²، المتوسط 992 م²، الوسيط 890 م²، الانحراف المعياري 791 م². معظمها قطع سكنية معيارية؛ الاستثناءات لمشاريع تجارية/مؤسسية كبرى."],
  // Category 5 — Roads & Transport
  ["Roads & Transport", 19,
    "Describe the road network in detail.",
    "صف شبكة الطرق بالتفصيل.",
    "128.9 km network, 220 segments, 217 named streets, average segment 586 m. Maintained by the Municipal Digital Transformation Center.",
    "شبكة 128.9 كم، 220 جزءاً، 217 شارعاً مسمى، متوسط الجزء 586 م. يصونها مركز التحول الرقمي البلدي."],
  ["Roads & Transport", 20,
    "What are the road width categories?",
    "ما فئات عرض الطرق؟",
    "8 categories: 18 m (125 — most common), 8 m (48), 16 m (22), 20 m (12), 25 m (8), 30 m (2), 60 m (2), 40 m (1).",
    "8 فئات: 18 م (125 - الأشيع)، 8 م (48)، 16 م (22)، 20 م (12)، 25 م (8)، 30 م (2)، 60 م (2)، 40 م (1)."],
  ["Roads & Transport", 21,
    "How are roads classified by type?",
    "كيف تُصنف الطرق حسب النوع؟",
    "Type 7 Local (194, 88%), Type 6 Collector (13), Type 5 Arterial (8), Type 2 Highway (4), Type 4 (1).",
    "النوع 7 محلي (194، 88%)، النوع 6 ناقل (13)، النوع 5 شرياني (8)، النوع 2 سريع (4)، النوع 4 (1)."],
  ["Roads & Transport", 22,
    "What are the three longest roads?",
    "ما أطول ثلاثة طرق؟",
    "Prince Mohammed bin Fahd Road (24.1 km), King Abdullah bin Abdulaziz Road (21.2 km), Al Khaleej Gulf Road (17.8 km). Other notable: Al Marjan (2.6), Al Yaqout (2.0), Kaab bin Jammaz (1.8).",
    "طريق الأمير محمد بن فهد (24.1 كم)، الملك عبدالله بن عبدالعزيز (21.2 كم)، الخليج (17.8 كم). أخرى بارزة: المرجان (2.6)، الياقوت (2.0)، كعب بن جماز (1.8)."],
  ["Roads & Transport", 23,
    "How adequate is street lighting?",
    "ما مدى كفاية الإنارة؟",
    "1,829 poles = 14.2/km, 53% below the 30–40 urban benchmark. Average spacing 70.5 m vs 25–30 m recommended. Almost all use material code 2.",
    "1,829 عموداً = 14.2/كم، 53% دون معيار 30-40 الحضري. متوسط التباعد 70.5 م مقابل 25-30 م الموصى. تقريباً جميعها من المادة رمز 2."],
  ["Roads & Transport", 24,
    "What is the pedestrian pavement situation?",
    "ما وضع الأرصفة؟",
    "591 pavement segments, 262,277 m² walkable surface, average 443.8 m² per segment. 520 segments single-path, 32 two-path, 18 three-path, 13 four-path, some with up to 18 paths.",
    "591 جزءاً للأرصفة، 262,277 م² سطح قابل للمشي، متوسط 443.8 م² لكل جزء. 520 جزءاً بمسار واحد، 32 بمسارين، 18 بثلاثة، 13 بأربعة، بعضها حتى 18 مساراً."],
  ["Roads & Transport", 25,
    "Tell me about the advertising signs.",
    "أخبرني عن اللافتات الإعلانية.",
    "69 licensed signs under 8 contracts, mostly along Gulf Road (19) and King Abdullah Road (16). Largest contract 37/32 covers 20 signs. Heights range 0.57 m (10 signs) to 6 m (2). 2 m is the second most common (8 signs).",
    "69 لافتة مرخصة تحت 8 عقود، معظمها على طريق الخليج (19) والملك عبدالله (16). أكبر عقد 37/32 يغطي 20 لافتة. الارتفاعات بين 0.57 م (10 لافتات) و6 م (2). 2 م ثاني الأكثر شيوعاً (8 لافتات)."],
  // Category 6 — Utilities, Safety, Excavation
  ["Utilities & Safety", 26,
    "What is the fire hydrant coverage?",
    "ما تغطية صنابير الإطفاء؟",
    "265 hydrants, 1 per 7.5 buildings — within the NFPA 1-per-5-to-8 standard. Density 59.2/km².",
    "265 صنبوراً، 1 لكل 7.5 مبنى — ضمن معيار NFPA 1 لكل 5-8. الكثافة 59.2/كم²."],
  ["Utilities & Safety", 27,
    "How many pump stations serve the district?",
    "كم محطة ضخ تخدم الحي؟",
    "4 major municipal pump stations operated by the GD of Emergencies & Crises (2 standard, 2 building type), strategically distributed.",
    "4 محطات ضخ رئيسية تشغلها الإدارة العامة للطوارئ والأزمات (2 معيارية، 2 من نوع المبنى)، موزعة استراتيجياً."],
  ["Utilities & Safety", 28,
    "What types of excavation works have been done?",
    "ما أنواع أعمال الحفر التي تمت؟",
    "389 digging permits split into 136 point (2015–2016: electricity 13, subscriber 12, cable 12, low-voltage 9, FTTH 4, signals 3) and 253 linear trench (2022–2023: 15.6 km, 178 Central Dammam, 75 East Dammam).",
    "389 تصريح حفر مقسمة 136 نقطية (2015-2016: كهرباء 13، مشتركون 12، كابلات 12، جهد منخفض 9، ألياف FTTH 4، إشارات 3) و253 خطية (2022-2023: 15.6 كم، 178 وسط الدمام، 75 شرقها)."],
  ["Utilities & Safety", 29,
    "Which contractors perform infrastructure works?",
    "من المقاولون المنفذون لأعمال البنية التحتية؟",
    "18 unique contractors lead by Al-Manar Arabian Contracting (94 permits), Alkhorayef Water and Power (64), Ali Haider Al-Yami (19), Esnad Al-Joudah (15), Al-Janahin (10). Most projects 6–7 days.",
    "18 مقاولاً يقودهم المنار العربية للمقاولات (94)، الخريف للماء والطاقة (64)، علي حيدر اليامي (19)، إسناد الجودة (15)، الجناحين (10). معظم المشاريع 6-7 أيام."],
  ["Utilities & Safety", 30,
    "Which streets are most affected by recent works?",
    "ما الشوارع الأكثر تأثراً بالأعمال الأخيرة؟",
    "King Abdullah Road (20 permits), Street 12D (12), Street 8D (11), Street 8B (9), Street 12H (7), Kaab bin Jammaz Street (7).",
    "طريق الملك عبدالله (20 تصريحاً)، شارع 12D (12)، شارع 8D (11)، شارع 8B (9)، شارع 12H (7)، شارع كعب بن جماز (7)."],
  // Category 7 — Education
  ["Education", 31,
    "How many schools are in the district?",
    "كم عدد المدارس في الحي؟",
    "14 registered facilities covering KG–secondary, all under the General Administration of Education in the Eastern Province.",
    "14 مرفقاً مسجلاً تغطي رياض الأطفال حتى الثانوي، جميعها تحت الإدارة العامة للتعليم بالمنطقة الشرقية."],
  ["Education", 32,
    "Are the schools sufficient for the population?",
    "هل المدارس كافية للسكان؟",
    "Capacity 3,219 covers 98.3% of school-age population (3,276 = 20% of total). Ratio 1 school per 1,170 residents — within the international 1-per-1,000-to-1,500 benchmark. But 100% are private; zero public schools.",
    "السعة 3,219 تغطي 98.3% من السكان في سن الدراسة (3,276 = 20% من الإجمالي). نسبة 1 مدرسة لكل 1,170 نسمة — ضمن المعيار الدولي 1 لكل 1,000-1,500. لكن 100% خاصة؛ صفر حكومية."],
  ["Education", 33,
    "What are the largest schools by capacity?",
    "ما أكبر المدارس بحسب السعة؟",
    "Noor Al-Islam Primary (418), Noor Al-Islam Intermediate (396), Al-Bassam Primary (375), Noor Al-Islam Secondary (355), Al-Nukhba Secondary (350).",
    "نور الإسلام الابتدائية (418)، نور الإسلام المتوسطة (396)، البسام الابتدائية (375)، نور الإسلام الثانوية (355)، النخبة الثانوية (350)."],
  ["Education", 34,
    "Are there international program schools?",
    "هل توجد مدارس برامج دولية؟",
    "Yes — Al-Bassam complex offers International Programs across all stages: Primary 250, Intermediate 160, Secondary 80.",
    "نعم — مجمع البسام يقدم برامج دولية عبر جميع المراحل: ابتدائي 250، متوسط 160، ثانوي 80."],
  ["Education", 35,
    "Are there kindergartens?",
    "هل توجد روضات أطفال؟",
    "Yes — Al-Hussan Model Kindergarten and Primary School for Girls provides early-childhood education.",
    "نعم — مدارس الحصان الأهلية النموذجية للبنات تقدم تعليماً للطفولة المبكرة."],
  // Category 8 — Government, Civic, Religious
  ["Government & Civic", 36,
    "What government services are available?",
    "ما الخدمات الحكومية المتاحة؟",
    "20 facilities including the Administrative Court, Human Rights Commission, North Dammam Civil Defense Center, Civil Affairs in Al Shati Mall, Women's Labor Office, Real Estate Development Fund (Dammam branch), 2 Absher kiosks, GD of Water, Al Shati Power Station No. 2.",
    "20 مرفقاً تشمل المحكمة الإدارية، هيئة حقوق الإنسان، مركز السلامة الميدانية بشمال الدمام، الأحوال المدنية في مول الشاطئ، مكتب العمل النسائي، صندوق التنمية العقارية (فرع الدمام)، جهازي أبشر، الإدارة العامة للمياه، محطة الشاطئ للكهرباء رقم 2."],
  ["Government & Civic", 37,
    "How many mosques are there, and is coverage adequate?",
    "كم عدد المساجد، وهل التغطية كافية؟",
    "23 mosques (22 regular + 1 Jami) at 1 per 712 residents — within the Saudi 1-per-500-to-800 benchmark. But the single Jami mosque is insufficient; 2–3 are typically required for this population size.",
    "23 مسجداً (22 عادياً + 1 جامع) بنسبة 1 لكل 712 نسمة — ضمن المعيار السعودي 1 لكل 500-800. لكن الجامع الواحد غير كافٍ؛ يلزم عادة 2-3 لهذا الحجم السكاني."],
  ["Government & Civic", 38,
    "How many public parking lots exist?",
    "كم موقفاً عاماً للسيارات؟",
    "Of 42 public facilities, 38 are parking lots — but only 0.13 lots per commercial business (303 total). Significant shortage.",
    "من بين 42 مرفقاً عاماً، 38 مواقف — لكن فقط 0.13 موقف لكل منشأة تجارية (303 إجمالاً). نقص كبير."],
  // Category 9 — Healthcare & Green Spaces
  ["Healthcare & Parks", 39,
    "What healthcare facilities exist?",
    "ما المرافق الصحية الموجودة؟",
    "Critical gap. Zero primary health centers/clinics. Only one parcel zoned for a general hospital and three commercial pharmacies (Al-Dawaa with 2 branches, Arkestra). WHO requires 1.5 centers for 16,380 residents.",
    "فجوة حرجة. صفر مركز صحي أولي/عيادة. فقط قطعة لمستشفى عام وثلاث صيدليات تجارية (الدواء بفرعين، أوركسترا). تتطلب منظمة الصحة العالمية 1.5 مركز لـ16,380 نسمة."],
  ["Healthcare & Parks", 40,
    "What parks and green spaces are available?",
    "ما الحدائق والمساحات الخضراء المتاحة؟",
    "Severe deficit. Only 2 small parcels: one park with playground, one garden. WHO recommends 9 m² per capita (147,420 m² required); current provision falls drastically short.",
    "نقص حاد. فقط قطعتان صغيرتان: حديقة بملعب وحديقة عامة. توصي منظمة الصحة العالمية بـ9 م² لكل فرد (147,420 م² مطلوب)؛ التوفير الحالي بعيد جداً عن المعيار."],
  // Category 10 — Agent Capability
  ["Agent Capability", 41,
    "How detailed is the data you analyze?",
    "ما مدى تفصيل البيانات التي تحللها؟",
    "I analyze 19 distinct geospatial layers containing 9,416 features. I can drill from district-level KPIs down to individual parcel size, advertising-sign height on a specific street, contractor name on a specific trench, or Hijri permit year in a specific block.",
    "أحلل 19 طبقة جغرافية مختلفة تحتوي 9,416 معلماً. أستطيع التنقل من مؤشرات على مستوى الحي إلى حجم قطعة بعينها، ارتفاع لافتة على شارع محدد، اسم مقاول لخندق محدد، أو السنة الهجرية لترخيص في بلوك محدد."],
  ["Agent Capability", 42,
    "Can you apply this to other districts?",
    "هل يمكن تطبيق هذا على أحياء أخرى؟",
    "Yes. While this demo focuses on Ash Shati Ash Sharqi, my underlying architecture instantly processes standard GIS geodatabases from any of the 17 Amanas across Saudi Arabia.",
    "نعم. بينما يركز هذا العرض على الشاطئ الشرقي، تقوم بنيتي الأساسية بمعالجة قواعد البيانات الجغرافية المعيارية فورياً لأي من الأمانات الـ17 في السعودية."],
  ["Agent Capability", 43,
    "What insights can you generate that a manual analyst cannot?",
    "ما الرؤى التي يمكنك توليدها ولا يستطيعها محلل يدوي؟",
    "Cross-layer analysis at speed. I instantly identified 778 unlicensed parcels, 100% private schools, lighting 53% below benchmark, and zero healthcare facilities for 16,380 residents. A manual GIS analyst would need days to cross-reference 19 layers and compile such findings.",
    "تحليل متعدد الطبقات بسرعة. حددت فوراً 778 قطعة غير مرخصة، 100% مدارس خاصة، إنارة أقل بـ53% من المعيار، وصفر مرافق صحية لـ16,380 نسمة. محلل يدوي يحتاج أياماً لمراجعة 19 طبقة وتجميع مثل هذه النتائج."],
];
qa.forEach(([cat, pos, qe, qa_, ae, aa]) =>
  insertQa.run(ash, cat, pos, qe, qa_, ae, aa),
);

// ---------- REPORTS ----------
// Empty by design — reports are produced on demand via POST /api/reports/generate.

// ---------- MULTI-CITY STATS (preserves existing demo) ----------
const insertCity = db.prepare(`
  INSERT INTO multi_city_stats (name, name_ar, area_2024, area_2025, expansion, growth_pct, center_lat, center_lng)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const multiCities: Array<[string, string, number, number, number, number, number, number]> = [
  ["Riyadh", "الرياض", 1890, 1945, 55, 2.91, 24.7136, 46.6753],
  ["Jeddah", "جدة", 1230, 1268, 38, 3.09, 21.4858, 39.1925],
  ["Dammam", "الدمام", 540, 562, 22, 4.07, 26.3927, 49.9777],
  ["Makkah", "مكة المكرمة", 850, 871, 21, 2.47, 21.3891, 39.8579],
  ["Madinah", "المدينة المنورة", 620, 638, 18, 2.9, 24.4539, 39.6142],
  ["Al-Ahsa", "الأحساء", 1420, 1472, 52, 3.66, 25.3647, 49.5879],
];
multiCities.forEach((c) => insertCity.run(...c));

// ---------- SUB-AREAS (preserves Al-Seh detail) ----------
const insertSub = db.prepare(`
  INSERT INTO sub_areas VALUES (
    @name, @name_ar, @parent, @baseline_year, @current_year,
    @pop_baseline, @pop_current, @pop_growth_pct,
    @res_ha_baseline, @res_ha_current, @res_ha_growth,
    @vac_ha_baseline, @vac_ha_current, @vac_ha_growth,
    @density_baseline, @density_current, @density_growth,
    @rec_direction, @rec_direction_ar, @rec_hectares, @rec_confidence,
    @plan_name_en, @plan_name_ar, @plan_number,
    @municipality_en, @municipality_ar, @report_url
  )
`);
insertSub.run({
  name: "Al-Seh",
  name_ar: "السيح",
  parent: "Al-Ahsa",
  baseline_year: 2020,
  current_year: 2025,
  pop_baseline: 895, pop_current: 2830, pop_growth_pct: 216.20,
  res_ha_baseline: 70, res_ha_current: 108, res_ha_growth: 54.29,
  vac_ha_baseline: 22, vac_ha_current: 23, vac_ha_growth: 4.55,
  density_baseline: 9.73, density_current: 21.60, density_growth: 122.06,
  rec_direction: "West", rec_direction_ar: "غرباً", rec_hectares: 15, rec_confidence: "Moderate",
  plan_name_en: "Al-Seh Hijra Plan", plan_name_ar: "تخطيط هجرة السيح", plan_number: "4/646",
  municipality_en: "Al-Jafr", municipality_ar: "الجفر",
  report_url: "/reports/al-seh-urban-expansion.pdf",
});

console.log(`[seed] Done at ${now()}.`);
console.log(`        users:     ${db.prepare("SELECT COUNT(*) c FROM users").get()}`);
console.log(`        districts: ${db.prepare("SELECT COUNT(*) c FROM districts").get()}`);
console.log(`        kpis:      ${db.prepare("SELECT COUNT(*) c FROM district_kpis").get()}`);
console.log(`        insights:  ${db.prepare("SELECT COUNT(*) c FROM insights").get()}`);
console.log(`        layers:    ${db.prepare("SELECT COUNT(*) c FROM gis_layers").get()}`);
console.log(`        keywords:  ${db.prepare("SELECT COUNT(*) c FROM keywords").get()}`);
console.log(`        qa_bank:   ${db.prepare("SELECT COUNT(*) c FROM qa_bank").get()}`);
console.log(`        reports:   ${db.prepare("SELECT COUNT(*) c FROM reports").get()}`);
console.log(`        cities:    ${db.prepare("SELECT COUNT(*) c FROM multi_city_stats").get()}`);
console.log(`        sub_areas: ${db.prepare("SELECT COUNT(*) c FROM sub_areas").get()}`);
