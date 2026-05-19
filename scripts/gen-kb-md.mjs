// One-shot: generate the bilingual Q&A markdown + facts snapshot JSON
// from the canonical TypeScript sources in src/kb/.
// Run: `npx tsx scripts/gen-kb-md.mjs`

import { writeFileSync } from "node:fs";
import { kbQuestions, kbCategoryLabels } from "../src/kb/questions.ts";
import { facts } from "../src/kb/facts.ts";

const OUT_DIR = "./MBS Road Control Tower";

// ---- 06-questions-and-answers.md ---------------------------------------
const grouped = {};
for (const q of kbQuestions) (grouped[q.category] ??= []).push(q);

let md = `# 06 · Questions & Answers

> **${kbQuestions.length} bilingual (EN+AR) Q&A pairs** the MBS Road Control Tower Agent must answer reliably.
> Each answer is grounded in the [Facts Snapshot](07-facts-snapshot.json) — the agent never invents numbers.

---

## Index

| # | Category | Questions |
|---|---|---|
`;

let idx = 1;
for (const [cat, items] of Object.entries(grouped)) {
  const label = kbCategoryLabels[cat];
  const slug = `${idx}-${label.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  md += `| ${String(idx).padStart(2, "0")} | [${label.en}](#${slug}) | ${items.length} |\n`;
  idx++;
}
md += `\n---\n\n`;

idx = 1;
for (const [cat, items] of Object.entries(grouped)) {
  const label = kbCategoryLabels[cat];
  md += `## ${idx}. ${label.en}\n\n${label.ar}\n\n`;
  for (const q of items) {
    // Arabic is written as a plain paragraph (no italics) so Word/Pages
    // render it cleanly with the document's Complex Script font.
    md += `### \`${q.id}\` ${q.q_en}\n\n`;
    md += `${q.q_ar}\n\n`;
    md += `**Answer (EN):** ${q.a_en}\n\n`;
    md += `**Answer (AR):** ${q.a_ar}\n\n`;
    md += `---\n\n`;
  }
  idx++;
}

md += `\n→ Continue to [07 · Facts Snapshot (JSON)](07-facts-snapshot.json)\n`;

writeFileSync(`${OUT_DIR}/06-questions-and-answers.md`, md);
console.log(`wrote ${kbQuestions.length} Q&A pairs → 06-questions-and-answers.md`);

// ---- 07-facts-snapshot.json --------------------------------------------
writeFileSync(`${OUT_DIR}/07-facts-snapshot.json`, JSON.stringify(facts, null, 2));
console.log(`wrote facts snapshot → 07-facts-snapshot.json`);
