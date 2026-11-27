#!/usr/bin/env node
// Uploads the design photos (<hash>.jpg|png|webp in the design assets folder) to Cloudinary as redesign/<hash>
// and records { url, width, height } per hash in content/image-map.json.
// Usage: npm run images:upload            dry run: counts only
//        node scripts/images/upload-design-images.mjs --write [siteDir]
// Safe to re-run: photos already in the map are skipped, and the map is saved after every upload.
// Reads NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET from the
// environment or .env. Never prints them.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { signParams, listDesignImages, pending, entryFrom, mergeMap } from "./cloudinary.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const MAP_PATH = path.join(ROOT, "content", "image-map.json");
const KEYS = ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "NEXT_PUBLIC_CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

function fail(message) {
  console.error(`images:upload: ${message}`);
  process.exit(1);
}

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || !KEYS.includes(m[1]) || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

const args = process.argv.slice(2);
const write = args.includes("--write");
const siteDir =
  args.find((a) => !a.startsWith("--")) ?? process.env.DC_SITE_DIR ?? path.join(os.homedir(), "Downloads", "TSC-REVAMP", "Site");
const assetsDir = path.join(siteDir, "assets");
if (!fs.existsSync(assetsDir)) fail(`assets folder not found: ${assetsDir}`);

let map = fs.existsSync(MAP_PATH) ? JSON.parse(fs.readFileSync(MAP_PATH, "utf8")) : {};
const images = listDesignImages(fs.readdirSync(assetsDir));
const todo = pending(images, map);
console.log(`images ${images.length}, mapped ${images.length - todo.length}, to upload ${todo.length}`);
if (!write || !todo.length) process.exit(0);

loadEnv();
const missing = KEYS.filter((k) => !process.env[k]);
if (missing.length) fail(`missing ${missing.join(", ")}`);
const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;

let failed = 0;
for (const [i, img] of todo.entries()) {
  const params = { overwrite: "false", public_id: `redesign/${img.hash}`, timestamp: Math.floor(Date.now() / 1000) };
  const form = new FormData();
  const ext = img.file.split(".").pop();
  form.append("file", new Blob([fs.readFileSync(path.join(assetsDir, img.file))], { type: TYPES[ext] }), img.file);
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));
  form.append("api_key", apiKey);
  form.append("signature", signParams(params, secret));
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: form });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${res.status} ${body?.error?.message ?? "upload failed"}`);
    map = mergeMap(map, img.hash, entryFrom(body));
    fs.writeFileSync(MAP_PATH, `${JSON.stringify(map, null, 2)}\n`);
    if ((i + 1) % 25 === 0 || i === todo.length - 1) console.log(`uploaded ${i + 1}/${todo.length}`);
  } catch (err) {
    failed++;
    console.error(`${img.hash}: ${err.message}`);
  }
}
console.log(`done: ${todo.length - failed} uploaded, ${failed} failed, map has ${Object.keys(map).length} entries`);
process.exit(failed ? 1 : 0);
