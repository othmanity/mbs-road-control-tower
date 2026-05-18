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
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { facts } from "../src/kb/facts";
import { kbQuestions } from "../src/kb/questions";

// Load the consolidated KB markdown bundle (the same content as the PDF).
// Files are concatenated in numeric order: README → 00 → 01 → … → 06.
// File 07 (facts JSON) is injected separately below via `facts`.
const KB_MARKDOWN_DIR = path.resolve(process.cwd(), "MBS Road Control Tower");
function loadKbMarkdown(): string {
  if (!existsSync(KB_MARKDOWN_DIR)) {
    console.warn(`[mbs-ct] KB folder not found at ${KB_MARKDOWN_DIR}`);
    return "";
  }
  const files = readdirSync(KB_MARKDOWN_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort(); // alphabetical = numeric order (README first, then 00..06)
  return files
    .map((f) => {
      const body = readFileSync(path.join(KB_MARKDOWN_DIR, f), "utf-8");
      return `\n\n=========================================\n  FILE: ${f}\n=========================================\n\n${body}`;
    })
    .join("\n");
}
const KB_MARKDOWN = loadKbMarkdown();

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
    kb_markdown_chars: KB_MARKDOWN.length,
  });
});

// ---- System prompt builder ---------------------------------------------
function buildSystemPrompt(_lang: "en" | "ar"): string {
  const factsJson = JSON.stringify(facts, null, 2);

  return `You are the MBS Road Control Tower Agent — a leadership-facing assistant for the Saudi Ministry of Municipalities & Housing (MoMAH) overseeing the Prince Mohammed bin Salman Road corridor (Jeddah → Makkah, 75 km, 170,000+ vehicles/day).

YOUR SCOPE
- ONLY answer questions about the MBS Road corridor, its 75 zones, 5 rollout phases, 3 geographic sub-stretches, findings, KPIs, agencies, budget, governance, glossary terms, and Hajj readiness.
- For anything outside this scope, politely decline in one short sentence and remind the user of your scope.
- Synthetic PoC data is ONLY populated for zones 8, 35, and 70. For any other zone, share the zone's phase and sub-stretch only and note that data isn't loaded yet.

ANSWER STYLE
- Match the user's language. If they write in Arabic, answer in Arabic. If English, answer in English.
- Be concise and leadership-grade. Use bullet points and bold for key numbers when it helps scannability.
- Ground every answer in the KNOWLEDGE BASE and FACTS SNAPSHOT below. Never invent zone IDs, budgets, agencies, or KPI numbers that aren't in those sources.
- When you cite a number, anchor it (e.g., "53% of the 90% target" not just "53%").
- When relevant, cite which KB section your answer is drawn from (e.g., "(see 03 · Zones)" or "(see 04 · Agencies & Governance)").
- Use dates as given. Don't translate or re-calculate dates.
- Disclaimer if asked whether the data is real: this is synthetic PoC data, not live operational data.

PRIORITY ORDER WHEN SOURCES SEEM TO DISAGREE
1. FACTS SNAPSHOT (canonical numbers, always)
2. KNOWLEDGE BASE markdown (narrative, governance, glossary, Q&A reference)

===========================================
KNOWLEDGE BASE — consolidated MBS Road Control Tower documentation
(same content as the leadership PDF; sections in numeric order)
===========================================

${KB_MARKDOWN}

===========================================
FACTS SNAPSHOT — canonical numeric source of truth (JSON)
===========================================

\`\`\`json
${factsJson}
\`\`\`
`;
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
