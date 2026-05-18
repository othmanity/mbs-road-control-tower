// Knowledge-base Q&A pairs the agent should answer.
//
// Each Q is grounded in src/kb/facts.ts (single source of truth).
// `answer_en` / `answer_ar` are reference answers — the LLM may rephrase
// but should stay consistent with the data.
// `data_refs` lists which fact paths the answer depends on, so we can
// retrieve/inject only the relevant snippet into the LLM prompt later.

export type KbCategory =
  | "corridor_basics"
  | "structure"
  | "kpis"
  | "findings_status"
  | "findings_zone"
  | "agencies"
  | "budget"
  | "hajj_readiness"
  | "activity_types"
  | "scope";

export interface KbQuestion {
  id: string;
  category: KbCategory;
  q_en: string;
  q_ar: string;
  a_en: string;
  a_ar: string;
  data_refs: string[]; // dot paths into FactsSnapshot
}

const Q: KbQuestion[] = [
  // ----------------------------- Corridor basics
  {
    id: "C-01",
    category: "corridor_basics",
    q_en: "How long is the MBS Road corridor and where does it run?",
    q_ar: "ما طول محور طريق الأمير محمد بن سلمان وأين يمتد؟",
    a_en: "75 km from Jeddah Islamic Port to Al-Masjid Al-Haram in Makkah.",
    a_ar: "75 كم من ميناء جدة الإسلامي إلى المسجد الحرام في مكة المكرمة.",
    data_refs: ["corridor.total_km", "corridor.endpoints"],
  },
  {
    id: "C-02",
    category: "corridor_basics",
    q_en: "How many vehicles use the road every day?",
    q_ar: "كم عدد المركبات التي تستخدم الطريق يومياً؟",
    a_en: "More than 170,000 vehicles daily.",
    a_ar: "أكثر من 170,000 مركبة يومياً.",
    data_refs: ["corridor.daily_vehicles"],
  },
  {
    id: "C-03",
    category: "corridor_basics",
    q_en: "Why is this corridor strategically important?",
    q_ar: "لماذا يُعد هذا المحور استراتيجياً؟",
    a_en: "It is the principal connection between Jeddah and Makkah and the main road used by pilgrims and Umrah travellers to reach Al-Masjid Al-Haram, as well as a logistics spine from the Islamic Port.",
    a_ar: "يمثل الرابط الرئيسي بين جدة ومكة والطريق الأساسي الذي يستخدمه الحجاج والمعتمرون للوصول إلى المسجد الحرام، فضلاً عن كونه عموداً فقرياً للوجستيات من الميناء الإسلامي.",
    data_refs: ["corridor.endpoints", "corridor.daily_vehicles"],
  },
  {
    id: "C-04",
    category: "corridor_basics",
    q_en: "What are the three geographic sub-stretches of the road?",
    q_ar: "ما القطاعات الجغرافية الثلاثة للطريق؟",
    a_en: "Port → Bahrah (0–30 km, logistics & workshops), Bahrah → Prince Naif (30–64 km, inter-city / fuel / ad-boards / slum pockets), and Prince Naif → Holy Mosque (64–75 km, pilgrim approach).",
    a_ar: "الميناء → بحرة (0–30 كم، لوجستيات وورش)، بحرة → الأمير نايف (30–64 كم، نقل بين مدن / محطات وقود / لوحات / عشوائيات)، الأمير نايف → الحرم (64–75 كم، مدخل الحجاج).",
    data_refs: ["corridor.sub_stretches"],
  },

  // ----------------------------- Structure (phases / zones)
  {
    id: "S-01",
    category: "structure",
    q_en: "How is the corridor broken down into phases and zones?",
    q_ar: "كيف يُقسَّم المحور إلى مراحل ونطاقات؟",
    a_en: "5 rollout phases, each covering 15 zones of 1 km — 75 zones in total. Phase 1: Z1–Z15, Phase 2: Z16–Z30, Phase 3: Z31–Z45, Phase 4: Z46–Z60, Phase 5: Z61–Z75.",
    a_ar: "5 مراحل إطلاق، كل واحدة تغطي 15 نطاقاً من كم — إجمالي 75 نطاقاً. المرحلة 1: Z1–Z15، المرحلة 2: Z16–Z30، المرحلة 3: Z31–Z45، المرحلة 4: Z46–Z60، المرحلة 5: Z61–Z75.",
    data_refs: ["corridor.phases"],
  },
  {
    id: "S-02",
    category: "structure",
    q_en: "Which zones are part of the proof-of-concept?",
    q_ar: "ما النطاقات المشمولة في المرحلة التجريبية؟",
    a_en: "Three zones: Z8 (port stretch — workshops belt), Z35 (middle stretch — slum + ad-board cluster), Z70 (Haram approach — bridge perimeter & pilgrim entry).",
    a_ar: "ثلاثة نطاقات: Z8 (قطاع الميناء — حزام ورش)، Z35 (القطاع الأوسط — عشوائيات ولوحات)، Z70 (مدخل الحرم — حرم الكبري ومدخل الحجاج).",
    data_refs: ["poc_zones", "scope_notes.poc_zone_ids"],
  },
  {
    id: "S-03",
    category: "structure",
    q_en: "What is the difference between a phase and a sub-stretch?",
    q_ar: "ما الفرق بين المرحلة والقطاع الجغرافي؟",
    a_en: "A phase is an operational rollout slice (when work is scheduled). A sub-stretch is a geographic character (port-logistics vs middle vs Haram approach). Every zone carries both labels.",
    a_ar: "المرحلة شريحة إطلاق تشغيلية (متى سيُنفَّذ العمل). القطاع الجغرافي يصف طبيعة الموقع (ميناء ولوجستيات / وسط / مدخل الحرم). كل نطاق يحمل التصنيفين معاً.",
    data_refs: ["corridor.phases", "corridor.sub_stretches", "glossary"],
  },
  {
    id: "S-04",
    category: "structure",
    q_en: "Which phase does Zone 70 belong to?",
    q_ar: "إلى أي مرحلة ينتمي النطاق 70؟",
    a_en: "Phase 5 (Z61–Z75), sub-stretch ‘Prince Naif → Holy Mosque’.",
    a_ar: "المرحلة 5 (Z61–Z75)، القطاع ‘الأمير نايف → الحرم’.",
    data_refs: ["poc_zones[id=70]"],
  },
  {
    id: "S-05",
    category: "structure",
    q_en: "What distortion-density bands are used on the map?",
    q_ar: "ما تصنيفات كثافة التشوه المستخدمة على الخريطة؟",
    a_en: "Three: low (green), medium (orange), high (red). Each 1 km zone is colored by its current band.",
    a_ar: "ثلاثة: منخفضة (أخضر)، متوسطة (برتقالي)، عالية (أحمر). كل نطاق طوله 1 كم يُلوّن بحسب تصنيفه الحالي.",
    data_refs: ["poc_zones[*].density"],
  },

  // ----------------------------- KPIs / 2027 targets
  {
    id: "K-01",
    category: "kpis",
    q_en: "How many 2027 targets are we tracking?",
    q_ar: "كم عدد مستهدفات 2027 التي نتابعها؟",
    a_en: "Six: road maintenance coverage, building compliance, illegal-workshop removal, barrier repair, condemned-building demolition, greenery & median planting.",
    a_ar: "ستة: تغطية الصيانة، امتثال المباني، إزالة الورش غير النظامية، إصلاح الحواجز، هدم المباني الملغاة، التشجير والجزر الوسطية.",
    data_refs: ["kpis"],
  },
  {
    id: "K-02",
    category: "kpis",
    q_en: "What is the road-maintenance coverage target and where are we?",
    q_ar: "ما مستهدف تغطية صيانة الطريق وأين وصلنا؟",
    a_en: "Target is 100% coverage by end of 2027. We are at 38% currently, trending +4.2% per week.",
    a_ar: "المستهدف 100% تغطية بحلول نهاية 2027. الوضع الحالي 38%، باتجاه +4.2% أسبوعياً.",
    data_refs: ["kpis[id=maintenance_coverage]"],
  },
  {
    id: "K-03",
    category: "kpis",
    q_en: "How are we doing on barrier-repair progress?",
    q_ar: "ما تقدّمنا في إصلاح الحواجز الخرسانية؟",
    a_en: "Target: 90% repaired by 2027 end. Current: 53% (+5.3% weekly).",
    a_ar: "المستهدف: إصلاح 90% بنهاية 2027. الحالي: 53% (+5.3% أسبوعياً).",
    data_refs: ["kpis[id=barriers_fixed]"],
  },
  {
    id: "K-04",
    category: "kpis",
    q_en: "Which KPI is furthest behind?",
    q_ar: "أي مستهدف هو الأكثر تأخراً؟",
    a_en: "Greenery & median planting — only 19% of the 100% target so far, growing slowly at +1.4% per week.",
    a_ar: "التشجير والجزر الوسطية — 19% فقط من المستهدف 100%، ينمو ببطء بمعدل +1.4% أسبوعياً.",
    data_refs: ["kpis[id=greenery_added]"],
  },
  {
    id: "K-05",
    category: "kpis",
    q_en: "Which KPI is most on track?",
    q_ar: "أي مستهدف هو الأقرب للمسار المخطط؟",
    a_en: "Damaged-barrier repair — 53% of a 90% target (≈59% of target) — the leading indicator.",
    a_ar: "إصلاح الحواجز — 53% من مستهدف 90% (≈59% من المستهدف) — أعلى نسبة تحقيق.",
    data_refs: ["kpis"],
  },
  {
    id: "K-06",
    category: "kpis",
    q_en: "What is the building-compliance target?",
    q_ar: "ما مستهدف امتثال المباني؟",
    a_en: "70% of buildings on the corridor compliant with the unified urban code by 2027 end. Currently at 22% (+2.1% weekly).",
    a_ar: "70% من المباني على المحور ممتثلة للكود العمراني الموحد بنهاية 2027. الحالي 22% (+2.1% أسبوعياً).",
    data_refs: ["kpis[id=building_compliance]"],
  },
  {
    id: "K-07",
    category: "kpis",
    q_en: "How many condemned buildings still need to be demolished?",
    q_ar: "كم مبنى ملغى الصك ما زال يحتاج للهدم؟",
    a_en: "We are at 28% of the 100% demolition target — about 72 percentage points remaining (proportional to the corridor’s total condemned-building inventory).",
    a_ar: "وصلنا إلى 28% من مستهدف الهدم البالغ 100% — يتبقى نحو 72 نقطة مئوية (متناسبة مع مجموع المباني الملغاة على المحور).",
    data_refs: ["kpis[id=condemned_demolished]"],
  },
  {
    id: "K-08",
    category: "kpis",
    q_en: "What is the workshop-clearance target?",
    q_ar: "ما مستهدف إزالة الورش غير النظامية؟",
    a_en: "100% of illegal workshops & warehouses cleared by 2027 end. At 41% so far, +6.0% per week — strongest weekly delta.",
    a_ar: "إزالة 100% من الورش والمستودعات غير النظامية بنهاية 2027. الحالي 41%، +6.0% أسبوعياً — أعلى نسبة تغيّر أسبوعي.",
    data_refs: ["kpis[id=illegal_workshops_removed]"],
  },

  // ----------------------------- Findings status
  {
    id: "F-01",
    category: "findings_status",
    q_en: "How many open findings are there in the PoC scope?",
    q_ar: "كم عدد الملاحظات المفتوحة ضمن نطاق التجربة؟",
    a_en: "Refer to findings_aggregate.open + in_progress + blocked counts.",
    a_ar: "يُرجى الاطلاع على إجمالي findings_aggregate.open + in_progress + blocked.",
    data_refs: ["findings_aggregate"],
  },
  {
    id: "F-02",
    category: "findings_status",
    q_en: "What is our overall closure rate?",
    q_ar: "ما معدل الإغلاق الإجمالي؟",
    a_en: "Computed as done / total. See findings_aggregate.done and findings_aggregate.total.",
    a_ar: "يُحسب بـ done / total. انظر findings_aggregate.done و findings_aggregate.total.",
    data_refs: ["findings_aggregate.done", "findings_aggregate.total"],
  },
  {
    id: "F-03",
    category: "findings_status",
    q_en: "How many findings are currently blocked?",
    q_ar: "كم ملاحظة متعثرة حالياً؟",
    a_en: "See findings_aggregate.blocked. Each blocked item needs escalation in the joint working room.",
    a_ar: "انظر findings_aggregate.blocked. كل بند متعثر يحتاج تصعيد في غرفة العمل المشتركة.",
    data_refs: ["findings_aggregate.blocked", "findings_aggregate.top_blockers"],
  },
  {
    id: "F-04",
    category: "findings_status",
    q_en: "Which high-severity findings are still open?",
    q_ar: "ما الملاحظات عالية الخطورة ولا زالت مفتوحة؟",
    a_en: "List from findings_aggregate.top_blockers (or filter all findings where severity=high and status≠done).",
    a_ar: "انظر القائمة في findings_aggregate.top_blockers (أو رشّح كل الملاحظات بـ severity=high و status≠done).",
    data_refs: ["findings_aggregate.top_blockers", "findings_aggregate.high_severity_open"],
  },
  {
    id: "F-05",
    category: "findings_status",
    q_en: "Which distortion category has the most findings?",
    q_ar: "أي تصنيف للتشوه يحوي أكثر عدد من الملاحظات؟",
    a_en: "See findings_aggregate.by_category (largest entry).",
    a_ar: "انظر findings_aggregate.by_category (أكبر إدخال).",
    data_refs: ["findings_aggregate.by_category"],
  },
  {
    id: "F-06",
    category: "findings_status",
    q_en: "Which finding is closest to its deadline?",
    q_ar: "أي ملاحظة هي الأقرب لتاريخ موعدها المستهدف؟",
    a_en: "See findings_aggregate.top_blockers — the list is sorted by earliest target_date.",
    a_ar: "انظر findings_aggregate.top_blockers — القائمة مرتبة بالأقرب موعداً.",
    data_refs: ["findings_aggregate.top_blockers"],
  },
  {
    id: "F-07",
    category: "findings_status",
    q_en: "How many findings have been reopened more than once?",
    q_ar: "كم ملاحظة أُعيد فتحها أكثر من مرة؟",
    a_en: "Filter findings where reopenedCount > 1 — these indicate the same issue recurring (repeat-offender pattern).",
    a_ar: "رشّح الملاحظات التي reopenedCount > 1 — هذه مؤشر على تكرار نفس المشكلة (نمط مخالف متكرر).",
    data_refs: ["findings_aggregate"],
  },
  {
    id: "F-08",
    category: "findings_status",
    q_en: "What does ‘blocked’ status mean operationally?",
    q_ar: "ماذا يعني وصف ‘متعثرة’ تشغيلياً؟",
    a_en: "Work that cannot progress because of an external dependency (e.g., utility contractor not responding, owner notice unresolved, agency hand-off pending). These are the items the joint working room escalates first.",
    a_ar: "أعمال لا يمكن تقدّمها بسبب اعتماد خارجي (مثل: مقاول مرافق غير مستجيب، إنذار مالك لم يُحل، انتقال صلاحيات بين الجهات معلق). هذه أولى البنود في غرفة العمل المشتركة للتصعيد.",
    data_refs: ["findings_aggregate.blocked", "glossary"],
  },

  // ----------------------------- Findings by zone
  {
    id: "Z-01",
    category: "findings_zone",
    q_en: "What is the situation in Zone 8?",
    q_ar: "ما الوضع في النطاق 8؟",
    a_en: "Phase 1, port stretch, high distortion density. Workshops belt with damaged median barriers and asphalt deterioration. Multiple agencies involved (JM, RGA, GDCD, Investment).",
    a_ar: "المرحلة 1، قطاع الميناء، كثافة تشوه عالية. حزام ورش مع حواجز جزيرة وسطية متهالكة وتدهور سفلتة. عدة جهات مشاركة (JM, RGA, GDCD, Investment).",
    data_refs: ["poc_zones[id=8]"],
  },
  {
    id: "Z-02",
    category: "findings_zone",
    q_en: "What is the situation in Zone 35?",
    q_ar: "ما الوضع في النطاق 35؟",
    a_en: "Phase 3, middle stretch, high distortion density. Slum cluster (~42 condemned dwellings), distorted ad-board cluster, fuel-station code violations. Owned mostly by HCM and the Investment partner.",
    a_ar: "المرحلة 3، القطاع الأوسط، كثافة تشوه عالية. تجمع عشوائيات (~42 مسكن ملغى)، فوضى لوحات إعلانية، مخالفات محطات وقود. مملوك غالباً لـ HCM وشريك الاستثمار.",
    data_refs: ["poc_zones[id=35]"],
  },
  {
    id: "Z-03",
    category: "findings_zone",
    q_en: "What is the situation in Zone 70?",
    q_ar: "ما الوضع في النطاق 70؟",
    a_en: "Phase 5, Haram approach, high distortion density. Prince Naif Bridge perimeter restoration, inspection-point upgrade, barrier replacement. Highest leadership scrutiny before Hajj.",
    a_ar: "المرحلة 5، مدخل الحرم، كثافة تشوه عالية. إعادة تأهيل حرم كبري الأمير نايف، تطوير نقطة التفتيش، استبدال الحواجز. أعلى تدقيق قيادي قبل الحج.",
    data_refs: ["poc_zones[id=70]"],
  },
  {
    id: "Z-04",
    category: "findings_zone",
    q_en: "How many findings does Zone 8 have and how many are open?",
    q_ar: "كم عدد ملاحظات النطاق 8 وكم منها مفتوحة؟",
    a_en: "Use poc_zones[id=8].findings_total and findings_open.",
    a_ar: "استخدم poc_zones[id=8].findings_total و findings_open.",
    data_refs: ["poc_zones[id=8]"],
  },
  {
    id: "Z-05",
    category: "findings_zone",
    q_en: "Which PoC zone has the highest number of high-severity findings?",
    q_ar: "أي نطاق تجريبي يحوي أكثر ملاحظات عالية الخطورة؟",
    a_en: "Compare poc_zones[*].findings_high_severity.",
    a_ar: "قارن poc_zones[*].findings_high_severity.",
    data_refs: ["poc_zones"],
  },
  {
    id: "Z-06",
    category: "findings_zone",
    q_en: "Are there bridges in any PoC zone?",
    q_ar: "هل توجد كباري في أي نطاق تجريبي؟",
    a_en: "Yes — Zone 70 contains Prince Naif Bridge (approach). Asset type ‘bridge’ also appears in poc_zones[id=70].asset_count_by_type.",
    a_ar: "نعم — النطاق 70 يحوي كبري الأمير نايف (المدخل). نوع الأصل ‘bridge’ يظهر أيضاً في poc_zones[id=70].asset_count_by_type.",
    data_refs: ["poc_zones[id=70].asset_count_by_type"],
  },
  {
    id: "Z-07",
    category: "findings_zone",
    q_en: "What can you tell me about Zone 50?",
    q_ar: "ماذا يمكنك إخباري عن النطاق 50؟",
    a_en: "Zone 50 is in Phase 4 (Z46–Z60), middle sub-stretch. PoC data has not been injected for it yet — return the scope_notes.out_of_scope_response.",
    a_ar: "النطاق 50 ضمن المرحلة 4 (Z46–Z60)، القطاع الأوسط. لم تُحقَن بيانات تجريبية له بعد — أعد الإجابة scope_notes.out_of_scope_response.",
    data_refs: ["corridor.phases", "corridor.sub_stretches", "scope_notes"],
  },
  {
    id: "Z-08",
    category: "findings_zone",
    q_en: "Which assets are in Zone 35?",
    q_ar: "ما الأصول الموجودة في النطاق 35؟",
    a_en: "Slum-area boundary, Service Plaza #4 (fuel station), and a planned median-landscaping strip. See poc_zones[id=35].asset_count_by_type.",
    a_ar: "حدود منطقة عشوائيات، مجمع الخدمة رقم 4 (وقود)، وشريط تنسيق وسطي مخطط. انظر poc_zones[id=35].asset_count_by_type.",
    data_refs: ["poc_zones[id=35].asset_count_by_type"],
  },

  // ----------------------------- Agencies / governance
  {
    id: "A-01",
    category: "agencies",
    q_en: "Which agencies are involved on the MBS Road?",
    q_ar: "أي جهات مشاركة في المحور؟",
    a_en: "Seven: Ministry of Municipalities & Housing (MoMAH — governance), Holy Capital Municipality (HCM), Jeddah Municipality (JM), Roads General Authority (RGA), General Department of Traffic (GDT), General Directorate of Civil Defense (GDCD), and a private-sector investment partner.",
    a_ar: "سبع: وزارة البلديات والإسكان (MoMAH — الحوكمة)، أمانة العاصمة المقدسة (HCM)، أمانة جدة (JM)، الهيئة العامة للطرق (RGA)، الإدارة العامة للمرور (GDT)، المديرية العامة للدفاع المدني (GDCD)، وشريك استثمار من القطاع الخاص.",
    data_refs: ["agencies"],
  },
  {
    id: "A-02",
    category: "agencies",
    q_en: "Which agency owns the most findings overall?",
    q_ar: "أي جهة تمتلك أكبر عدد من الملاحظات؟",
    a_en: "Take the largest entry of findings_aggregate.by_agency.",
    a_ar: "انظر أكبر إدخال في findings_aggregate.by_agency.",
    data_refs: ["findings_aggregate.by_agency"],
  },
  {
    id: "A-03",
    category: "agencies",
    q_en: "Which agency has the most blocked items?",
    q_ar: "أي جهة لديها أكثر بنود متعثرة؟",
    a_en: "Compare agencies[*].blocked_findings_count and take the max.",
    a_ar: "قارن agencies[*].blocked_findings_count وخذ الأعلى.",
    data_refs: ["agencies"],
  },
  {
    id: "A-04",
    category: "agencies",
    q_en: "Why does the report say governance is one of the four root causes?",
    q_ar: "لماذا يقول التقرير إن الحوكمة هي أحد الأسباب الجذرية الأربعة؟",
    a_en: "Because no single authority oversees the corridor end-to-end — 4 agencies in maintenance, 7 in infrastructure projects, 3 in studies, 4 in private-sector projects. Roles overlap and there is no joint operations room (slide 9).",
    a_ar: "لأنه لا توجد جهة واحدة مشرفة على المحور كاملاً — 4 جهات في الصيانة، 7 في البنية التحتية، 3 في الدراسات، 4 في القطاع الخاص. تتداخل الأدوار ولا توجد غرفة عمليات مشتركة (شريحة 9).",
    data_refs: ["agencies"],
  },
  {
    id: "A-05",
    category: "agencies",
    q_en: "What is the proposed governance fix?",
    q_ar: "ما الحل الحوكمي المقترح؟",
    a_en: "An independent program led by MoMAH that joins HCM (Makkah) and Jeddah Municipality in a shared working room with mandates for findings remediation and stakeholder coordination.",
    a_ar: "برنامج مستقل بقيادة MoMAH يجمع HCM (مكة) وأمانة جدة في غرفة عمل مشتركة بصلاحيات معالجة الملاحظات وتنسيق أصحاب المصلحة.",
    data_refs: ["agencies"],
  },
  {
    id: "A-06",
    category: "agencies",
    q_en: "Who is responsible for greenery and ad-board concessions?",
    q_ar: "من المسؤول عن التشجير وامتيازات اللوحات الإعلانية؟",
    a_en: "The private-sector investment partner (PIF/PPP), under MoMAH oversight.",
    a_ar: "شريك الاستثمار من القطاع الخاص (PIF/PPP)، تحت إشراف MoMAH.",
    data_refs: ["agencies[id=investment]"],
  },

  // ----------------------------- Budget
  {
    id: "B-01",
    category: "budget",
    q_en: "How much development budget is committed in Zone 8?",
    q_ar: "كم حجم ميزانية التطوير الملتزم بها في النطاق 8؟",
    a_en: "See poc_zones[id=8].budget_committed_sar (SAR).",
    a_ar: "انظر poc_zones[id=8].budget_committed_sar (ر.س).",
    data_refs: ["poc_zones[id=8]"],
  },
  {
    id: "B-02",
    category: "budget",
    q_en: "What share of the Zone 8 budget has been spent?",
    q_ar: "ما نسبة الإنفاق من ميزانية النطاق 8؟",
    a_en: "Compute poc_zones[id=8].budget_spent_sar / budget_committed_sar.",
    a_ar: "احسب poc_zones[id=8].budget_spent_sar / budget_committed_sar.",
    data_refs: ["poc_zones[id=8]"],
  },
  {
    id: "B-03",
    category: "budget",
    q_en: "Which PoC zone has the largest committed budget?",
    q_ar: "أي نطاق تجريبي لديه أكبر ميزانية ملتزمة؟",
    a_en: "Compare poc_zones[*].budget_committed_sar.",
    a_ar: "قارن poc_zones[*].budget_committed_sar.",
    data_refs: ["poc_zones"],
  },
  {
    id: "B-04",
    category: "budget",
    q_en: "What is the total committed development budget across all PoC zones?",
    q_ar: "ما إجمالي ميزانية التطوير الملتزم بها لكل نطاقات التجربة؟",
    a_en: "Sum of poc_zones[*].budget_committed_sar.",
    a_ar: "مجموع poc_zones[*].budget_committed_sar.",
    data_refs: ["poc_zones"],
  },

  // ----------------------------- Hajj readiness
  {
    id: "H-01",
    category: "hajj_readiness",
    q_en: "How many days until the next Hajj season?",
    q_ar: "كم يوماً متبقياً حتى موسم الحج القادم؟",
    a_en: "See hajj_readiness.days_remaining and hajj_readiness.next_hajj_date.",
    a_ar: "انظر hajj_readiness.days_remaining و hajj_readiness.next_hajj_date.",
    data_refs: ["hajj_readiness"],
  },
  {
    id: "H-02",
    category: "hajj_readiness",
    q_en: "Are we on track for Hajj?",
    q_ar: "هل نحن ضمن المسار المخطط للحج؟",
    a_en: "Return hajj_readiness.summary_en / summary_ar — derived from average KPI progress vs target.",
    a_ar: "أعد hajj_readiness.summary_en / summary_ar — مشتق من متوسط تقدّم المستهدفات.",
    data_refs: ["hajj_readiness", "kpis"],
  },
  {
    id: "H-03",
    category: "hajj_readiness",
    q_en: "What short-term work must be done before Hajj?",
    q_ar: "ما الأعمال قصيرة المدى التي يجب إنجازها قبل الحج؟",
    a_en: "Per the report (slide 12): intensify contractor oversight, clear illegal workshops & yards, fix concrete barriers, improve appearance of inspection points along the corridor.",
    a_ar: "حسب التقرير (شريحة 12): تكثيف الرقابة على المقاولين، إزالة الورش والمستودعات غير النظامية، إصلاح الحواجز الخرسانية، تحسين مظهر نقاط التفتيش على امتداد المحور.",
    data_refs: ["kpis"],
  },
  {
    id: "H-04",
    category: "hajj_readiness",
    q_en: "Which zone is the highest priority for Hajj readiness?",
    q_ar: "أي نطاق له أعلى أولوية لجاهزية الحج؟",
    a_en: "Zone 70 — Prince Naif Bridge approach is the pilgrim entry; bridge perimeter and inspection-point appearance directly shape the welcome experience.",
    a_ar: "النطاق 70 — مدخل كبري الأمير نايف هو مدخل الحجاج؛ حرم الكبري ومظهر نقطة التفتيش يحددان مباشرةً تجربة الترحيب.",
    data_refs: ["poc_zones[id=70]"],
  },

  // ----------------------------- Activity types
  {
    id: "T-01",
    category: "activity_types",
    q_en: "What is a ‘development activity’?",
    q_ar: "ما هو ‘النشاط التطويري’؟",
    a_en: "Major capital fixes from the report’s primary findings — e.g., new fuel station, demolish workshops, replace barriers, bridge restoration. Has a budget, contractor, target date.",
    a_ar: "أعمال رأسمالية كبيرة من الملاحظات الأساسية في التقرير — مثل: محطة وقود جديدة، هدم ورش، استبدال حواجز، تأهيل كبري. لها ميزانية، مقاول، تاريخ مستهدف.",
    data_refs: ["glossary"],
  },
  {
    id: "T-02",
    category: "activity_types",
    q_en: "What is an ‘operational activity’?",
    q_ar: "ما هو ‘النشاط التشغيلي’؟",
    a_en: "Day-to-day inspector findings — mostly visual-distortion items. Short cycle (Open → Assigned → Fixed → Verified). No major budget; has an inspector name and may have a reopen count.",
    a_ar: "ملاحظات مفتشين يومية — معظمها تشوه بصري. دورة قصيرة (مفتوحة → مُسندة → مُصلحة → مُتحقق منها). بلا ميزانية كبيرة؛ لها اسم مفتش وقد يكون لها عدد مرات إعادة فتح.",
    data_refs: ["glossary"],
  },
  {
    id: "T-03",
    category: "activity_types",
    q_en: "How many development vs operational items are tracked?",
    q_ar: "كم عدد البنود التطويرية مقابل التشغيلية؟",
    a_en: "See findings_aggregate.by_activity_type.",
    a_ar: "انظر findings_aggregate.by_activity_type.",
    data_refs: ["findings_aggregate.by_activity_type"],
  },
  {
    id: "T-04",
    category: "activity_types",
    q_en: "When an operational finding keeps recurring (same workshop oil-spill 3rd time), what does that mean?",
    q_ar: "إذا تكررت ملاحظة تشغيلية (نفس ورشة تسرّب الزيت للمرة الثالثة)، ماذا يعني ذلك؟",
    a_en: "It is a ‘repeat-offender’ pattern. The reopenedCount metric flags it. These cases typically need escalation from operational handling to a development-style decision (e.g., demolition or licensing review).",
    a_ar: "هذا نمط ‘مخالف متكرر’. مؤشّر reopenedCount يرصده. تحتاج هذه الحالات عادةً للتصعيد من المعالجة التشغيلية إلى قرار تطويري (مثل: هدم أو مراجعة ترخيص).",
    data_refs: ["findings_aggregate"],
  },

  // ----------------------------- Scope / safety
  {
    id: "X-01",
    category: "scope",
    q_en: "Can you answer questions about Riyadh roads or other cities?",
    q_ar: "هل تستطيع الإجابة عن طرق الرياض أو مدن أخرى؟",
    a_en: "No — this agent is scoped to the MBS Road corridor (Jeddah → Makkah) in the Makkah region. Anything outside that scope, decline politely and remind the user of the corridor.",
    a_ar: "لا — هذا الوكيل محصور بمحور طريق الأمير محمد بن سلمان (جدة → مكة) في منطقة مكة المكرمة. أي طلب خارج هذا النطاق، اعتذر بأدب وذكّر المستخدم بنطاق المحور.",
    data_refs: ["corridor", "scope_notes"],
  },
  {
    id: "X-02",
    category: "scope",
    q_en: "Do you have data for zones outside Z8, Z35, Z70?",
    q_ar: "هل توجد بيانات لنطاقات خارج Z8 و Z35 و Z70؟",
    a_en: "Not yet. Return scope_notes.out_of_scope_response and offer the zone’s phase + sub-stretch if asked.",
    a_ar: "ليس بعد. أعد scope_notes.out_of_scope_response واعرض المرحلة والقطاع الجغرافي إذا طُلب.",
    data_refs: ["scope_notes"],
  },
  {
    id: "X-03",
    category: "scope",
    q_en: "Is the data in this PoC real?",
    q_ar: "هل البيانات في هذه التجربة حقيقية؟",
    a_en: "No — all findings, budgets, inspector names, and KPI percentages are synthetic, generated to demonstrate the platform. Real data will be loaded after sign-off.",
    a_ar: "لا — جميع الملاحظات والميزانيات وأسماء المفتشين ونسب المستهدفات بيانات تجريبية أُنشئت لعرض المنصة. ستُحمَّل البيانات الحقيقية بعد الاعتماد.",
    data_refs: ["scope_notes"],
  },
];

export const kbQuestions: KbQuestion[] = Q;

export const kbCategoryLabels: Record<KbCategory, { en: string; ar: string }> = {
  corridor_basics:  { en: "Corridor basics",          ar: "أساسيات المحور" },
  structure:        { en: "Phases & zones",            ar: "المراحل والنطاقات" },
  kpis:             { en: "2027 targets / KPIs",       ar: "مستهدفات 2027" },
  findings_status:  { en: "Findings — status",         ar: "الملاحظات — الحالة" },
  findings_zone:    { en: "Findings — by zone",        ar: "الملاحظات — حسب النطاق" },
  agencies:         { en: "Agencies & governance",     ar: "الجهات والحوكمة" },
  budget:           { en: "Budget",                    ar: "الميزانية" },
  hajj_readiness:   { en: "Hajj readiness",            ar: "جاهزية الحج" },
  activity_types:   { en: "Activity types",            ar: "أنواع الأنشطة" },
  scope:            { en: "Scope & safety",            ar: "النطاق والسلامة" },
};
