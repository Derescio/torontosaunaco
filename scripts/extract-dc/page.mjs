// One design page → its JSON: route, page-map row, SEO head, data objects, copy sections and warnings.

import { parse } from "node-html-parser";
import { extractHead } from "./head.mjs";
import { extractData } from "./data.mjs";
import { extractSections } from "./blocks.mjs";
import { mapDataLinks } from "./links.mjs";

const HOMEPAGE = "Main.dc.html";
const LEISURECRAFT = /leisurecraft/i;

const stripSlash = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

function checks({ fileName, row, head, data, sections }, warn) {
  if (!row) {
    warn("no page-map row");
  } else {
    if (head.title !== row.title) warn(`title differs from page-map: "${head.title}" vs "${row.title}"`);
    if (head.description !== row.description) {
      warn(`description differs from page-map: "${head.description}" vs "${row.description}"`);
    }
    if (head.canonical) {
      let path;
      try {
        path = stripSlash(new URL(head.canonical).pathname);
      } catch {
        path = head.canonical;
      }
      if (path !== stripSlash(row.route)) warn(`canonical path ${path} differs from route ${row.route}`);
    }
  }
  if (head.og.type !== "website") warn(`og:type is "${head.og.type}", expected "website"`);

  if (fileName === HOMEPAGE) return;
  if (LEISURECRAFT.test(JSON.stringify(head))) warn("mentions Leisurecraft in head");
  if (LEISURECRAFT.test(JSON.stringify(data))) warn("mentions Leisurecraft in data");
  for (const s of sections) if (LEISURECRAFT.test(JSON.stringify(s.blocks))) warn(`mentions Leisurecraft in section ${s.name}`);
}

export function extractPage({ fileName, html, pageMap }) {
  const warnings = [];
  const warn = (w) => {
    if (!warnings.includes(w)) warnings.push(w);
  };
  const root = parse(html, { comment: true });
  if (!root.querySelector("x-dc")) throw new Error(`${fileName}: no <x-dc> element`);

  const row = pageMap.get(fileName) ?? null;
  const head = extractHead(root, warn);
  const script = root.querySelector('script[type="text/x-dc"]')?.rawText ?? "";
  const data = mapDataLinks(extractData(script), pageMap, warn);
  const sections = extractSections(root, { pageMap, warn });
  checks({ fileName, row, head, data, sections }, warn);

  return { file: fileName, route: row?.route ?? null, pageMap: row, head, data, sections, warnings };
}
