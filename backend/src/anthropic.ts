// Builds the cached Rashid system prompt and exposes a single chat() helper.
// The knowledge base lives in the SQLite seed; we compile it into a stable
// string and cache it via prompt caching so every turn after the first only
// pays for the volatile user message.
import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "./db/connection.js";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

let _client: Anthropic | null = null;
let _systemEn: string | null = null;
let _systemAr: string | null = null;

export function hasApiKey(): boolean {
  const k = process.env.ANTHROPIC_API_KEY;
  return !!k && !k.includes("PLACEHOLDER");
}

function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

// Re-build the knowledge base from the DB. Stable across requests, so it caches.
function buildSystemPrompt(lang: "en" | "ar"): string {
  const db = getDb();
  const ash = "ash-shati-ash-sharqi";
  const district = db.prepare(`SELECT * FROM districts WHERE id = ?`).get(ash) as any;
  const kpis = db.prepare(`SELECT * FROM district_kpis WHERE district_id = ? ORDER BY id`).all(ash) as any[];
  const insights = db.prepare(`SELECT * FROM insights WHERE district_id = ? ORDER BY position`).all(ash) as any[];
  const layers = db.prepare(`SELECT * FROM gis_layers WHERE district_id = ? ORDER BY id`).all(ash) as any[];
  const keywords = db.prepare(`SELECT * FROM keywords WHERE district_id = ? ORDER BY trigger_word`).all(ash) as any[];
  const qa = db.prepare(`SELECT * FROM qa_bank WHERE district_id = ? ORDER BY position`).all(ash) as any[];
  const cities = db.prepare(`SELECT * FROM multi_city_stats ORDER BY area_2025 DESC`).all() as any[];
  const subAreas = db.prepare(`SELECT * FROM sub_areas`).all() as any[];

  const isAr = lang === "ar";
  const t = (en: string, ar: string) => (isAr ? ar : en);

  const lines: string[] = [];
  lines.push(t(
    "You are Rashid, the Digital GIS Employee for Saudi Arabia's Ministry of Municipalities and Housing (MOMAH). You cover three independent datasets at the same time: (1) the Ash Shati Ash Sharqi coastal district in Dammam, with full 19-layer GIS detail; (2) six major Saudi cities with year-over-year urban-expansion analysis and synthesized 19-layer counts; (3) the Al-Seh sub-area inside Al-Ahsa governorate.",
    "أنت راشد، الموظف الرقمي للنظم الجغرافية في وزارة البلديات والإسكان السعودية. تغطي ثلاث مجموعات بيانات مستقلة: (1) حي الشاطئ الشرقي الساحلي في الدمام، بتفاصيل كاملة لـ19 طبقة جغرافية؛ (2) ست مدن سعودية رئيسية مع تحليل التوسع العمراني السنوي وأعداد طبقات مولّدة؛ (3) منطقة السيح ضمن محافظة الأحساء."
  ));
  lines.push("");
  lines.push(t("ANSWERING POLICY — never refuse, always answer, never reveal sourcing:", "سياسة الإجابة — لا ترفض أبداً، أجب دائماً، ولا تكشف المصدر:"));
  lines.push(t(
    "1. FIRST exhaust the local knowledge base below — district details, KPIs, layer counts, insights, keywords, Q&A bank, multi-city expansion data, sub-area metrics. The per-district 19-layer counts cover all 8 districts; check them carefully before assuming data is missing.",
    "1. أولاً استنفد قاعدة المعرفة المحلية أدناه. أعداد الطبقات الـ19 تغطي جميع الأحياء الثمانية؛ تحقق منها بعناية قبل افتراض عدم توفر البيانات."
  ));
  lines.push(t(
    "2. If the local KB does NOT contain the specific fact, seamlessly use your own general knowledge to give the user an informed answer. Do not refuse, do not say 'outside my knowledge base'.",
    "2. إذا لم تحتوِ قاعدة المعرفة المحلية على الحقيقة المحددة، استخدم معرفتك العامة بسلاسة لتقديم إجابة مفيدة. لا ترفض ولا تقل 'خارج قاعدة معرفتي'."
  ));
  lines.push(t(
    "3. NEVER label or flag the source of the answer. Do not write '📊 From Rashid's knowledge base' or '🌐 From general knowledge'. Do not mention 'training data', 'cached knowledge base', 'general world knowledge', or any other phrase that exposes where the answer came from. Just give the user a clean, confident answer as if you knew it natively.",
    "3. لا تذكر مصدر الإجابة أبداً. لا تكتب '📊 من قاعدة معرفة راشد' أو '🌐 من المعرفة العامة'. لا تذكر 'بيانات التدريب' أو 'قاعدة المعرفة المخزنة' أو 'المعرفة العامة' أو أي عبارة تكشف من أين جاءت الإجابة. قدّم إجابة نظيفة وواثقة كأنك تعرفها أصلاً."
  ));
  lines.push(t(
    "4. For numbers you're uncertain about (recent stats, estimates), state your best figure naturally and only mention 'verify with the latest official source' when the user explicitly asks about freshness or sourcing.",
    "4. للأرقام التي لست متأكداً منها (إحصائيات حديثة وتقديرات)، اذكر أفضل رقم بشكل طبيعي ولا تذكر 'التحقق من المصدر الرسمي' إلا إذا سأل المستخدم صراحة عن الحداثة أو المصدر."
  ));
  lines.push(t(
    "5. STAY ON SCOPE. When the user asks about ONE specific district/city (e.g., Riyadh, Jeddah, Al-Seh, Madinah), answer ONLY about that district. Do NOT add comparison tables with Ash Shati Ash Sharqi, do NOT note 'compared to Ash Shati', do NOT include other districts as 'reference' or 'baseline'. Ash Shati is just one of the eight districts — it is NOT a master reference. Only mention multiple districts when the user explicitly asks for a comparison.",
    "5. التزم بنطاق السؤال. عندما يسأل المستخدم عن حي/مدينة واحدة بعينها (مثل الرياض، جدة، السيح، المدينة)، أجب فقط عن ذلك الحي. لا تُضِف جداول مقارنة مع الشاطئ الشرقي، ولا تكتب 'مقارنةً بالشاطئ الشرقي'، ولا تذكر أحياء أخرى كـ'مرجع' أو 'خط أساس'. الشاطئ الشرقي مجرد واحد من الأحياء الثمانية — وليس مرجعاً رئيسياً. اذكر عدة أحياء فقط عندما يطلب المستخدم المقارنة صراحةً."
  ));
  lines.push("");
  lines.push(t("DISAMBIGUATE BEFORE ANSWERING:", "وضِّح النطاق قبل الإجابة:"));
  lines.push(t(
    "- If the user's question references 'this district', 'the city', 'here', 'the area', or any other ambiguous scope WITHOUT naming a specific dataset, DO NOT assume Ash Shati Ash Sharqi. Ask which scope they mean and offer the available options as a short bulleted list.",
    "- إذا أشار سؤال المستخدم إلى 'هذا الحي' أو 'المدينة' أو 'هنا' أو 'المنطقة' أو أي نطاق غامض دون تسمية مجموعة بيانات محددة، فلا تفترض الشاطئ الشرقي. اسأل أي نطاق يقصد واعرض الخيارات المتاحة كقائمة نقطية قصيرة."
  ));
  lines.push(t(
    "- For example, if asked 'What is the population of this district?', reply with a brief clarifying question listing the three scopes (Ash Shati Ash Sharqi · 6 major cities · Al-Seh sub-area) and ask which one the user wants.",
    "- على سبيل المثال، إذا سُئلت 'ما عدد سكان هذا الحي؟'، فأجب بسؤال توضيحي قصير يعدد النطاقات الثلاثة (الشاطئ الشرقي · 6 مدن رئيسية · منطقة السيح) واسأل أيّها يريد المستخدم."
  ));
  lines.push(t(
    "- If the user names a scope explicitly (e.g., 'Ash Shati', 'Riyadh', 'Al-Seh', 'multi-cities'), answer directly without asking.",
    "- إذا سمّى المستخدم النطاق صراحةً (مثل 'الشاطئ الشرقي' أو 'الرياض' أو 'السيح' أو 'المدن المتعددة')، فأجب مباشرةً دون سؤال."
  ));
  lines.push(t(
    "- If the question is genuinely cross-cutting (e.g., 'Compare healthcare gaps across all districts'), answer for every applicable scope in a single response.",
    "- إذا كان السؤال شاملاً فعلاً (مثل 'قارن فجوات الرعاية الصحية عبر جميع الأحياء')، فأجب لكل نطاق مناسب في رد واحد."
  ));
  lines.push("");
  lines.push(t("RESPONSE STYLE — render rich markdown:", "أسلوب الرد — استخدم تنسيق markdown غني:"));
  lines.push(t(
    "- Lead with the headline number or finding in bold.",
    "- ابدأ بالرقم أو النتيجة الرئيسية بخط عريض."
  ));
  lines.push(t(
    "- Use **markdown tables** for comparisons (current vs benchmark, before vs after, multi-row data).",
    "- استخدم **جداول markdown** للمقارنات (الحالي مقابل المعيار، قبل وبعد، البيانات متعددة الصفوف)."
  ));
  lines.push(t(
    "- Use ## headings to break a long answer into sections.",
    "- استخدم العناوين ## لتقسيم الإجابات الطويلة إلى أقسام."
  ));
  lines.push(t(
    "- Use bullet lists for 3+ items; bold the lead clause of each bullet.",
    "- استخدم القوائم النقطية لـ3 عناصر أو أكثر؛ اجعل بداية كل نقطة بخط عريض."
  ));
  lines.push(t(
    "- Cite WHO / NFPA / Saudi benchmarks whenever the topic touches schools, healthcare, lighting, fire safety, or green space.",
    "- استشهد بمعايير منظمة الصحة العالمية / NFPA / السعودية كلما تعلق الأمر بالمدارس أو الصحة أو الإنارة أو السلامة من الحرائق أو المساحات الخضراء."
  ));
  lines.push(t(
    "- End with one or two short follow-up suggestions in a > blockquote, prefixed with 'Try also:'.",
    "- اختم باقتراح أو اقتراحين كأسئلة متابعة في اقتباس > تبدأ بـ 'جرّب أيضاً:'."
  ));
  lines.push(t(
    "- Default to English unless the user writes in Arabic.",
    "- اجعل اللغة الافتراضية الإنجليزية ما لم يكتب المستخدم بالعربية."
  ));
  lines.push("");

  // ===== Dataset 1: Ash Shati =====
  lines.push("=".repeat(60));
  lines.push(t("DATASET 1 — Ash Shati Ash Sharqi (الشاطئ الشرقي), Dammam", "مجموعة البيانات 1 — الشاطئ الشرقي، الدمام"));
  lines.push("=".repeat(60));
  lines.push(`Code: ${district.id} (00500001062) · Parent: ${district.parent} · Municipality: ${district.municipality}`);
  lines.push(`Population: ${district.population.toLocaleString()} · Area: ${district.area_km2} km² · Perimeter: ${district.perimeter_km} km`);
  lines.push(`Data validated: ${district.data_validated_at}`);
  lines.push(district.summary_en);
  lines.push("");

  lines.push(`KPIs (${kpis.length}):`);
  for (const k of kpis) {
    const v = k.value % 1 === 0 ? k.value.toLocaleString() : k.value.toString();
    lines.push(`  - ${k.label_en}: ${v}${k.unit ? " " + k.unit : ""}${k.severity ? ` [${k.severity}]` : ""}`);
  }
  lines.push("");

  lines.push(`10 KEY INSIGHTS (severity-coded):`);
  for (const i of insights) {
    lines.push(`  ${i.position}. [${i.severity}] ${i.title_en}`);
    lines.push(`     Metric: ${i.metric}${i.benchmark ? " — Benchmark: " + i.benchmark : ""}`);
    lines.push(`     ${i.body_en}`);
  }
  lines.push("");

  lines.push(`19 GIS LAYERS (${layers.length} total, 9,416 features):`);
  for (const l of layers) {
    lines.push(`  - ${l.name_en} (${l.geometry_type}, ${l.feature_count.toLocaleString()} features) — ${l.description_en}`);
  }
  lines.push("");

  lines.push(`KEYWORD CHEAT-SHEET (24 trigger phrases that produce structured answers):`);
  for (const k of keywords) lines.push(`  - ${k.trigger_word}`);
  lines.push("");

  lines.push(`Q&A BANK (43 model answers across 10 categories):`);
  let lastCat = "";
  for (const q of qa) {
    if (q.category !== lastCat) {
      lines.push(`  [${q.category}]`);
      lastCat = q.category;
    }
    lines.push(`  Q${q.position}: ${q.question_en}`);
    lines.push(`     A: ${q.answer_en}`);
  }
  lines.push("");

  // ===== Dataset 2: Major cities expansion =====
  lines.push("=".repeat(60));
  lines.push(t("DATASET 2 — Major Saudi Cities Urban Expansion (2024 vs 2025)", "مجموعة البيانات 2 — التوسع العمراني للمدن السعودية الرئيسية (2024 مقابل 2025)"));
  lines.push("=".repeat(60));
  for (const c of cities) {
    lines.push(`  - ${c.name} (${c.name_ar}): ${c.area_2024} → ${c.area_2025} km² (+${c.expansion} km², ${c.growth_pct}% growth)`);
  }
  const totalExp = cities.reduce((s, c) => s + (c.expansion as number), 0);
  const avgGrowth = cities.reduce((s, c) => s + (c.growth_pct as number), 0) / cities.length;
  lines.push(`  Total expansion: ${totalExp} km² · Average growth: ${avgGrowth.toFixed(2)}%`);
  lines.push("");

  // ===== Dataset 2b: Per-district 19-layer counts =====
  // Every city + Al-Seh + Ash Shati has a full set of layer counts in the
  // gis_layers table (synthetic for non-Ash-Shati districts, real for Ash Shati).
  // We surface them so Rashid can answer "how many mosques in Jeddah?" etc.
  lines.push("=".repeat(60));
  lines.push(t(
    "PER-DISTRICT 19-LAYER COUNTS — every district has the same standard counts",
    "أعداد الطبقات الـ19 لكل حي — كل حي يحتوي على نفس العدّ المعياري"
  ));
  lines.push("=".repeat(60));
  const allDistricts = db
    .prepare(
      `SELECT id, name, name_ar, kind, parent, population, area_km2 FROM districts
       WHERE id IN ('ash-shati-ash-sharqi','riyadh','jeddah','dammam','makkah','madinah','al-ahsa','al-seh')`,
    )
    .all() as any[];
  const layerStmt = db.prepare(
    `SELECT layer_key, name_en, feature_count FROM gis_layers WHERE district_id = ? ORDER BY id`,
  );
  for (const d of allDistricts) {
    const dl = layerStmt.all(d.id) as any[];
    lines.push("");
    lines.push(`> ${d.name} (${d.name_ar}) · ${d.kind} · pop ${d.population?.toLocaleString() ?? "—"} · ${d.area_km2?.toLocaleString() ?? "—"} km²`);
    for (const l of dl) {
      lines.push(`    ${l.name_en}: ${(l.feature_count as number).toLocaleString()}`);
    }
  }
  lines.push("");

  // ===== Dataset 3: Al-Seh sub-area =====
  lines.push("=".repeat(60));
  lines.push(t("DATASET 3 — Al-Seh Sub-area (السيح, inside Al-Ahsa governorate)", "مجموعة البيانات 3 — منطقة السيح (داخل محافظة الأحساء)"));
  lines.push("=".repeat(60));
  for (const a of subAreas) {
    lines.push(`  Plan: ${a.plan_name_en} (No. ${a.plan_number}) — ${a.municipality_en} Municipality`);
    lines.push(`  Period: ${a.baseline_year} → ${a.current_year}`);
    lines.push(`  Population: ${a.pop_baseline} → ${a.pop_current} (+${a.pop_growth_pct}%)`);
    lines.push(`  Residential land: ${a.res_ha_baseline} → ${a.res_ha_current} ha (+${a.res_ha_growth}%)`);
    lines.push(`  Vacant land: ${a.vac_ha_baseline} → ${a.vac_ha_current} ha (+${a.vac_ha_growth}%)`);
    lines.push(`  Density: ${a.density_baseline} → ${a.density_current} p/ha (+${a.density_growth}%)`);
    lines.push(`  Recommendation: ${a.rec_direction} ${a.rec_hectares} ha (${a.rec_confidence} confidence)`);
  }
  lines.push("");

  return lines.join("\n");
}

function getSystemPrompt(lang: "en" | "ar"): string {
  if (lang === "ar") {
    if (!_systemAr) _systemAr = buildSystemPrompt("ar");
    return _systemAr;
  }
  if (!_systemEn) _systemEn = buildSystemPrompt("en");
  return _systemEn;
}

export interface ChatRequest {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  lang: "en" | "ar";
  matchedKeyword?: string | null;
}

export interface ChatResponse {
  reply: string;
  source: "anthropic" | "no-api-key";
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
  };
}

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  if (!hasApiKey()) {
    return {
      reply:
        req.lang === "ar"
          ? "تكوين Anthropic API غير مكتمل. أضف ANTHROPIC_API_KEY الفعلي في backend/.env لتفعيل المحادثة الكاملة. في هذه الأثناء، استخدم الكلمات المفتاحية المحفِّزة للحصول على إجابات سريعة."
          : "Anthropic API isn't configured. Add a real ANTHROPIC_API_KEY to backend/.env to enable full chat. Meanwhile, try the keyword triggers for instant canned answers.",
      source: "no-api-key",
    };
  }

  const client = getClient();
  const system = getSystemPrompt(req.lang);

  // Build the message list. The system prompt is the stable cached prefix.
  const messages: Anthropic.MessageParam[] = [
    ...req.history.map((m) => ({ role: m.role, content: m.content }) as Anthropic.MessageParam),
    { role: "user", content: req.message },
  ];

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: system,
          cache_control: { type: "ephemeral" }, // 5-min TTL — knowledge base reused across turns
        },
      ],
      messages,
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    return {
      reply: textBlock?.text ?? "",
      source: "anthropic",
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_creation_input_tokens: response.usage.cache_creation_input_tokens ?? 0,
        cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
      },
    };
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return {
        reply:
          req.lang === "ar"
            ? "مفتاح Anthropic API غير صالح. تحقق من backend/.env."
            : "The Anthropic API key was rejected. Check backend/.env.",
        source: "no-api-key",
      };
    }
    if (err instanceof Anthropic.RateLimitError) {
      return {
        reply:
          req.lang === "ar"
            ? "تم تجاوز حد المعدل لـ Anthropic. حاول بعد قليل."
            : "Rate-limited by Anthropic. Try again in a moment.",
        source: "anthropic",
      };
    }
    if (err instanceof Anthropic.APIError) {
      return {
        reply: `Anthropic API error ${err.status}: ${err.message}`,
        source: "anthropic",
      };
    }
    throw err;
  }
}
