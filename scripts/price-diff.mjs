#!/usr/bin/env node
// Price diff: compares the redesign's prices (content/redesign) with the staging catalogue and writes a Word document
// plus JSON to reports/ for the owner and client to decide line by line. Reads only; writes nothing to any database.
// Usage: npm run price-diff     (MONGO_URI from .env must name the "staging" database; it is never printed)
// Spec: docs/superpowers/specs/2026-11-24-price-diff-design.md

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import { assertStaging } from "./price-diff/guard.mjs";
import { designProducts } from "./price-diff/design.mjs";
import { buildReport } from "./price-diff/report.mjs";
import { renderDocument } from "./price-diff/document.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content", "redesign");
const OUT = path.join(ROOT, "reports");
const MATCHES = path.join(ROOT, "scripts", "price-diff", "matches.json");

function fail(message) {
  console.error(`price-diff: ${message}`);
  process.exit(1);
}

if (!process.env.MONGO_URI) fail("MONGO_URI is not set (run with node --env-file=.env, or npm run price-diff)");
if (!fs.existsSync(CONTENT)) fail(`${path.relative(ROOT, CONTENT)} not found: run npm run extract:dc first`);

const pages = fs
  .readdirSync(CONTENT)
  .filter((f) => f.endsWith(".json") && f !== "index.json")
  .sort()
  .map((f) => JSON.parse(fs.readFileSync(path.join(CONTENT, f), "utf8")));
const overrides = JSON.parse(fs.readFileSync(MATCHES, "utf8"));

const client = new MongoClient(process.env.MONGO_URI);
let catalogue;
try {
  await client.connect();
  const db = client.db();
  try {
    assertStaging(db.databaseName);
  } catch (err) {
    fail(err.message);
  }
  const read = (name) => db.collection(name).find({}).toArray();
  catalogue = { products: await read("products"), heaters: await read("heaters"), accessories: await read("accessories") };
} finally {
  await client.close();
}

const report = buildReport({ designProducts: designProducts(pages), catalogue, overrides });
// File names use the date in Toronto, where the report is read (en-CA formats as YYYY-MM-DD).
const day = new Date(report.generatedAt).toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
fs.mkdirSync(OUT, { recursive: true });
const jsonPath = path.join(OUT, `price-diff-${day}.json`);
const docxPath = path.join(OUT, `price-diff-${day}.docx`);
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(docxPath, await renderDocument(report));

const t = report.totals;
console.log(
  `same ${t.same}, differs ${t.differs}, on request ${t["on-request"]}, design only ${t["design-only"]}, website only ${t["website-only"]}`,
);
console.log(`products: ${report.sections.reduce((n, s) => n + s.products.length, 0)} compared, ${report.designOnly.length} new in design, ${report.websiteOnly.length} website only`);
console.log(`wrote ${path.relative(ROOT, docxPath)} and ${path.relative(ROOT, jsonPath)}`);
