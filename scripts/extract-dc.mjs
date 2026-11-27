#!/usr/bin/env node
// Extracts every .dc.html design page into JSON in content/redesign/ (route, SEO head, data, copy blocks, warnings).
// Usage: npm run extract:dc [-- <siteDir>]   (default: DC_SITE_DIR, else ~/Downloads/TSC-REVAMP/Site)
// Reads only the design folder; writes only *.json in content/redesign/.
// Spec: docs/superpowers/specs/2026-11-24-extract-dc-design.md

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPageMap } from "./extract-dc/pagemap.mjs";
import { extractPage } from "./extract-dc/page.mjs";
import { buildSeoIndex } from "./extract-dc/seo.mjs";
import { COPY_EDITS, applyCopyEdits, unusedEdits } from "./extract-dc/copy-edits.mjs";

const SKIP = new Set(["Piece-zsi1.dc.html"]); // stray copy of Main.dc.html
const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "redesign");

function fail(message) {
  console.error(`extract-dc: ${message}`);
  process.exit(1);
}

const siteDir = process.argv[2] ?? process.env.DC_SITE_DIR ?? path.join(os.homedir(), "Downloads", "TSC-REVAMP", "Site");
const csvPath = path.join(siteDir, "..", "Launch File", "page-map.csv");
if (!fs.existsSync(siteDir)) fail(`design folder not found: ${siteDir}`);
if (!fs.existsSync(csvPath)) fail(`page map not found: ${csvPath}`);

const pageMap = loadPageMap(fs.readFileSync(csvPath, "utf8"));
const files = fs
  .readdirSync(siteDir)
  .filter((f) => f.endsWith(".dc.html") && !SKIP.has(f))
  .sort();

const pages = [];
const editCounts = new Map();
for (const file of files) {
  try {
    const page = extractPage({ fileName: file, html: fs.readFileSync(path.join(siteDir, file), "utf8"), pageMap });
    pages.push(applyCopyEdits(page, COPY_EDITS, editCounts));
  } catch (err) {
    fail(`${file} failed to parse: ${err.message}`);
  }
}
const stale = unusedEdits(editCounts);
if (stale.length) fail(`copy edits matched nothing (stale rule?): ${stale.map((e) => JSON.stringify(e.find)).join(", ")}`);

const byRoute = new Map();
for (const p of pages) {
  if (!p.route) continue;
  if (byRoute.has(p.route)) fail(`${byRoute.get(p.route).file} and ${p.file} both map to ${p.route}`);
  byRoute.set(p.route, p);
}

const indexWarnings = [...pageMap.keys()]
  .filter((f) => !files.includes(f))
  .sort()
  .map((f) => `page-map row with no file: ${f}`);

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const f of fs.readdirSync(OUT_DIR)) if (f.endsWith(".json")) fs.rmSync(path.join(OUT_DIR, f));

const write = (name, value) => fs.writeFileSync(path.join(OUT_DIR, name), `${JSON.stringify(value, null, 2)}\n`);
const jsonName = (file) => file.replace(/\.dc\.html$/, ".json");
for (const p of pages) write(jsonName(p.file), p);

const index = { pages: {}, warnings: indexWarnings };
for (const route of [...byRoute.keys()].sort()) {
  const p = byRoute.get(route);
  index.pages[route] = { file: jsonName(p.file), warnings: p.warnings.length };
}
write("index.json", index);
fs.writeFileSync(path.join(OUT_DIR, "..", "seo.json"), `${JSON.stringify(buildSeoIndex(pages), null, 2)}
`);

// Summary
const countBlocks = (blocks) =>
  blocks.reduce((n, b) => n + 1 + countBlocks(b.blocks ?? []) + countBlocks((b.items ?? []).flatMap((i) => i.blocks ?? [])), 0);
const sections = pages.reduce((n, p) => n + p.sections.length, 0);
const blocks = pages.reduce((n, p) => n + p.sections.reduce((m, s) => m + countBlocks(s.blocks), 0), 0);
const allWarnings = [...pages.flatMap((p) => p.warnings.map((w) => `${p.file}: ${w}`)), ...indexWarnings];
console.log(`pages ${pages.length}, sections ${sections}, blocks ${blocks}, warnings ${allWarnings.length}`);
const kinds = new Map();
for (const w of allWarnings) {
  // Group by message with the page name and quoted/variable parts blanked out.
  const kind = w
    .replace(/^[\w-]+\.dc\.html: /, "")
    .replace(/"[^"]*"/g, '"…"')
    .replace(/: .*$/, "")
    .replace(/(section|route|path|in) \S.*$/, "$1 …");
  kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
}
for (const [kind, n] of [...kinds].sort((a, b) => b[1] - a[1])) console.log(`  ${n} × ${kind}`);
for (const { find } of COPY_EDITS) console.log(`copy edits: ${JSON.stringify(find)} ×${editCounts.get(find)}`);
console.log(`wrote ${pages.length + 1} files to ${path.relative(process.cwd(), OUT_DIR)}`);
