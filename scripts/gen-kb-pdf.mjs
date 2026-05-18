// Build a single consolidated PDF of the MBS Road Control Tower
// knowledge base, rendered through system Chrome headless.
//
// Usage:  npx tsx scripts/gen-kb-pdf.mjs
// Output: MBS Road Control Tower/MBS-Road-Control-Tower-Knowledge-Base.pdf

import { readFileSync, writeFileSync, existsSync, mkdtempSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { marked } from "marked";

const KB_DIR = "MBS Road Control Tower";
const OUTPUT_PDF = path.join(KB_DIR, "MBS-Road-Control-Tower-Knowledge-Base.pdf");

const CHROME_BIN =
  process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : "google-chrome";

if (!existsSync(CHROME_BIN)) {
  console.error(`Chrome not found at: ${CHROME_BIN}`);
  process.exit(1);
}

// Pages in display order
const SECTIONS = [
  { file: "README.md",                            title: "Overview" },
  { file: "00-executive-summary.md",              title: "Executive Summary" },
  { file: "01-corridor-overview.md",              title: "Corridor Overview" },
  { file: "02-2027-targets.md",                   title: "2027 Targets" },
  { file: "03-zones.md",                          title: "Zones — PoC Detail" },
  { file: "04-agencies-and-governance.md",        title: "Agencies & Governance" },
  { file: "05-activity-types-and-glossary.md",    title: "Activity Types & Glossary" },
  { file: "06-questions-and-answers.md",          title: "Questions & Answers" },
];

// --- Build the combined HTML --------------------------------------------
marked.setOptions({ gfm: true, breaks: false });

const bodyHtml = SECTIONS.map((s, i) => {
  const md = readFileSync(path.join(KB_DIR, s.file), "utf-8");
  const html = marked.parse(md);
  return `<section class="kb-section${i === 0 ? " first" : ""}">${html}</section>`;
}).join("\n");

const now = new Date();
const dateStr = now.toISOString().slice(0, 10);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>MBS Road Control Tower — Knowledge Base</title>
<style>
  @page {
    size: A4;
    margin: 22mm 18mm 22mm 18mm;
    @bottom-center { content: "Page " counter(page) " of " counter(pages); font-size: 9pt; color: #9DB5AC; }
    @bottom-left { content: "MBS Road Control Tower — Knowledge Base"; font-size: 9pt; color: #9DB5AC; }
    @bottom-right { content: "${dateStr}"; font-size: 9pt; color: #9DB5AC; }
  }
  @page :first {
    margin: 0;
    @bottom-center { content: none; }
    @bottom-left { content: none; }
    @bottom-right { content: none; }
  }

  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  body {
    font-family: "Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #1a2129;
    margin: 0;
    padding: 0;
  }

  /* Arabic-aware fallback */
  :lang(ar), [lang="ar"], em:lang(ar), em[lang="ar"] {
    font-family: "Noto Naskh Arabic", "Geeza Pro", "Damascus", "Times New Roman", serif;
    font-size: 11pt;
    line-height: 1.7;
  }

  /* Cover page */
  .cover {
    page: cover;
    height: 297mm;
    background: linear-gradient(135deg, #066058 0%, #144D3F 100%);
    color: #fff;
    padding: 50mm 22mm 30mm 22mm;
    box-sizing: border-box;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .cover .tag {
    text-transform: uppercase;
    letter-spacing: 3px;
    font-size: 10pt;
    color: #ACDDC7;
    margin-bottom: 18mm;
  }
  .cover h1 {
    font-size: 36pt;
    line-height: 1.1;
    font-weight: 800;
    margin: 0 0 8mm 0;
    color: #fff;
  }
  .cover .ar {
    font-family: "Noto Naskh Arabic", "Geeza Pro", "Damascus", serif;
    font-size: 20pt;
    color: #ACDDC7;
    margin-bottom: 16mm;
    direction: rtl;
  }
  .cover .sub {
    font-size: 13pt;
    color: #d8efe5;
    line-height: 1.55;
    max-width: 130mm;
  }
  .cover .meta {
    border-top: 1px solid rgba(255,255,255,0.18);
    padding-top: 10mm;
    display: flex;
    justify-content: space-between;
    font-size: 10pt;
    color: #d8efe5;
  }
  .cover .meta b { color: #fff; font-weight: 700; }

  /* Section pages */
  .kb-section {
    page-break-before: always;
  }
  .kb-section.first { page-break-before: auto; }

  h1 {
    font-size: 22pt;
    color: #066058;
    border-bottom: 3px solid #066058;
    padding-bottom: 4mm;
    margin: 0 0 6mm 0;
  }
  h2 {
    font-size: 15pt;
    color: #144D3F;
    margin: 10mm 0 3mm 0;
    border-bottom: 1px solid #EAEAEA;
    padding-bottom: 1.5mm;
  }
  h3 {
    font-size: 11.5pt;
    color: #160F3E;
    margin: 6mm 0 2mm 0;
  }
  h4 { font-size: 10.5pt; color: #160F3E; margin: 4mm 0 1.5mm 0; }

  p, li { margin: 0 0 2.5mm 0; }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    margin: 3mm 0 5mm 0;
    page-break-inside: avoid;
  }
  th {
    background: #066058;
    color: #fff;
    font-weight: 600;
    text-align: start;
    padding: 5px 8px;
    border: 1px solid #066058;
  }
  td {
    padding: 5px 8px;
    border: 1px solid #EAEAEA;
    vertical-align: top;
  }
  tbody tr:nth-child(even) td { background: #F8FAF9; }

  /* Inline code & blockquote */
  code {
    background: #F0F4F2;
    color: #066058;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: "JetBrains Mono", "Menlo", monospace;
    font-size: 9pt;
  }
  pre {
    background: #0E1A22;
    color: #E6E6E6;
    padding: 4mm;
    border-radius: 4px;
    font-family: "JetBrains Mono", "Menlo", monospace;
    font-size: 9pt;
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
    page-break-inside: avoid;
  }
  pre code { background: none; color: inherit; padding: 0; }

  blockquote {
    margin: 3mm 0 4mm 0;
    padding: 3mm 5mm;
    border-left: 4px solid #066058;
    background: #F4F8F6;
    color: #323232;
    font-size: 10pt;
  }

  /* Lists */
  ul, ol { padding-inline-start: 6mm; }

  /* Links */
  a { color: #066058; text-decoration: none; }

  /* Anchors handled by md headings only; no separator lines from --- */
  hr { border: none; border-top: 1px dashed #CDCCD5; margin: 5mm 0; }

  /* Strong emphasis in Q&A — green tint */
  blockquote em, blockquote i { color: #595959; font-style: italic; }

  /* Avoid orphaned section headers */
  h1, h2, h3 { page-break-after: avoid; }
</style>
</head>
<body>

<div class="cover">
  <div>
    <div class="tag">Ministry of Municipalities &amp; Housing · April 2026</div>
    <h1>MBS Road<br/>Control Tower</h1>
    <div class="ar" dir="rtl">غرفة عمليات طريق الأمير محمد بن سلمان</div>
    <div class="sub">
      Curated knowledge base for the Prince Mohammed bin Salman Road corridor —
      Jeddah Islamic Port to Al-Masjid Al-Haram, 75&nbsp;km, 170,000+ vehicles per day.
    </div>
  </div>
  <div class="meta">
    <div><b>Document</b> · Knowledge base v0.1</div>
    <div><b>Generated</b> · ${dateStr}</div>
    <div><b>Scope</b> · Synthetic PoC data</div>
  </div>
</div>

${bodyHtml}

</body>
</html>`;

const tmp = mkdtempSync(path.join(tmpdir(), "mbs-kb-pdf-"));
const htmlPath = path.join(tmp, "kb.html");
writeFileSync(htmlPath, html, "utf-8");
console.log(`wrote intermediate HTML → ${htmlPath}`);

// --- Spawn Chrome headless ---------------------------------------------
const args = [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--no-pdf-header-footer",
  "--virtual-time-budget=15000",
  `--print-to-pdf=${path.resolve(OUTPUT_PDF)}`,
  `file://${htmlPath}`,
];

console.log(`spawning Chrome…`);
const r = spawnSync(CHROME_BIN, args, { stdio: "inherit" });
if (r.status !== 0) {
  console.error(`Chrome exited with status ${r.status}`);
  process.exit(r.status ?? 1);
}

console.log(`✓ PDF written → ${OUTPUT_PDF}`);
