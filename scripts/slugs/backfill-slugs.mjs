#!/usr/bin/env node
// Slug backfill: gives every product and accessory a slug. Products with a design page get its route
// (/saunas/indoor/pure-cube-552 → "indoor/pure-cube-552"); the rest get their slugified name. Never overwrites a slug.
// Usage: npm run slugs:backfill                 dry run on staging (prints the plan, writes nothing)
//        npm run slugs:backfill:apply           write missing slugs on staging
//        (Windows PowerShell 5.1 drops "--" before npm args, so "npm run slugs:backfill -- --apply" only dry-runs;
//        use the :apply script, or: node --env-file=.env scripts/slugs/backfill-slugs.mjs --apply)
//        add --production to run on "test" (owner only, at cutover). MONGO_URI is never printed.
// Spec: docs/superpowers/specs/2026-11-25-slugs-design.md

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import { assertTarget } from "./guard.mjs";
import { planSlugs } from "./plan.mjs";
import { designProducts } from "../price-diff/design.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONTENT = path.join(ROOT, "content", "redesign");
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

function fail(message) {
  console.error(`slugs:backfill: ${message}`);
  process.exit(1);
}

const apply = process.argv.includes("--apply");
const production = process.argv.includes("--production");
if (!process.env.MONGO_URI) fail("MONGO_URI is not set (run with npm run slugs:backfill)");
if (!fs.existsSync(CONTENT)) fail("content/redesign not found: run npm run extract:dc first");

const pages = fs
  .readdirSync(CONTENT)
  .filter((f) => f.endsWith(".json") && f !== "index.json")
  .sort()
  .map((f) => readJson(path.join(CONTENT, f)));
const overrides = readJson(path.join(ROOT, "scripts", "price-diff", "matches.json"));
const primary = readJson(path.join(ROOT, "scripts", "slugs", "primary.json"));

const client = new MongoClient(process.env.MONGO_URI);
try {
  await client.connect();
  const db = client.db();
  try {
    assertTarget(db.databaseName, { production });
  } catch (err) {
    fail(err.message);
  }
  const fields = { projection: { name: 1, type: 1, slug: 1 } };
  const products = await db.collection("products").find({}, fields).toArray();
  const accessories = await db.collection("accessories").find({}, fields).toArray();
  const { rows, errors } = planSlugs({ designProducts: designProducts(pages), products, accessories, overrides, primary });

  console.log(`database: ${db.databaseName}`);
  for (const r of rows) console.log(`${r.collection.padEnd(12)} ${r.id}  ${r.slug.padEnd(48)} ${r.source}`);
  const count = (c, s) => rows.filter((r) => r.collection === c && (!s || r.source === s)).length;
  for (const c of ["products", "accessories"]) {
    console.log(`${c}: ${count(c)} rows (${count(c, "design")} design, ${count(c, "name")} name, ${count(c, "existing")} existing)`);
  }
  if (errors.length) {
    for (const e of errors) console.error(`error: ${e}`);
    fail(`${errors.length} error(s); nothing written`);
  }

  if (!apply) {
    console.log("dry run: nothing written (add --apply to write)");
  } else {
    const idByString = new Map([...products, ...accessories].map((d) => [String(d._id), d._id]));
    let written = 0;
    for (const r of rows.filter((row) => row.source !== "existing")) {
      // Only documents still without a slug: a slug set since the plan was read (e.g. in /editor) is kept.
      const filter = { _id: idByString.get(r.id), slug: { $in: [null, ""] } };
      const res = await db.collection(r.collection).updateOne(filter, { $set: { slug: r.slug } });
      written += res.modifiedCount;
    }
    console.log(`written: ${written}`);
  }
} finally {
  await client.close();
}
