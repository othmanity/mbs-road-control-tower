# 06 · Questions & Answers

> **54 bilingual (EN+AR) Q&A pairs** the MBS Road Control Tower Agent must answer reliably.
> Each answer is grounded in the [Facts Snapshot](07-facts-snapshot.json) — the agent never invents numbers.

---

## Index

| # | Category | Questions |
|---|---|---|
| 01 | [Corridor basics](#1-corridor-basics) | 4 |
| 02 | [Phases & zones](#2-phases-zones) | 5 |
| 03 | [2027 targets / KPIs](#3-2027-targets-kpis) | 8 |
| 04 | [Findings — status](#4-findings-status) | 8 |
| 05 | [Findings — by zone](#5-findings-by-zone) | 8 |
| 06 | [Agencies & governance](#6-agencies-governance) | 6 |
| 07 | [Budget](#7-budget) | 4 |
| 08 | [Hajj readiness](#8-hajj-readiness) | 4 |
| 09 | [Activity types](#9-activity-types) | 4 |
| 10 | [Scope & safety](#10-scope-safety) | 3 |

---

## 1. Corridor basics
*أساسيات المحور*

### `C-01` How long is the MBS Road corridor and where does it run?
_ما طول محور طريق الأمير محمد بن سلمان وأين يمتد؟_

**Answer (EN):** 75 km from Jeddah Islamic Port to Al-Masjid Al-Haram in Makkah.

**Answer (AR):** 75 كم من ميناء جدة الإسلامي إلى المسجد الحرام في مكة المكرمة.

> _Data refs:_ `corridor.total_km`, `corridor.endpoints`

---

### `C-02` How many vehicles use the road every day?
_كم عدد المركبات التي تستخدم الطريق يومياً؟_

**Answer (EN):** More than 170,000 vehicles daily.

**Answer (AR):** أكثر من 170,000 مركبة يومياً.

> _Data refs:_ `corridor.daily_vehicles`

---

### `C-03` Why is this corridor strategically important?
_لماذا يُعد هذا المحور استراتيجياً؟_

**Answer (EN):** It is the principal connection between Jeddah and Makkah and the main road used by pilgrims and Umrah travellers to reach Al-Masjid Al-Haram, as well as a logistics spine from the Islamic Port.

**Answer (AR):** يمثل الرابط الرئيسي بين جدة ومكة والطريق الأساسي الذي يستخدمه الحجاج والمعتمرون للوصول إلى المسجد الحرام، فضلاً عن كونه عموداً فقرياً للوجستيات من الميناء الإسلامي.

> _Data refs:_ `corridor.endpoints`, `corridor.daily_vehicles`

---

### `C-04` What are the three geographic sub-stretches of the road?
_ما القطاعات الجغرافية الثلاثة للطريق؟_

**Answer (EN):** Port → Bahrah (0–30 km, logistics & workshops), Bahrah → Prince Nayef (30–64 km, inter-city / fuel / ad-boards / slum pockets), and Prince Nayef → Holy Mosque (64–75 km, pilgrim approach).

**Answer (AR):** الميناء → بحرة (0–30 كم، لوجستيات وورش)، بحرة → الأمير نايف (30–64 كم، نقل بين مدن / محطات وقود / لوحات / عشوائيات)، الأمير نايف → الحرم (64–75 كم، مدخل الحجاج).

> _Data refs:_ `corridor.sub_stretches`

---

## 2. Phases & zones
*المراحل والنطاقات*

### `S-01` How is the corridor broken down into phases and zones?
_كيف يُقسَّم المحور إلى مراحل ونطاقات؟_

**Answer (EN):** 5 rollout phases, each covering 15 zones of 1 km — 75 zones in total. Phase 1: Z1–Z15, Phase 2: Z16–Z30, Phase 3: Z31–Z45, Phase 4: Z46–Z60, Phase 5: Z61–Z75.

**Answer (AR):** 5 مراحل إطلاق، كل واحدة تغطي 15 نطاقاً من كم — إجمالي 75 نطاقاً. المرحلة 1: Z1–Z15، المرحلة 2: Z16–Z30، المرحلة 3: Z31–Z45، المرحلة 4: Z46–Z60، المرحلة 5: Z61–Z75.

> _Data refs:_ `corridor.phases`

---

### `S-02` Which zones are part of the proof-of-concept?
_ما النطاقات المشمولة في المرحلة التجريبية؟_

**Answer (EN):** Three zones: Z8 (port stretch — workshops belt), Z35 (middle stretch — slum + ad-board cluster), Z70 (Haram approach — bridge perimeter & pilgrim entry).

**Answer (AR):** ثلاثة نطاقات: Z8 (قطاع الميناء — حزام ورش)، Z35 (القطاع الأوسط — عشوائيات ولوحات)، Z70 (مدخل الحرم — حرم الكبري ومدخل الحجاج).

> _Data refs:_ `poc_zones`, `scope_notes.poc_zone_ids`

---

### `S-03` What is the difference between a phase and a sub-stretch?
_ما الفرق بين المرحلة والقطاع الجغرافي؟_

**Answer (EN):** A phase is an operational rollout slice (when work is scheduled). A sub-stretch is a geographic character (port-logistics vs middle vs Haram approach). Every zone carries both labels.

**Answer (AR):** المرحلة شريحة إطلاق تشغيلية (متى سيُنفَّذ العمل). القطاع الجغرافي يصف طبيعة الموقع (ميناء ولوجستيات / وسط / مدخل الحرم). كل نطاق يحمل التصنيفين معاً.

> _Data refs:_ `corridor.phases`, `corridor.sub_stretches`, `glossary`

---

### `S-04` Which phase does Zone 70 belong to?
_إلى أي مرحلة ينتمي النطاق 70؟_

**Answer (EN):** Phase 5 (Z61–Z75), sub-stretch ‘Prince Nayef → Holy Mosque’.

**Answer (AR):** المرحلة 5 (Z61–Z75)، القطاع ‘الأمير نايف → الحرم’.

> _Data refs:_ `poc_zones[id=70]`

---

### `S-05` What distortion-density bands are used on the map?
_ما تصنيفات كثافة التشوه المستخدمة على الخريطة؟_

**Answer (EN):** Three: low (green), medium (orange), high (red). Each 1 km zone is colored by its current band.

**Answer (AR):** ثلاثة: منخفضة (أخضر)، متوسطة (برتقالي)، عالية (أحمر). كل نطاق طوله 1 كم يُلوّن بحسب تصنيفه الحالي.

> _Data refs:_ `poc_zones[*].density`

---

## 3. 2027 targets / KPIs
*مستهدفات 2027*

### `K-01` How many 2027 targets are we tracking?
_كم عدد مستهدفات 2027 التي نتابعها؟_

**Answer (EN):** Six: road maintenance coverage, building compliance, illegal-workshop removal, barrier repair, condemned-building demolition, greenery & median planting.

**Answer (AR):** ستة: تغطية الصيانة، امتثال المباني، إزالة الورش غير النظامية، إصلاح الحواجز، هدم المباني الملغاة، التشجير والجزر الوسطية.

> _Data refs:_ `kpis`

---

### `K-02` What is the road-maintenance coverage target and where are we?
_ما مستهدف تغطية صيانة الطريق وأين وصلنا؟_

**Answer (EN):** Target is 100% coverage by end of 2027. We are at 38% currently, trending +4.2% per week.

**Answer (AR):** المستهدف 100% تغطية بحلول نهاية 2027. الوضع الحالي 38%، باتجاه +4.2% أسبوعياً.

> _Data refs:_ `kpis[id=maintenance_coverage]`

---

### `K-03` How are we doing on barrier-repair progress?
_ما تقدّمنا في إصلاح الحواجز الخرسانية؟_

**Answer (EN):** Target: 90% repaired by 2027 end. Current: 53% (+5.3% weekly).

**Answer (AR):** المستهدف: إصلاح 90% بنهاية 2027. الحالي: 53% (+5.3% أسبوعياً).

> _Data refs:_ `kpis[id=barriers_fixed]`

---

### `K-04` Which KPI is furthest behind?
_أي مستهدف هو الأكثر تأخراً؟_

**Answer (EN):** Greenery & median planting — only 19% of the 100% target so far, growing slowly at +1.4% per week.

**Answer (AR):** التشجير والجزر الوسطية — 19% فقط من المستهدف 100%، ينمو ببطء بمعدل +1.4% أسبوعياً.

> _Data refs:_ `kpis[id=greenery_added]`

---

### `K-05` Which KPI is most on track?
_أي مستهدف هو الأقرب للمسار المخطط؟_

**Answer (EN):** Damaged-barrier repair — 53% of a 90% target (≈59% of target) — the leading indicator.

**Answer (AR):** إصلاح الحواجز — 53% من مستهدف 90% (≈59% من المستهدف) — أعلى نسبة تحقيق.

> _Data refs:_ `kpis`

---

### `K-06` What is the building-compliance target?
_ما مستهدف امتثال المباني؟_

**Answer (EN):** 70% of buildings on the corridor compliant with the unified urban code by 2027 end. Currently at 22% (+2.1% weekly).

**Answer (AR):** 70% من المباني على المحور ممتثلة للكود العمراني الموحد بنهاية 2027. الحالي 22% (+2.1% أسبوعياً).

> _Data refs:_ `kpis[id=building_compliance]`

---

### `K-07` How many condemned buildings still need to be demolished?
_كم مبنى ملغى الصك ما زال يحتاج للهدم؟_

**Answer (EN):** We are at 28% of the 100% demolition target — about 72 percentage points remaining (proportional to the corridor’s total condemned-building inventory).

**Answer (AR):** وصلنا إلى 28% من مستهدف الهدم البالغ 100% — يتبقى نحو 72 نقطة مئوية (متناسبة مع مجموع المباني الملغاة على المحور).

> _Data refs:_ `kpis[id=condemned_demolished]`

---

### `K-08` What is the workshop-clearance target?
_ما مستهدف إزالة الورش غير النظامية؟_

**Answer (EN):** 100% of illegal workshops & warehouses cleared by 2027 end. At 41% so far, +6.0% per week — strongest weekly delta.

**Answer (AR):** إزالة 100% من الورش والمستودعات غير النظامية بنهاية 2027. الحالي 41%، +6.0% أسبوعياً — أعلى نسبة تغيّر أسبوعي.

> _Data refs:_ `kpis[id=illegal_workshops_removed]`

---

## 4. Findings — status
*الملاحظات — الحالة*

### `F-01` How many open findings are there in the PoC scope?
_كم عدد الملاحظات المفتوحة ضمن نطاق التجربة؟_

**Answer (EN):** Refer to findings_aggregate.open + in_progress + blocked counts.

**Answer (AR):** يُرجى الاطلاع على إجمالي findings_aggregate.open + in_progress + blocked.

> _Data refs:_ `findings_aggregate`

---

### `F-02` What is our overall closure rate?
_ما معدل الإغلاق الإجمالي؟_

**Answer (EN):** Computed as done / total. See findings_aggregate.done and findings_aggregate.total.

**Answer (AR):** يُحسب بـ done / total. انظر findings_aggregate.done و findings_aggregate.total.

> _Data refs:_ `findings_aggregate.done`, `findings_aggregate.total`

---

### `F-03` How many findings are currently blocked?
_كم ملاحظة متعثرة حالياً؟_

**Answer (EN):** See findings_aggregate.blocked. Each blocked item needs escalation in the joint working room.

**Answer (AR):** انظر findings_aggregate.blocked. كل بند متعثر يحتاج تصعيد في غرفة العمل المشتركة.

> _Data refs:_ `findings_aggregate.blocked`, `findings_aggregate.top_blockers`

---

### `F-04` Which high-severity findings are still open?
_ما الملاحظات عالية الخطورة ولا زالت مفتوحة؟_

**Answer (EN):** List from findings_aggregate.top_blockers (or filter all findings where severity=high and status≠done).

**Answer (AR):** انظر القائمة في findings_aggregate.top_blockers (أو رشّح كل الملاحظات بـ severity=high و status≠done).

> _Data refs:_ `findings_aggregate.top_blockers`, `findings_aggregate.high_severity_open`

---

### `F-05` Which distortion category has the most findings?
_أي تصنيف للتشوه يحوي أكثر عدد من الملاحظات؟_

**Answer (EN):** See findings_aggregate.by_category (largest entry).

**Answer (AR):** انظر findings_aggregate.by_category (أكبر إدخال).

> _Data refs:_ `findings_aggregate.by_category`

---

### `F-06` Which finding is closest to its deadline?
_أي ملاحظة هي الأقرب لتاريخ موعدها المستهدف؟_

**Answer (EN):** See findings_aggregate.top_blockers — the list is sorted by earliest target_date.

**Answer (AR):** انظر findings_aggregate.top_blockers — القائمة مرتبة بالأقرب موعداً.

> _Data refs:_ `findings_aggregate.top_blockers`

---

### `F-07` How many findings have been reopened more than once?
_كم ملاحظة أُعيد فتحها أكثر من مرة؟_

**Answer (EN):** Filter findings where reopenedCount > 1 — these indicate the same issue recurring (repeat-offender pattern).

**Answer (AR):** رشّح الملاحظات التي reopenedCount > 1 — هذه مؤشر على تكرار نفس المشكلة (نمط مخالف متكرر).

> _Data refs:_ `findings_aggregate`

---

### `F-08` What does ‘blocked’ status mean operationally?
_ماذا يعني وصف ‘متعثرة’ تشغيلياً؟_

**Answer (EN):** Work that cannot progress because of an external dependency (e.g., utility contractor not responding, owner notice unresolved, agency hand-off pending). These are the items the joint working room escalates first.

**Answer (AR):** أعمال لا يمكن تقدّمها بسبب اعتماد خارجي (مثل: مقاول مرافق غير مستجيب، إنذار مالك لم يُحل، انتقال صلاحيات بين الجهات معلق). هذه أولى البنود في غرفة العمل المشتركة للتصعيد.

> _Data refs:_ `findings_aggregate.blocked`, `glossary`

---

## 5. Findings — by zone
*الملاحظات — حسب النطاق*

### `Z-01` What is the situation in Zone 8?
_ما الوضع في النطاق 8؟_

**Answer (EN):** Phase 1, port stretch, high distortion density. Workshops belt with damaged median barriers and asphalt deterioration. Multiple agencies involved (JM, RGA, GDCD, Investment).

**Answer (AR):** المرحلة 1، قطاع الميناء، كثافة تشوه عالية. حزام ورش مع حواجز جزيرة وسطية متهالكة وتدهور سفلتة. عدة جهات مشاركة (JM, RGA, GDCD, Investment).

> _Data refs:_ `poc_zones[id=8]`

---

### `Z-02` What is the situation in Zone 35?
_ما الوضع في النطاق 35؟_

**Answer (EN):** Phase 3, middle stretch, high distortion density. Slum cluster (~42 condemned dwellings), distorted ad-board cluster, fuel-station code violations. Owned mostly by HCM and the Investment partner.

**Answer (AR):** المرحلة 3، القطاع الأوسط، كثافة تشوه عالية. تجمع عشوائيات (~42 مسكن ملغى)، فوضى لوحات إعلانية، مخالفات محطات وقود. مملوك غالباً لـ HCM وشريك الاستثمار.

> _Data refs:_ `poc_zones[id=35]`

---

### `Z-03` What is the situation in Zone 70?
_ما الوضع في النطاق 70؟_

**Answer (EN):** Phase 5, Haram approach, high distortion density. Prince Nayef Bridge perimeter restoration, inspection-point upgrade, barrier replacement. Highest leadership scrutiny before Hajj.

**Answer (AR):** المرحلة 5، مدخل الحرم، كثافة تشوه عالية. إعادة تأهيل حرم كبري الأمير نايف، تطوير نقطة التفتيش، استبدال الحواجز. أعلى تدقيق قيادي قبل الحج.

> _Data refs:_ `poc_zones[id=70]`

---

### `Z-04` How many findings does Zone 8 have and how many are open?
_كم عدد ملاحظات النطاق 8 وكم منها مفتوحة؟_

**Answer (EN):** Use poc_zones[id=8].findings_total and findings_open.

**Answer (AR):** استخدم poc_zones[id=8].findings_total و findings_open.

> _Data refs:_ `poc_zones[id=8]`

---

### `Z-05` Which PoC zone has the highest number of high-severity findings?
_أي نطاق تجريبي يحوي أكثر ملاحظات عالية الخطورة؟_

**Answer (EN):** Compare poc_zones[*].findings_high_severity.

**Answer (AR):** قارن poc_zones[*].findings_high_severity.

> _Data refs:_ `poc_zones`

---

### `Z-06` Are there bridges in any PoC zone?
_هل توجد كباري في أي نطاق تجريبي؟_

**Answer (EN):** Yes — Zone 70 contains Prince Nayef Bridge (approach). Asset type ‘bridge’ also appears in poc_zones[id=70].asset_count_by_type.

**Answer (AR):** نعم — النطاق 70 يحوي كبري الأمير نايف (المدخل). نوع الأصل ‘bridge’ يظهر أيضاً في poc_zones[id=70].asset_count_by_type.

> _Data refs:_ `poc_zones[id=70].asset_count_by_type`

---

### `Z-07` What can you tell me about Zone 50?
_ماذا يمكنك إخباري عن النطاق 50؟_

**Answer (EN):** Zone 50 is in Phase 4 (Z46–Z60), middle sub-stretch. PoC data has not been injected for it yet — return the scope_notes.out_of_scope_response.

**Answer (AR):** النطاق 50 ضمن المرحلة 4 (Z46–Z60)، القطاع الأوسط. لم تُحقَن بيانات تجريبية له بعد — أعد الإجابة scope_notes.out_of_scope_response.

> _Data refs:_ `corridor.phases`, `corridor.sub_stretches`, `scope_notes`

---

### `Z-08` Which assets are in Zone 35?
_ما الأصول الموجودة في النطاق 35؟_

**Answer (EN):** Slum-area boundary, Service Plaza #4 (fuel station), and a planned median-landscaping strip. See poc_zones[id=35].asset_count_by_type.

**Answer (AR):** حدود منطقة عشوائيات، مجمع الخدمة رقم 4 (وقود)، وشريط تنسيق وسطي مخطط. انظر poc_zones[id=35].asset_count_by_type.

> _Data refs:_ `poc_zones[id=35].asset_count_by_type`

---

## 6. Agencies & governance
*الجهات والحوكمة*

### `A-01` Which agencies are involved on the MBS Road?
_أي جهات مشاركة في المحور؟_

**Answer (EN):** Seven: Ministry of Municipalities & Housing (MoMAH — governance), Holy Capital Municipality (HCM), Jeddah Municipality (JM), Roads General Authority (RGA), General Department of Traffic (GDT), General Directorate of Civil Defense (GDCD), and a private-sector investment partner.

**Answer (AR):** سبع: وزارة البلديات والإسكان (MoMAH — الحوكمة)، أمانة العاصمة المقدسة (HCM)، أمانة جدة (JM)، الهيئة العامة للطرق (RGA)، الإدارة العامة للمرور (GDT)، المديرية العامة للدفاع المدني (GDCD)، وشريك استثمار من القطاع الخاص.

> _Data refs:_ `agencies`

---

### `A-02` Which agency owns the most findings overall?
_أي جهة تمتلك أكبر عدد من الملاحظات؟_

**Answer (EN):** Take the largest entry of findings_aggregate.by_agency.

**Answer (AR):** انظر أكبر إدخال في findings_aggregate.by_agency.

> _Data refs:_ `findings_aggregate.by_agency`

---

### `A-03` Which agency has the most blocked items?
_أي جهة لديها أكثر بنود متعثرة؟_

**Answer (EN):** Compare agencies[*].blocked_findings_count and take the max.

**Answer (AR):** قارن agencies[*].blocked_findings_count وخذ الأعلى.

> _Data refs:_ `agencies`

---

### `A-04` Why does the report say governance is one of the four root causes?
_لماذا يقول التقرير إن الحوكمة هي أحد الأسباب الجذرية الأربعة؟_

**Answer (EN):** Because no single authority oversees the corridor end-to-end — 4 agencies in maintenance, 7 in infrastructure projects, 3 in studies, 4 in private-sector projects. Roles overlap and there is no joint operations room (slide 9).

**Answer (AR):** لأنه لا توجد جهة واحدة مشرفة على المحور كاملاً — 4 جهات في الصيانة، 7 في البنية التحتية، 3 في الدراسات، 4 في القطاع الخاص. تتداخل الأدوار ولا توجد غرفة عمليات مشتركة (شريحة 9).

> _Data refs:_ `agencies`

---

### `A-05` What is the proposed governance fix?
_ما الحل الحوكمي المقترح؟_

**Answer (EN):** An independent program led by MoMAH that joins HCM (Makkah) and Jeddah Municipality in a shared working room with mandates for findings remediation and stakeholder coordination.

**Answer (AR):** برنامج مستقل بقيادة MoMAH يجمع HCM (مكة) وأمانة جدة في غرفة عمل مشتركة بصلاحيات معالجة الملاحظات وتنسيق أصحاب المصلحة.

> _Data refs:_ `agencies`

---

### `A-06` Who is responsible for greenery and ad-board concessions?
_من المسؤول عن التشجير وامتيازات اللوحات الإعلانية؟_

**Answer (EN):** The private-sector investment partner (PIF/PPP), under MoMAH oversight.

**Answer (AR):** شريك الاستثمار من القطاع الخاص (PIF/PPP)، تحت إشراف MoMAH.

> _Data refs:_ `agencies[id=investment]`

---

## 7. Budget
*الميزانية*

### `B-01` How much development budget is committed in Zone 8?
_كم حجم ميزانية التطوير الملتزم بها في النطاق 8؟_

**Answer (EN):** See poc_zones[id=8].budget_committed_sar (SAR).

**Answer (AR):** انظر poc_zones[id=8].budget_committed_sar (ر.س).

> _Data refs:_ `poc_zones[id=8]`

---

### `B-02` What share of the Zone 8 budget has been spent?
_ما نسبة الإنفاق من ميزانية النطاق 8؟_

**Answer (EN):** Compute poc_zones[id=8].budget_spent_sar / budget_committed_sar.

**Answer (AR):** احسب poc_zones[id=8].budget_spent_sar / budget_committed_sar.

> _Data refs:_ `poc_zones[id=8]`

---

### `B-03` Which PoC zone has the largest committed budget?
_أي نطاق تجريبي لديه أكبر ميزانية ملتزمة؟_

**Answer (EN):** Compare poc_zones[*].budget_committed_sar.

**Answer (AR):** قارن poc_zones[*].budget_committed_sar.

> _Data refs:_ `poc_zones`

---

### `B-04` What is the total committed development budget across all PoC zones?
_ما إجمالي ميزانية التطوير الملتزم بها لكل نطاقات التجربة؟_

**Answer (EN):** Sum of poc_zones[*].budget_committed_sar.

**Answer (AR):** مجموع poc_zones[*].budget_committed_sar.

> _Data refs:_ `poc_zones`

---

## 8. Hajj readiness
*جاهزية الحج*

### `H-01` How many days until the next Hajj season?
_كم يوماً متبقياً حتى موسم الحج القادم؟_

**Answer (EN):** See hajj_readiness.days_remaining and hajj_readiness.next_hajj_date.

**Answer (AR):** انظر hajj_readiness.days_remaining و hajj_readiness.next_hajj_date.

> _Data refs:_ `hajj_readiness`

---

### `H-02` Are we on track for Hajj?
_هل نحن ضمن المسار المخطط للحج؟_

**Answer (EN):** Return hajj_readiness.summary_en / summary_ar — derived from average KPI progress vs target.

**Answer (AR):** أعد hajj_readiness.summary_en / summary_ar — مشتق من متوسط تقدّم المستهدفات.

> _Data refs:_ `hajj_readiness`, `kpis`

---

### `H-03` What short-term work must be done before Hajj?
_ما الأعمال قصيرة المدى التي يجب إنجازها قبل الحج؟_

**Answer (EN):** Per the report (slide 12): intensify contractor oversight, clear illegal workshops & yards, fix concrete barriers, improve appearance of inspection points along the corridor.

**Answer (AR):** حسب التقرير (شريحة 12): تكثيف الرقابة على المقاولين، إزالة الورش والمستودعات غير النظامية، إصلاح الحواجز الخرسانية، تحسين مظهر نقاط التفتيش على امتداد المحور.

> _Data refs:_ `kpis`

---

### `H-04` Which zone is the highest priority for Hajj readiness?
_أي نطاق له أعلى أولوية لجاهزية الحج؟_

**Answer (EN):** Zone 70 — Prince Nayef Bridge approach is the pilgrim entry; bridge perimeter and inspection-point appearance directly shape the welcome experience.

**Answer (AR):** النطاق 70 — مدخل كبري الأمير نايف هو مدخل الحجاج؛ حرم الكبري ومظهر نقطة التفتيش يحددان مباشرةً تجربة الترحيب.

> _Data refs:_ `poc_zones[id=70]`

---

## 9. Activity types
*أنواع الأنشطة*

### `T-01` What is a ‘development activity’?
_ما هو ‘النشاط التطويري’؟_

**Answer (EN):** Major capital fixes from the report’s primary findings — e.g., new fuel station, demolish workshops, replace barriers, bridge restoration. Has a budget, contractor, target date.

**Answer (AR):** أعمال رأسمالية كبيرة من الملاحظات الأساسية في التقرير — مثل: محطة وقود جديدة، هدم ورش، استبدال حواجز، تأهيل كبري. لها ميزانية، مقاول، تاريخ مستهدف.

> _Data refs:_ `glossary`

---

### `T-02` What is an ‘operational activity’?
_ما هو ‘النشاط التشغيلي’؟_

**Answer (EN):** Day-to-day inspector findings — mostly visual-distortion items. Short cycle (Open → Assigned → Fixed → Verified). No major budget; has an inspector name and may have a reopen count.

**Answer (AR):** ملاحظات مفتشين يومية — معظمها تشوه بصري. دورة قصيرة (مفتوحة → مُسندة → مُصلحة → مُتحقق منها). بلا ميزانية كبيرة؛ لها اسم مفتش وقد يكون لها عدد مرات إعادة فتح.

> _Data refs:_ `glossary`

---

### `T-03` How many development vs operational items are tracked?
_كم عدد البنود التطويرية مقابل التشغيلية؟_

**Answer (EN):** See findings_aggregate.by_activity_type.

**Answer (AR):** انظر findings_aggregate.by_activity_type.

> _Data refs:_ `findings_aggregate.by_activity_type`

---

### `T-04` When an operational finding keeps recurring (same workshop oil-spill 3rd time), what does that mean?
_إذا تكررت ملاحظة تشغيلية (نفس ورشة تسرّب الزيت للمرة الثالثة)، ماذا يعني ذلك؟_

**Answer (EN):** It is a ‘repeat-offender’ pattern. The reopenedCount metric flags it. These cases typically need escalation from operational handling to a development-style decision (e.g., demolition or licensing review).

**Answer (AR):** هذا نمط ‘مخالف متكرر’. مؤشّر reopenedCount يرصده. تحتاج هذه الحالات عادةً للتصعيد من المعالجة التشغيلية إلى قرار تطويري (مثل: هدم أو مراجعة ترخيص).

> _Data refs:_ `findings_aggregate`

---

## 10. Scope & safety
*النطاق والسلامة*

### `X-01` Can you answer questions about Riyadh roads or other cities?
_هل تستطيع الإجابة عن طرق الرياض أو مدن أخرى؟_

**Answer (EN):** No — this agent is scoped to the MBS Road corridor (Jeddah → Makkah) in the Makkah region. Anything outside that scope, decline politely and remind the user of the corridor.

**Answer (AR):** لا — هذا الوكيل محصور بمحور طريق الأمير محمد بن سلمان (جدة → مكة) في منطقة مكة المكرمة. أي طلب خارج هذا النطاق، اعتذر بأدب وذكّر المستخدم بنطاق المحور.

> _Data refs:_ `corridor`, `scope_notes`

---

### `X-02` Do you have data for zones outside Z8, Z35, Z70?
_هل توجد بيانات لنطاقات خارج Z8 و Z35 و Z70؟_

**Answer (EN):** Not yet. Return scope_notes.out_of_scope_response and offer the zone’s phase + sub-stretch if asked.

**Answer (AR):** ليس بعد. أعد scope_notes.out_of_scope_response واعرض المرحلة والقطاع الجغرافي إذا طُلب.

> _Data refs:_ `scope_notes`

---

### `X-03` Is the data in this PoC real?
_هل البيانات في هذه التجربة حقيقية؟_

**Answer (EN):** No — all findings, budgets, inspector names, and KPI percentages are synthetic, generated to demonstrate the platform. Real data will be loaded after sign-off.

**Answer (AR):** لا — جميع الملاحظات والميزانيات وأسماء المفتشين ونسب المستهدفات بيانات تجريبية أُنشئت لعرض المنصة. ستُحمَّل البيانات الحقيقية بعد الاعتماد.

> _Data refs:_ `scope_notes`

---


→ Continue to [07 · Facts Snapshot (JSON)](07-facts-snapshot.json)
