// MBS Road Control Tower Agent — backend
// Single-purpose Express server that proxies user questions to Claude,
// injecting the synthetic facts + KB Q&A pairs as the system prompt.
//
// In dev:  Vite proxies /api/* → http://localhost:3001
// In prod: Vercel frontend calls https://<railway-url>/api/* directly (CORS enabled)

import "dotenv/config";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { facts } from "../src/kb/facts";
import { kbQuestions } from "../src/kb/questions";

const PORT = Number(process.env.PORT ?? 3001);
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const API_KEY = process.env.ANTHROPIC_API_KEY;

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// ---- Health check -------------------------------------------------------
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    model: MODEL,
    api_key_present: Boolean(API_KEY),
    facts_generated_at: facts.generated_at,
    kb_questions: kbQuestions.length,
  });
});

// ---- System prompt builder ---------------------------------------------
function buildSystemPrompt(lang: "en" | "ar"): string {
  const factsJson = JSON.stringify(facts, null, 2);
  const qaList = kbQuestions
    .map((q) => `- [${q.id}] ${lang === "en" ? q.q_en : q.q_ar}`)
    .join("\n");

  return `You are the MBS Road Control Tower Agent — a leadership-facing assistant for the Saudi Ministry of Municipalities & Housing (MoMAH) overseeing the Prince Mohammed bin Salman Road corridor (Jeddah → Makkah, 75 km, 170,000+ vehicles/day).

YOUR SCOPE
- ONLY answer questions about the MBS Road corridor, its 75 zones, 5 rollout phases, 3 geographic sub-stretches, findings, KPIs, agencies, budget, and Hajj readiness.
- For anything outside this scope, politely decline in one short sentence and remind the user of your scope.
- Synthetic PoC data is ONLY populated for zones 8, 35, and 70. For any other zone, share the zone's phase and sub-stretch only and note that data isn't loaded yet.

ANSWER STYLE
- Match the user's language. If they write in Arabic, answer in Arabic. If English, answer in English.
- Be concise and leadership-grade. Use bullet points and bold for key numbers when it helps scannability.
- Use ONLY the FACTS snapshot below as the source of truth. Never invent zone IDs, budgets, agencies, or KPI numbers that aren't in the snapshot.
- When you cite a number, anchor it (e.g., "53% of the 90% target" not just "53%").
- Use Hijri/Gregorian dates as given. Don't translate or re-calculate dates.
- Disclaimer if asked about real data: this is synthetic PoC data, not live operational data.

FACTS SNAPSHOT (single source of truth — JSON)
\`\`\`json
${factsJson}
\`\`\`

REFERENCE QUESTIONS THE AGENT IS EXPECTED TO HANDLE
${qaList}

You may receive follow-up or rephrased versions of these reference questions. Always ground your answer in the FACTS snapshot above.`;
}

// ---- Streaming chat endpoint -------------------------------------------
app.post("/api/chat", async (req, res) => {
  const { message, lang = "en", history = [] } = req.body ?? {};
  if (typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "message (string) is required" });
    return;
  }
  if (!API_KEY) {
    res.status(503).json({
      error:
        "ANTHROPIC_API_KEY not set. Add it to .env (locally) or to Railway environment variables (in production).",
    });
    return;
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const client = new Anthropic({ apiKey: API_KEY });

  try {
    const systemPrompt = buildSystemPrompt(lang === "ar" ? "ar" : "en");

    const messages: Anthropic.MessageParam[] = [
      ...(Array.isArray(history)
        ? history
            .filter((m: { role: string; text: string }) => m.role === "user" || m.role === "agent")
            .map((m: { role: string; text: string }) => ({
              role: m.role === "agent" ? ("assistant" as const) : ("user" as const),
              content: m.text,
            }))
        : []),
      { role: "user", content: message },
    ];

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      // Prompt caching on the system block — saves cost across follow-up turns
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages,
    });

    stream.on("text", (delta) => {
      send("text", { delta });
    });

    const final = await stream.finalMessage();
    send("done", {
      stop_reason: final.stop_reason,
      usage: final.usage,
    });
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[chat] error:", message);
    send("error", { message });
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`[mbs-ct] backend listening on http://localhost:${PORT}`);
  console.log(`[mbs-ct] model: ${MODEL}`);
  console.log(`[mbs-ct] api key present: ${Boolean(API_KEY)}`);
});
