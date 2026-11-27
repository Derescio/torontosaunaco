// Pure helpers for uploading the design photos to Cloudinary (spec: docs/superpowers/specs/2026-11-26-about-wellness-design.md).

import crypto from "node:crypto";

const NOT_SIGNED = new Set(["file", "api_key", "resource_type", "cloud_name"]);
const DESIGN_IMAGE = /^([0-9a-f]{32})\.(jpg|png|webp)$/;

/** Cloudinary signed-upload signature: SHA-1 of sorted "k=v" pairs joined by "&", followed by the API secret. */
export function signParams(params, secret) {
  const pairs = Object.entries(params)
    .filter(([k, v]) => !NOT_SIGNED.has(k) && v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`);
  return crypto.createHash("sha1").update(pairs.join("&") + secret).digest("hex");
}

/** Design photo files named <32-hex-hash>.<jpg|png|webp>, sorted by hash. */
export function listDesignImages(fileNames) {
  return fileNames
    .map((file) => [file, file.match(DESIGN_IMAGE)])
    .filter(([, m]) => m)
    .map(([file, m]) => ({ hash: m[1], file }))
    .sort((a, b) => (a.hash < b.hash ? -1 : 1));
}

export function pending(images, map) {
  return images.filter((img) => !map[img.hash]);
}

export function entryFrom(response) {
  const { secure_url: url, width, height } = response ?? {};
  for (const [name, value] of Object.entries({ secure_url: url, width, height })) {
    if (value === undefined || value === null) throw new Error(`Cloudinary response missing ${name}`);
  }
  return { url, width, height };
}

export function mergeMap(map, hash, entry) {
  const next = { ...map, [hash]: entry };
  return Object.fromEntries(Object.keys(next).sort().map((k) => [k, next[k]]));
}
