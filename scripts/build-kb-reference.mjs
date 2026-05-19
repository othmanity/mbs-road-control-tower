// One-shot: produce a styled reference.docx that gen-kb-docx.mjs will reuse.
//
// Approach:
//  1) Generate pandoc's default reference doc (a stock template)
//  2) Open it as a zip and rewrite word/styles.xml with our branded styles
//     (MoMAH green headings, Inter-like body font, tighter spacing,
//      cleaner table grid).
//
// Run once:  node scripts/build-kb-reference.mjs

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";

const OUT = path.join("scripts", "kb-reference.docx");
const tmp = mkdtempSync(path.join(tmpdir(), "kb-ref-"));

console.log("→ extracting pandoc default reference…");
const r = spawnSync("pandoc", ["-o", path.join(tmp, "ref.docx"), "--print-default-data-file=reference.docx"], { stdio: "pipe" });
// Older pandocs prefer this form:
if (r.status !== 0) {
  const r2 = spawnSync("pandoc", ["--print-default-data-file=reference.docx"], { stdio: ["ignore", "pipe", "inherit"] });
  if (r2.status !== 0) {
    console.error("pandoc --print-default-data-file failed");
    process.exit(1);
  }
  writeFileSync(path.join(tmp, "ref.docx"), r2.stdout);
}

const refDocx = path.join(tmp, "ref.docx");
const unpacked = path.join(tmp, "unpacked");
execSync(`unzip -q ${JSON.stringify(refDocx)} -d ${JSON.stringify(unpacked)}`);

const stylesPath = path.join(unpacked, "word", "styles.xml");
let styles = readFileSync(stylesPath, "utf-8");

// Cross-platform Arabic font (Complex Script). Arial ships on Windows + macOS
// and has full Arabic glyph coverage with proper joining/ligatures.
const CS_FONT = "Arial";
const LATIN_FONT = "Calibri";

// Force a Complex Script font everywhere — fixes garbled Arabic
// rendering in the Q&A doc.
function setCsFontInDocDefaults(stylesXml) {
  return stylesXml.replace(
    /(<w:rPrDefault>[\s\S]*?<w:rPr>)([\s\S]*?)(<\/w:rPr>[\s\S]*?<\/w:rPrDefault>)/,
    (_m, open, inner, close) => {
      // remove pandoc's themed rFonts and any explicit rFonts
      const cleaned = inner.replace(/<w:rFonts[^/]*\/>/g, "");
      return `${open}<w:rFonts w:ascii="${LATIN_FONT}" w:hAnsi="${LATIN_FONT}" w:cs="${CS_FONT}" w:eastAsia="${LATIN_FONT}"/>${cleaned}${close}`;
    }
  );
}

function setCsFontOnStyle(stylesXml, styleId) {
  const re = new RegExp(`(<w:style[^>]*w:styleId="${styleId}"[\\s\\S]*?<w:rPr>)([\\s\\S]*?)(</w:rPr>)`, "g");
  return stylesXml.replace(re, (_m, open, inner, close) => {
    const cleaned = inner.replace(/<w:rFonts[^/]*\/>/g, "");
    return `${open}<w:rFonts w:ascii="${LATIN_FONT}" w:hAnsi="${LATIN_FONT}" w:cs="${CS_FONT}" w:eastAsia="${LATIN_FONT}"/>${cleaned}${close}`;
  });
}

// Brand color tokens
const BRAND_GREEN = "066058";    // MoMAH primary
const BRAND_DARK  = "144D3F";    // header darker accent
const BRAND_INK   = "160F3E";    // body H1 (used sparingly)
const BORDER      = "D6E0DC";    // soft table border
const ROW_ZEBRA   = "F4F8F6";    // subtle zebra
const BODY_INK    = "1F2A33";    // body text
const SUBTLE      = "5A6A73";

// Helper: surgical replace of color in a named style block (rPr inside style)
function setColor(stylesXml, styleId, hex) {
  const re = new RegExp(`(<w:style[^>]*w:styleId="${styleId}"[\\s\\S]*?<w:rPr>)([\\s\\S]*?)(</w:rPr>)`, "g");
  return stylesXml.replace(re, (_m, open, inner, close) => {
    // remove any existing color, then prepend ours
    const cleaned = inner.replace(/<w:color[^/]*\/>/g, "");
    return `${open}<w:color w:val="${hex}"/>${cleaned}${close}`;
  });
}

function setFontSize(stylesXml, styleId, halfPoints) {
  const re = new RegExp(`(<w:style[^>]*w:styleId="${styleId}"[\\s\\S]*?<w:rPr>)([\\s\\S]*?)(</w:rPr>)`, "g");
  return stylesXml.replace(re, (_m, open, inner, close) => {
    const cleaned = inner.replace(/<w:sz[^/]*\/>/g, "").replace(/<w:szCs[^/]*\/>/g, "");
    return `${open}<w:sz w:val="${halfPoints}"/><w:szCs w:val="${halfPoints}"/>${cleaned}${close}`;
  });
}

// Apply Arabic-aware fonts globally + on each heading/title style
styles = setCsFontInDocDefaults(styles);
for (const id of ["Normal", "Heading1", "Heading2", "Heading3", "Heading4", "Title", "Subtitle", "TOCHeading"]) {
  styles = setCsFontOnStyle(styles, id);
}

// Brand the headings (color + sizes)
styles = setColor(styles, "Heading1", BRAND_INK);
styles = setColor(styles, "Heading2", BRAND_GREEN);
styles = setColor(styles, "Heading3", BRAND_DARK);
styles = setColor(styles, "Heading4", SUBTLE);

styles = setFontSize(styles, "Heading1", 44); // 22pt
styles = setFontSize(styles, "Heading2", 30); // 15pt
styles = setFontSize(styles, "Heading3", 24); // 12pt
styles = setFontSize(styles, "Heading4", 22); // 11pt

// Title / Subtitle
styles = setColor(styles, "Title", BRAND_INK);
styles = setColor(styles, "Subtitle", BRAND_GREEN);

// Body paragraph (Normal)
styles = setColor(styles, "Normal", BODY_INK);
styles = setFontSize(styles, "Normal", 22); // 11pt

// Table style — clean grid w/ green header row & zebra rows
const tablePattern = /<w:style\s+w:type="table"\s+w:styleId="Table"[\s\S]*?<\/w:style>/;
const newTableStyle = `<w:style w:type="table" w:styleId="Table"><w:name w:val="Table"/><w:basedOn w:val="TableNormal"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="${BORDER}"/><w:left w:val="single" w:sz="4" w:space="0" w:color="${BORDER}"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="${BORDER}"/><w:right w:val="single" w:sz="4" w:space="0" w:color="${BORDER}"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="${BORDER}"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="${BORDER}"/></w:tblBorders><w:tblCellMar><w:top w:w="80" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblStylePr w:type="firstRow"><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="${BRAND_GREEN}"/></w:tcPr></w:tblStylePr><w:tblStylePr w:type="band1Horz"><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="${ROW_ZEBRA}"/></w:tcPr></w:tblStylePr></w:style>`;
if (tablePattern.test(styles)) {
  styles = styles.replace(tablePattern, newTableStyle);
} else {
  // Inject before </w:styles>
  styles = styles.replace(/<\/w:styles>/, `${newTableStyle}</w:styles>`);
}

writeFileSync(stylesPath, styles, "utf-8");

// Repack the docx
execSync(`cd ${JSON.stringify(unpacked)} && zip -qr ${JSON.stringify(path.resolve(OUT))} . -x "*.DS_Store"`);
console.log(`✓ branded reference docx written → ${OUT}`);
