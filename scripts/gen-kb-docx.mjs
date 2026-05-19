// Build a Word (.docx) copy of the consolidated KB.
// Same markdown source as the PDF, converted with pandoc.
//
// Usage:  node scripts/gen-kb-docx.mjs
// Output: MBS Road Control Tower/MBS-Road-Control-Tower-Knowledge-Base.docx

import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

const KB_DIR = "MBS Road Control Tower";
const OUTPUT_DOCX = path.join(KB_DIR, "MBS-Road-Control-Tower-Knowledge-Base.docx");
const REFERENCE_DOC = path.join("scripts", "kb-reference.docx");

const SECTIONS = [
  "README.md",
  "00-executive-summary.md",
  "01-corridor-overview.md",
  "02-2027-targets.md",
  "03-zones.md",
  "04-contractors-and-governance.md",
  "05-activity-types-and-glossary.md",
  "06-questions-and-answers.md",
];

const dateStr = new Date().toISOString().slice(0, 10);

// Real docx page break via a raw OpenXML block.
// IMPORTANT: pandoc inserts this as-is at body level (NOT wrapped in <w:p>),
// so the block itself MUST be a complete <w:p> element. The malformed version
// of this caused corruption in v1.
const PAGE_BREAK =
  '\n\n```{=openxml}\n<w:p><w:r><w:br w:type="page"/></w:r></w:p>\n```\n\n';

// YAML front-matter gives pandoc a proper cover page.
const cover = `---
title: "MBS Road Control Tower"
subtitle: "Knowledge Base · غرفة عمليات طريق الأمير محمد بن سلمان"
author: "Ministry of Municipalities & Housing"
date: "${dateStr}"
lang: en
---

`;

// Strip Markdown headings inside Q&A list items that pandoc's docx writer
// can choke on, and normalize emoji-only table cells that some Word
// installations render as tofu boxes.
function preprocess(md, filename) {
  let out = md;
  if (filename === "06-questions-and-answers.md") {
    // The Q&A doc uses h3 inside list-ish flow; that's fine for docx but
    // make sure there is no double blank line after each '---' separator.
    out = out.replace(/\n---\n\n+/g, "\n\n---\n\n");
  }
  // Soften the colored circles in the zones table so they render as text
  // glyphs that all Office installs support.
  out = out
    .replace(/High 🔴/g, "**High**")
    .replace(/Medium 🟠/g, "Medium")
    .replace(/Low 🟢/g, "Low");
  return out;
}

const body = SECTIONS.map((f, i) => {
  const md = readFileSync(path.join(KB_DIR, f), "utf-8");
  const processed = preprocess(md, f);
  return (i === 0 ? "" : PAGE_BREAK) + processed;
}).join("\n");

const combined = cover + body;

const tmp = mkdtempSync(path.join(tmpdir(), "mbs-kb-docx-"));
const combinedPath = path.join(tmp, "combined.md");
writeFileSync(combinedPath, combined, "utf-8");

const args = [
  combinedPath,
  "-o", path.resolve(OUTPUT_DOCX),
  "--from", "markdown+pipe_tables+raw_attribute+yaml_metadata_block",
  "--to", "docx",
  "--standalone",
  "--toc",
  "--toc-depth=2",
  "--number-sections=false",
];

// If a reference docx is present, use it for branded styling.
if (existsSync(REFERENCE_DOC)) {
  args.push("--reference-doc", REFERENCE_DOC);
  console.log(`using reference doc: ${REFERENCE_DOC}`);
}

console.log("spawning pandoc…");
const r = spawnSync("pandoc", args, { stdio: "inherit" });
if (r.status !== 0) {
  console.error(`pandoc exited with status ${r.status}`);
  process.exit(r.status ?? 1);
}

// Quick sanity: docx files are zip archives — verify it opens cleanly.
const check = spawnSync("unzip", ["-t", "-q", path.resolve(OUTPUT_DOCX)], { stdio: "pipe" });
if (check.status !== 0) {
  console.error("✗ ZIP integrity check FAILED — docx is corrupted");
  console.error(check.stdout?.toString(), check.stderr?.toString());
  process.exit(1);
}

console.log(`✓ DOCX written + ZIP-verified → ${OUTPUT_DOCX}`);
