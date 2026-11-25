// Inline copy: reduces a node's children to text plus <em>, <strong>, <a href> and <br>, so emphasis in the design
// ("Customer first. *Every time.*") survives without carrying the design's inline styles.

import { mapHref } from "./links.mjs";

const SKIP = new Set(["svg", "script", "style"]);

/** Styled as its own box (block, flex or grid), so its text never joins a neighbour's. */
export const isLayoutBox = (node) => LAYOUT_BOX.test(node.getAttribute?.("style") ?? "");
const LAYOUT_BOX = /(^|;)\s*display\s*:\s*(block|flex|grid|inline-flex|inline-grid)\b/i;

const escapeText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (s) => escapeText(s).replace(/"/g, "&quot;");

function emphasis(el) {
  const tag = el.rawTagName?.toLowerCase();
  const style = (el.getAttribute?.("style") ?? "").toLowerCase();
  const weight = /font-weight\s*:\s*(\d+|bold)/.exec(style)?.[1];
  return {
    italic: tag === "em" || tag === "i" || /font-style\s*:\s*italic/.test(style),
    bold: tag === "strong" || tag === "b" || weight === "bold" || Number(weight) >= 600,
  };
}

function render(node, ctx) {
  if (node.nodeType === 3) return escapeText(node.text);
  if (node.nodeType !== 1) return "";
  const tag = node.rawTagName.toLowerCase();
  if (SKIP.has(tag) || node.getAttribute("aria-hidden") === "true") return "";
  if (tag === "br") return "<br>";
  const inner = node.childNodes.map((c) => render(c, ctx)).join("");
  if (tag === "a") {
    const raw = node.getAttribute("href");
    if (raw == null) return inner;
    const { href, unmapped } = mapHref(raw, ctx.pageMap);
    if (unmapped) ctx.warn(`unmapped link: ${raw}`);
    return `<a href="${escapeAttr(href)}">${inner}</a>`;
  }
  const { italic, bold } = emphasis(node);
  let out = inner;
  if (bold) out = `<strong>${out}</strong>`;
  if (italic) out = `<em>${out}</em>`;
  // A box laid out on its own line or in a flex/grid row must not run into its neighbours' words.
  if (isLayoutBox(node)) return ` ${out} `;
  // The design sometimes spaces words with a margin instead of a space character.
  const style = node.getAttribute("style") ?? "";
  const before = /margin-left\s*:\s*[1-9]/i.test(style) ? " " : "";
  const after = /margin-right\s*:\s*[1-9]/i.test(style) ? " " : "";
  return before + out + after;
}

function tidy(html) {
  let s = html.replace(/\s+/g, " ");
  // Move edge spaces out of inline tags so "a<em> b</em>" reads "a <em>b</em>".
  for (let prev = ""; prev !== s; ) {
    prev = s;
    s = s
      .replace(/(<(?:em|strong|a)\b[^>]*>) /g, " $1")
      .replace(/ (<\/(?:em|strong|a)>)/g, "$1 ")
      .replace(/ {2,}/g, " ");
  }
  return s.replace(/ ?<br> ?/g, "<br>").trim();
}

/** Inline HTML for the children of `node`. ctx = { pageMap, warn }. */
export function inlineHtml(node, ctx) {
  return tidy(node.childNodes.map((c) => render(c, ctx)).join(""));
}

/** Plain text of an inline HTML string. */
export function htmlToText(html) {
  return html
    .replace(/<br>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}
