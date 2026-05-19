import type { Finding, AssetPoint } from "../types";
import { getZone } from "./corridor";

// Helper to compute lat/lng slightly offset from a zone center
function jitterFromZone(zoneId: number, dx: number, dy: number) {
  const z = getZone(zoneId)!;
  return {
    lat: z.centerLat + dy,
    lng: z.centerLng + dx,
  };
}

// =====================================================================
// ZONE 8 — Port stretch (Phase 1, sub-stretch "port")
// Heavy workshop & warehouse belt; concrete barriers degraded;
// asphalt deterioration from heavy trucks
// =====================================================================
const Z8_FINDINGS: Finding[] = [
  {
    id: "F-Z8-001",
    zoneId: 8,
    activityType: "development",
    category: "illegal_workshops",
    title: {
      en: "Demolish 14 unlicensed workshops north of carriageway",
      ar: "هدم 14 ورشة غير مرخصة شمال المسار",
    },
    description: {
      en: "Cluster of mechanical and bodywork shops operating without commercial licenses, encroaching on the right-of-way.",
      ar: "تجمع لورش ميكانيكية وسمكرة تعمل بدون تراخيص تجارية، وتعتدي على حرم الطريق.",
    },
    contractorId: "arc",
    status: "in_progress",
    openedOn: "2026-02-12",
    targetDate: "2026-08-15",
    severity: "high",
    budgetSAR: 4_200_000,
    spentSAR: 1_580_000,
    beforePhoto: "/photos/z8/workshops-before.jpg",
  },
  {
    id: "F-Z8-002",
    zoneId: 8,
    activityType: "development",
    category: "barriers_damaged",
    title: {
      en: "Replace 1.2 km of damaged concrete barriers (median)",
      ar: "استبدال 1.2 كم من الحواجز الخرسانية المتهالكة (الجزيرة الوسطية)",
    },
    description: {
      en: "Median barriers cracked from repeated heavy-vehicle impact; structural concern flagged.",
      ar: "حواجز الجزيرة الوسطية متشققة من اصطدامات متكررة للمركبات الثقيلة؛ تم رصد قلق إنشائي.",
    },
    contractorId: "arc",
    status: "open",
    openedOn: "2026-03-04",
    targetDate: "2026-12-01",
    severity: "high",
    budgetSAR: 6_800_000,
    spentSAR: 0,
  },
  {
    id: "F-Z8-003",
    zoneId: 8,
    activityType: "development",
    category: "asphalt_digging",
    title: {
      en: "Overlay 1.0 km asphalt — eastbound lanes",
      ar: "تأهيل سفلتة 1.0 كم — المسار الشرقي",
    },
    description: {
      en: "Surface ruts and pothole density exceed maintenance threshold; full overlay recommended.",
      ar: "كثافة الحفر والأخاديد تتجاوز عتبة الصيانة؛ يوصى بتأهيل كامل للطبقة السطحية.",
    },
    contractorId: "arc",
    status: "done",
    openedOn: "2025-11-20",
    targetDate: "2026-03-15",
    closedOn: "2026-03-12",
    severity: "medium",
    budgetSAR: 3_500_000,
    spentSAR: 3_410_000,
    afterPhoto: "/photos/z8/asphalt-after.jpg",
  },
  {
    id: "F-Z8-004",
    zoneId: 8,
    activityType: "operational",
    category: "ad_boards",
    title: {
      en: "Remove 6 non-compliant ad boards",
      ar: "إزالة 6 لوحات إعلانية غير مطابقة",
    },
    description: {
      en: "Inspector found oversize and structurally unsound ad boards on north shoulder.",
      ar: "رصد المفتش لوحات إعلانية كبيرة الحجم وغير سليمة إنشائياً على الكتف الشمالي.",
    },
    contractorId: "maas",
    status: "in_progress",
    openedOn: "2026-04-22",
    targetDate: "2026-05-30",
    severity: "medium",
    inspectorName: "Fahad Al-Harbi",
    reopenedCount: 1,
  },
  {
    id: "F-Z8-005",
    zoneId: 8,
    activityType: "operational",
    category: "fuel_station_violation",
    title: {
      en: "Fuel station signage code violation — Station #12",
      ar: "مخالفة لافتات محطة الوقود — محطة رقم 12",
    },
    description: {
      en: "Backlit signage exceeds the height limit defined in the unified urban code.",
      ar: "اللافتات المضاءة تتجاوز الحد الأقصى للارتفاع وفق الكود العمراني الموحد.",
    },
    contractorId: "jeddah_muni",
    status: "open",
    openedOn: "2026-05-02",
    targetDate: "2026-06-15",
    severity: "low",
    inspectorName: "Khalid Al-Otaibi",
  },
  {
    id: "F-Z8-006",
    zoneId: 8,
    activityType: "operational",
    category: "asphalt_digging",
    title: {
      en: "Open trench left unfilled by utility contractor",
      ar: "حفرة مفتوحة لم يردمها مقاول المرافق",
    },
    description: {
      en: "200 m trench from a fiber installation has been left open for 9 days.",
      ar: "حفرة بطول 200 م لتركيب ألياف بصرية تركت مفتوحة منذ 9 أيام.",
    },
    contractorId: "roads_general",
    status: "blocked",
    openedOn: "2026-05-06",
    targetDate: "2026-05-13",
    severity: "high",
    inspectorName: "Fahad Al-Harbi",
  },
  {
    id: "F-Z8-007",
    zoneId: 8,
    activityType: "operational",
    category: "illegal_workshops",
    title: {
      en: "Recurring oil-spill from car repair yard",
      ar: "تسرّب زيوت متكرر من ساحة إصلاح سيارات",
    },
    description: {
      en: "Same workshop flagged for the 3rd time this quarter.",
      ar: "نفس الورشة رصدت للمرة الثالثة هذا الربع.",
    },
    contractorId: "civil_defense",
    status: "in_progress",
    openedOn: "2026-04-30",
    targetDate: "2026-05-25",
    severity: "high",
    inspectorName: "Sami Al-Zahrani",
    reopenedCount: 3,
  },
  {
    id: "F-Z8-008",
    zoneId: 8,
    activityType: "development",
    category: "greenery",
    title: {
      en: "Plant 320 native trees along north service road",
      ar: "زراعة 320 شجرة محلية على الطريق الخدمي الشمالي",
    },
    description: {
      en: "Greenery target uplift; species selected for low water need.",
      ar: "رفع مستهدف التشجير؛ اختيرت أنواع نباتات منخفضة الاحتياج المائي.",
    },
    contractorId: "tip",
    status: "open",
    openedOn: "2026-03-18",
    targetDate: "2027-02-01",
    severity: "low",
    budgetSAR: 950_000,
    spentSAR: 0,
  },
];

// =====================================================================
// ZONE 35 — Middle stretch (Phase 3, sub-stretch "middle")
// Slum pockets, distorted ad-board cluster, fuel-station compliance issues
// =====================================================================
const Z35_FINDINGS: Finding[] = [
  {
    id: "F-Z35-001",
    zoneId: 35,
    activityType: "development",
    category: "slums",
    title: {
      en: "Demolish slum area (≈42 condemned dwellings)",
      ar: "إزالة منطقة عشوائية (~42 مسكن صكوكه ملغاة)",
    },
    description: {
      en: "Cluster south of the corridor with utilities cut; relocations coordinated with social services.",
      ar: "تجمع جنوب المحور قُطعت عنه المرافق؛ يُنسَّق ترحيل السكان مع الخدمات الاجتماعية.",
    },
    contractorId: "arc",
    status: "in_progress",
    openedOn: "2026-01-22",
    targetDate: "2026-11-30",
    severity: "high",
    budgetSAR: 14_500_000,
    spentSAR: 4_200_000,
    beforePhoto: "/photos/z35/slum-before.jpg",
  },
  {
    id: "F-Z35-002",
    zoneId: 35,
    activityType: "development",
    category: "ad_boards",
    title: {
      en: "Re-tender ad-board concession (visual-quality plan)",
      ar: "إعادة طرح امتياز اللوحات الإعلانية (خطة الجودة البصرية)",
    },
    description: {
      en: "Replace 23 mis-sized boards with unified design under new private-sector concession.",
      ar: "استبدال 23 لوحة بأحجام غير مطابقة بتصميم موحّد ضمن امتياز جديد للقطاع الخاص.",
    },
    contractorId: "tip",
    status: "open",
    openedOn: "2026-04-01",
    targetDate: "2027-01-15",
    severity: "medium",
    budgetSAR: 2_100_000,
    spentSAR: 0,
  },
  {
    id: "F-Z35-003",
    zoneId: 35,
    activityType: "development",
    category: "fuel_station_violation",
    title: {
      en: "Rebuild Service Plaza #4 to new urban code",
      ar: "إعادة بناء مجمع الخدمة رقم 4 وفق الكود العمراني الجديد",
    },
    description: {
      en: "Existing fuel-station plaza non-compliant with canopy and signage code; full rebuild.",
      ar: "مجمع الوقود الحالي غير مطابق لكود المظلات واللافتات؛ إعادة بناء كاملة.",
    },
    contractorId: "tip",
    status: "open",
    openedOn: "2026-02-28",
    targetDate: "2027-03-20",
    severity: "medium",
    budgetSAR: 8_700_000,
    spentSAR: 0,
  },
  {
    id: "F-Z35-004",
    zoneId: 35,
    activityType: "operational",
    category: "slums",
    title: {
      en: "Daily refuse pile-up at slum boundary",
      ar: "تراكم نفايات يومي على حدود العشوائية",
    },
    description: {
      en: "Cleaning crew misses south-edge collection 3 days a week.",
      ar: "فريق النظافة يفوّت تجميع الحافة الجنوبية 3 أيام في الأسبوع.",
    },
    contractorId: "maas",
    status: "in_progress",
    openedOn: "2026-05-04",
    targetDate: "2026-05-18",
    severity: "medium",
    inspectorName: "Mansour Al-Ghamdi",
    reopenedCount: 2,
  },
  {
    id: "F-Z35-005",
    zoneId: 35,
    activityType: "operational",
    category: "ad_boards",
    title: {
      en: "Two ad boards leaning post-windstorm",
      ar: "ميلان لوحتين إعلانيتين بعد عاصفة الرياح",
    },
    description: {
      en: "Safety hazard; immediate take-down requested.",
      ar: "خطر سلامة؛ طُلبت إزالة فورية.",
    },
    contractorId: "maas",
    status: "done",
    openedOn: "2026-04-28",
    targetDate: "2026-04-30",
    closedOn: "2026-04-29",
    severity: "high",
    inspectorName: "Mansour Al-Ghamdi",
  },
  {
    id: "F-Z35-006",
    zoneId: 35,
    activityType: "operational",
    category: "fuel_station_violation",
    title: {
      en: "Canopy paint faded — Station #18",
      ar: "بهتان طلاء المظلة — محطة رقم 18",
    },
    description: {
      en: "Visual-distortion finding under the unified service-station appearance rules.",
      ar: "ملاحظة تشوه بصري وفق قواعد المظهر الموحد لمحطات الخدمة.",
    },
    contractorId: "holy_capital",
    status: "open",
    openedOn: "2026-05-09",
    targetDate: "2026-06-30",
    severity: "low",
    inspectorName: "Ibrahim Al-Subhi",
  },
  {
    id: "F-Z35-007",
    zoneId: 35,
    activityType: "operational",
    category: "building_violations",
    title: {
      en: "Building façade graffiti (3 buildings)",
      ar: "تشويه واجهات بالكتابة على الجدران (3 مبانٍ)",
    },
    description: {
      en: "Recurring graffiti on south-side properties facing the corridor.",
      ar: "كتابات متكررة على واجهات الجهة الجنوبية المطلة على المحور.",
    },
    contractorId: "holy_capital",
    status: "in_progress",
    openedOn: "2026-05-01",
    targetDate: "2026-05-22",
    severity: "low",
    inspectorName: "Ibrahim Al-Subhi",
    reopenedCount: 1,
  },
  {
    id: "F-Z35-008",
    zoneId: 35,
    activityType: "operational",
    category: "asphalt_digging",
    title: {
      en: "Pothole cluster — westbound shoulder",
      ar: "تجمع حفر — الكتف الغربي",
    },
    description: {
      en: "12 potholes mapped, awaiting maintenance dispatch.",
      ar: "تم رصد 12 حفرة بانتظار إيفاد فريق الصيانة.",
    },
    contractorId: "roads_general",
    status: "open",
    openedOn: "2026-05-11",
    targetDate: "2026-05-25",
    severity: "medium",
    inspectorName: "Mansour Al-Ghamdi",
  },
  {
    id: "F-Z35-009",
    zoneId: 35,
    activityType: "development",
    category: "greenery",
    title: {
      en: "Convert 6 ha of vacant median to landscaped strip",
      ar: "تحويل 6 هكتارات من الجزر الوسطية الفارغة إلى شريط منسّق",
    },
    description: {
      en: "Visual-quality boost approaching Bahrah; integrates irrigation backbone.",
      ar: "تحسين الجودة البصرية بالاقتراب من بحرة؛ يدمج العمود الفقري للري.",
    },
    contractorId: "tip",
    status: "open",
    openedOn: "2026-03-30",
    targetDate: "2027-02-15",
    severity: "low",
    budgetSAR: 5_900_000,
    spentSAR: 0,
  },
];

// =====================================================================
// ZONE 70 — Haram approach (Phase 5, sub-stretch "haram")
// Pilgrim-facing; bridge perimeter, inspection-point appearance,
// barriers near Prince Nayef. Highest leadership scrutiny pre-Hajj.
// =====================================================================
const Z70_FINDINGS: Finding[] = [
  {
    id: "F-Z70-001",
    zoneId: 70,
    activityType: "development",
    category: "bridge_perimeter",
    title: {
      en: "Restore Prince Nayef Bridge approach perimeter",
      ar: "إعادة تأهيل حرم مدخل كبري الأمير نايف",
    },
    description: {
      en: "Drainage, beautification and pedestrian-barrier upgrade across 600 m of bridge approach.",
      ar: "تصريف، تجميل، وتطوير حواجز المشاة على 600 م من مدخل الكبري.",
    },
    contractorId: "sbg",
    status: "in_progress",
    openedOn: "2026-01-08",
    targetDate: "2027-02-01",
    severity: "high",
    budgetSAR: 11_300_000,
    spentSAR: 3_980_000,
  },
  {
    id: "F-Z70-002",
    zoneId: 70,
    activityType: "development",
    category: "inspection_point",
    title: {
      en: "Replace inspection-point canopy & paint",
      ar: "استبدال مظلة نقطة التفتيش وإعادة الطلاء",
    },
    description: {
      en: "Existing canopy weathered; replace per pilgrim-facing visual quality standard.",
      ar: "المظلة الحالية متآكلة؛ تستبدل وفق معيار الجودة البصرية للحجاج.",
    },
    contractorId: "traffic_dept",
    status: "open",
    openedOn: "2026-03-12",
    targetDate: "2027-04-20",
    severity: "high",
    budgetSAR: 1_750_000,
    spentSAR: 0,
  },
  {
    id: "F-Z70-003",
    zoneId: 70,
    activityType: "development",
    category: "barriers_damaged",
    title: {
      en: "Replace 600 m concrete barriers — bridge approach",
      ar: "استبدال 600 م حواجز خرسانية — مدخل الكبري",
    },
    description: {
      en: "Crash-aged barriers; replace and add reflective treatment.",
      ar: "حواجز متضررة من اصطدامات؛ استبدال وإضافة معالجة عاكسة.",
    },
    contractorId: "sbg",
    status: "in_progress",
    openedOn: "2026-02-18",
    targetDate: "2026-10-30",
    severity: "high",
    budgetSAR: 4_400_000,
    spentSAR: 1_140_000,
  },
  {
    id: "F-Z70-004",
    zoneId: 70,
    activityType: "operational",
    category: "inspection_point",
    title: {
      en: "Trash overflow at inspection point",
      ar: "تكدّس النفايات في نقطة التفتيش",
    },
    description: {
      en: "Receptacles not emptied to peak-hour schedule during weekends.",
      ar: "الحاويات لا تُفرَّغ وفق جدول ساعات الذروة في عطلة نهاية الأسبوع.",
    },
    contractorId: "maas",
    status: "in_progress",
    openedOn: "2026-05-12",
    targetDate: "2026-05-19",
    severity: "medium",
    inspectorName: "Yousef Al-Maliki",
  },
  {
    id: "F-Z70-005",
    zoneId: 70,
    activityType: "operational",
    category: "ad_boards",
    title: {
      en: "Unauthorized vinyl banner on overpass railing",
      ar: "لافتة فينيل غير مرخصة على درابزين الجسر",
    },
    description: {
      en: "Banner installed by unknown party overnight; removal scheduled.",
      ar: "ثُبتت لافتة من قبل جهة غير معروفة ليلاً؛ جدولة الإزالة.",
    },
    contractorId: "maas",
    status: "open",
    openedOn: "2026-05-13",
    targetDate: "2026-05-15",
    severity: "low",
    inspectorName: "Yousef Al-Maliki",
  },
  {
    id: "F-Z70-006",
    zoneId: 70,
    activityType: "operational",
    category: "barriers_damaged",
    title: {
      en: "Reflective paint worn on 80 m of barriers",
      ar: "تآكل الطلاء العاكس على 80 م من الحواجز",
    },
    description: {
      en: "Night-visibility risk on the eastbound bridge approach.",
      ar: "خطر على الرؤية الليلية في المدخل الشرقي للكبري.",
    },
    contractorId: "roads_general",
    status: "open",
    openedOn: "2026-05-08",
    targetDate: "2026-06-05",
    severity: "medium",
    inspectorName: "Yousef Al-Maliki",
  },
  {
    id: "F-Z70-007",
    zoneId: 70,
    activityType: "operational",
    category: "asphalt_digging",
    title: {
      en: "Surface cracking — bridge expansion joint",
      ar: "تشقّق سطحي عند فاصل تمدّد الجسر",
    },
    description: {
      en: "Hairline cracks observed; structural inspection requested.",
      ar: "رُصدت شقوق دقيقة؛ طُلب فحص إنشائي.",
    },
    contractorId: "sbg",
    status: "in_progress",
    openedOn: "2026-04-26",
    targetDate: "2026-05-30",
    severity: "high",
    inspectorName: "Yousef Al-Maliki",
  },
  {
    id: "F-Z70-008",
    zoneId: 70,
    activityType: "development",
    category: "greenery",
    title: {
      en: "Pilgrim approach landscaping — median planting",
      ar: "تنسيق المدخل للحجاج — زراعة الجزيرة الوسطية",
    },
    description: {
      en: "Visual welcome quality target for Hajj season.",
      ar: "هدف جودة الترحيب البصري قبل موسم الحج.",
    },
    contractorId: "tip",
    status: "open",
    openedOn: "2026-03-25",
    targetDate: "2027-03-01",
    severity: "medium",
    budgetSAR: 3_300_000,
    spentSAR: 0,
  },
  {
    id: "F-Z70-009",
    zoneId: 70,
    activityType: "operational",
    category: "building_violations",
    title: {
      en: "Adjacent building façade obstructing welcome signage",
      ar: "واجهة مبنى مجاور تحجب لافتة الترحيب",
    },
    description: {
      en: "Owner notice issued; awaiting compliance.",
      ar: "أُصدر إنذار للمالك؛ بانتظار الامتثال.",
    },
    contractorId: "holy_capital",
    status: "blocked",
    openedOn: "2026-04-15",
    targetDate: "2026-05-30",
    severity: "medium",
    inspectorName: "Yousef Al-Maliki",
    reopenedCount: 1,
  },
];

export const findings: Finding[] = [...Z8_FINDINGS, ...Z35_FINDINGS, ...Z70_FINDINGS];

export function findingsForZone(zoneId: number): Finding[] {
  return findings.filter((f) => f.zoneId === zoneId);
}

// ----- Asset points (bridges, fuel stations, inspection points, slum areas, green areas) -----
export const assets: AssetPoint[] = [
  // Zone 8 — workshops cluster
  {
    id: "A-Z8-bridge", zoneId: 8, type: "service_center",
    name: { en: "Logistics Service Center", ar: "مركز الخدمات اللوجستية" },
    ...jitterFromZone(8, 0.004, 0.001),
  },
  {
    id: "A-Z8-fuel", zoneId: 8, type: "fuel_station",
    name: { en: "Fuel Station #12", ar: "محطة الوقود رقم 12" },
    ...jitterFromZone(8, -0.003, 0.0015),
    status: "open",
  },
  {
    id: "A-Z8-inspect", zoneId: 8, type: "inspection_point",
    name: { en: "Inspection Point — Port", ar: "نقطة تفتيش — الميناء" },
    ...jitterFromZone(8, 0.001, -0.002),
  },

  // Zone 35 — slums + ad cluster
  {
    id: "A-Z35-slum", zoneId: 35, type: "slum_area",
    name: { en: "Condemned dwellings cluster", ar: "تجمع مساكن ملغاة" },
    ...jitterFromZone(35, -0.005, -0.003),
    status: "in_progress",
  },
  {
    id: "A-Z35-fuel", zoneId: 35, type: "fuel_station",
    name: { en: "Service Plaza #4", ar: "مجمع الخدمة رقم 4" },
    ...jitterFromZone(35, 0.002, 0.001),
    status: "open",
  },
  {
    id: "A-Z35-green", zoneId: 35, type: "green_area",
    name: { en: "Median landscaping strip", ar: "شريط التنسيق الوسطي" },
    ...jitterFromZone(35, 0.004, -0.0005),
  },

  // Zone 70 — Prince Nayef bridge approach
  {
    id: "A-Z70-bridge", zoneId: 70, type: "bridge",
    name: { en: "Prince Nayef Bridge — approach", ar: "كبري الأمير نايف — المدخل" },
    ...jitterFromZone(70, -0.003, 0),
    status: "in_progress",
  },
  {
    id: "A-Z70-inspect", zoneId: 70, type: "inspection_point",
    name: { en: "Pilgrim-Approach Inspection Point", ar: "نقطة تفتيش مدخل الحجاج" },
    ...jitterFromZone(70, 0.002, 0.001),
    status: "open",
  },
  {
    id: "A-Z70-green", zoneId: 70, type: "green_area",
    name: { en: "Welcome landscaping median", ar: "جزيرة وسطية للترحيب" },
    ...jitterFromZone(70, 0.0035, -0.001),
  },
];

export function assetsForZone(zoneId: number): AssetPoint[] {
  return assets.filter((a) => a.zoneId === zoneId);
}
