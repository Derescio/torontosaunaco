// Copy blocks: turns a design section's markup into typed blocks (heading, paragraph, link, card, image, …) so page
// components can render the copy verbatim. See docs/superpowers/specs/2026-11-24-extract-dc-design.md.

import { inlineHtml, htmlToText, isLayoutBox } from "./inline.mjs";
import { mapHref } from "./links.mjs";

const HEADING = /^h([1-6])$/;
const BLOCK = new Set([
  "p", "ul", "ol", "li", "div", "section", "article", "aside", "main", "figure", "figcaption", "img", "table",
  "details", "summary", "blockquote", "form", "nav", "header", "footer", "button", "sc-for", "sc-if", "label",
  "input", "select", "textarea", "dl",
]);
const SKIP = new Set(["svg", "script", "style", "helmet", "noscript", "template", "option", "link", "meta"]);
// Tags whose text is ordinary copy when they hold no blocks; anything else with text is reported.
const KNOWN = new Set([
  "div", "section", "article", "aside", "main", "li", "nav", "figcaption", "summary", "span", "em", "strong", "b",
  "i", "u", "small", "sup", "sub", "br", "cite", "mark", "abbr", "code", "time", "s", "del", "ins", "q", "a",
  "address",
]);

const tagOf = (n) => n.rawTagName?.toLowerCase();
const elements = (n) => n.childNodes.filter((c) => c.nodeType === 1);
const hidden = (n) => SKIP.has(tagOf(n)) || n.getAttribute("aria-hidden") === "true";
const isBlockish = (n) =>
  HEADING.test(tagOf(n)) || BLOCK.has(tagOf(n)) || isLayoutBox(n) || (tagOf(n) === "a" && containsBlock(n));
// Parts that show as separate boxes in a flex/grid layout: element children and loose text.
const layoutParts = (n) =>
  n.childNodes.filter((c) => (c.nodeType === 3 ? c.text.trim() !== "" : c.nodeType === 1 && !hidden(c)));
/** A flex/grid box with several parts: each part is its own block. */
const splitsIntoParts = (n) =>
  /(^|;)\s*display\s*:\s*(inline-)?(flex|grid)\b/i.test(n.getAttribute("style") ?? "") && layoutParts(n).length > 1;
const containsBlock = (n) =>
  splitsIntoParts(n) || elements(n).some((c) => !hidden(c) && (isBlockish(c) || containsBlock(c)));
const withChildren = (childNodes) => ({ childNodes });

/** Non-whitespace text that sits outside any <a>. */
function textOutsideLinks(n) {
  return n.childNodes.some((c) =>
    c.nodeType === 3 ? c.text.trim() !== "" : c.nodeType === 1 && !hidden(c) && tagOf(c) !== "a" && textOutsideLinks(c),
  );
}

const textBlock = (type, html, extra = {}) => ({ type, ...extra, html, text: htmlToText(html) });

function labelled(block, n) {
  const label = n.getAttribute("aria-label");
  if (label) block.label = label;
  return block;
}

function link(n, ctx) {
  const html = inlineHtml(n, ctx);
  if (!html && !n.getAttribute("aria-label")) return [];
  let href = null;
  const raw = n.getAttribute("href");
  if (tagOf(n) === "a" && raw != null) {
    const mapped = mapHref(raw, ctx.pageMap);
    if (mapped.unmapped) ctx.warn(`unmapped link: ${raw}`);
    href = mapped.href;
  }
  const cls = n.getAttribute("class") ?? "";
  const style = n.getAttribute("style") ?? "";
  const button = tagOf(n) === "button" || /\bh?btn\b|\bbtn-/.test(cls) || /border-radius\s*:\s*999px/.test(style);
  return [labelled({ type: "link", html, text: htmlToText(html), href, variant: button ? "button" : "link" }, n)];
}

function cardHref(n, ctx) {
  const raw = n.getAttribute("href");
  if (raw == null) return null;
  const mapped = mapHref(raw, ctx.pageMap);
  if (mapped.unmapped) ctx.warn(`unmapped link: ${raw}`);
  return mapped.href;
}

function field(control, label, ctx) {
  const tag = tagOf(control);
  const out = {
    type: "field",
    label,
    id: control.getAttribute("id") ?? null,
    control: tag,
  };
  if (tag === "input") out.inputType = control.getAttribute("type") ?? "text";
  const placeholder = control.getAttribute("placeholder");
  if (placeholder) out.placeholder = placeholder;
  if (tag === "select") {
    out.options = control.querySelectorAll("option").map((o) => htmlToText(inlineHtml(o, ctx)));
  }
  ctx.consumed.add(control);
  return out;
}

function labelField(n, ctx) {
  const id = n.getAttribute("for");
  const control = id
    ? ctx.root.querySelector(`[id="${id}"]`)
    : n.querySelector("input") ?? n.querySelector("select") ?? n.querySelector("textarea");
  const text = htmlToText(inlineHtml(withChildren(n.childNodes.filter((c) => c !== control)), ctx));
  if (!control) return [{ type: "field", label: text, id: id ?? null, control: null }];
  const out = field(control, text, ctx);
  if (id) out.id = id;
  return [out];
}

function listItems(n, ctx) {
  const items = [];
  for (const c of elements(n)) {
    if (hidden(c)) continue;
    const tag = tagOf(c);
    if (tag === "li") {
      if (containsBlock(c)) items.push({ blocks: children(c, ctx) });
      else {
        const html = inlineHtml(c, ctx);
        if (html) items.push({ html, text: htmlToText(html) });
      }
    } else if (tag === "sc-for") {
      items.push({ type: "repeat", list: c.getAttribute("list"), as: c.getAttribute("as"), items: listItems(c, ctx) });
    } else if (tag === "sc-if") {
      items.push({ type: "if", value: c.getAttribute("value"), items: listItems(c, ctx) });
    } else {
      items.push(...blocksOf(c, ctx));
    }
  }
  return items;
}

function definitionItems(n, ctx) {
  const items = [];
  let open = null;
  for (const c of elements(n)) {
    if (hidden(c)) continue;
    const tag = tagOf(c);
    if (tag === "dt" || tag === "dd") {
      const html = inlineHtml(c, ctx);
      const part = { html, text: htmlToText(html) };
      if (tag === "dt") items.push((open = { term: part, details: null }));
      else if (open && !open.details) open.details = part;
      else items.push((open = { term: null, details: part }));
    } else if (tag === "sc-for") {
      open = null;
      items.push({ type: "repeat", list: c.getAttribute("list"), as: c.getAttribute("as"), items: definitionItems(c, ctx) });
    } else if (tag === "sc-if") {
      open = null;
      items.push({ type: "if", value: c.getAttribute("value"), items: definitionItems(c, ctx) });
    } else {
      // Row wrappers (<div><dt/><dd/></div>) are flattened into this list.
      const inner = definitionItems(c, ctx);
      items.push(...inner);
      open = null;
    }
  }
  return items;
}

function figure(n, ctx) {
  const caption = elements(n).find((c) => tagOf(c) === "figcaption");
  const blocks = children(withChildren(n.childNodes.filter((c) => c !== caption)), ctx);
  if (!caption) return blocks;
  const html = inlineHtml(caption, ctx);
  if (!html) return blocks;
  const quote = blocks.findLast((b) => b.type === "quote");
  const image = blocks.findLast((b) => b.type === "image");
  if (quote) quote.cite = html;
  else if (image) image.caption = html;
  else blocks.push(textBlock("text", html));
  return blocks;
}

function quote(n, ctx) {
  const cite = elements(n).find((c) => tagOf(c) === "cite" || tagOf(c) === "footer");
  const html = inlineHtml(withChildren(n.childNodes.filter((c) => c !== cite)), ctx);
  return [{ type: "quote", html, text: htmlToText(html), cite: cite ? inlineHtml(cite, ctx) : null }];
}

function breadcrumb(n, ctx) {
  const items = [];
  for (const c of n.childNodes) {
    if (c.nodeType === 3) {
      for (const part of c.text.split("/")) if (part.trim()) items.push({ text: part.trim() });
    } else if (c.nodeType === 1 && !hidden(c)) {
      const text = htmlToText(inlineHtml(c, ctx));
      if (!text) continue;
      items.push(tagOf(c) === "a" ? { text, href: cardHref(c, ctx) } : { text });
    }
  }
  return [{ type: "breadcrumb", items }];
}

function children(n, ctx) {
  return n.childNodes.flatMap((c) => blocksOf(c, ctx));
}

function blocksOf(n, ctx) {
  if (n.nodeType === 3) {
    const html = inlineHtml(withChildren([n]), ctx);
    return html ? [textBlock("text", html)] : [];
  }
  if (n.nodeType !== 1 || hidden(n)) return [];
  const tag = tagOf(n);
  const heading = HEADING.exec(tag);
  if (heading) {
    const html = inlineHtml(n, ctx);
    return html ? [textBlock("heading", html, { level: Number(heading[1]) })] : [];
  }
  switch (tag) {
    case "p": {
      const html = inlineHtml(n, ctx);
      return html ? [textBlock("paragraph", html)] : [];
    }
    case "ul":
    case "ol":
      return [{ type: "list", ordered: tag === "ol", items: listItems(n, ctx) }];
    case "dl":
      return [{ type: "definitions", items: definitionItems(n, ctx) }];
    case "a":
      return containsBlock(n) ? [{ type: "card", href: cardHref(n, ctx), blocks: children(n, ctx) }] : link(n, ctx);
    case "button":
      if (!containsBlock(n)) return link(n, ctx);
      // Option tiles and step headers: keep their parts, sc-if states and images instead of one merged label.
      return [{ type: "button", label: n.getAttribute("aria-label") ?? null, blocks: children(n, ctx) }];
    case "img":
      return [{ type: "image", src: n.getAttribute("src") ?? null, alt: n.getAttribute("alt") ?? "" }];
    case "figure":
      return figure(n, ctx);
    case "blockquote":
      return quote(n, ctx);
    case "details": {
      const summary = elements(n).find((c) => tagOf(c) === "summary");
      const html = summary ? inlineHtml(summary, ctx) : "";
      const rest = children(withChildren(n.childNodes.filter((c) => c !== summary)), ctx);
      return [{ type: "faq", html, text: htmlToText(html), blocks: rest }];
    }
    case "table": {
      const caption = n.querySelector("caption");
      const trs = n.querySelectorAll("tr");
      const cells = (tr) => elements(tr).filter((c) => ["th", "td"].includes(tagOf(c)));
      // Header rows: rows inside <thead>, or leading rows made only of <th>.
      let headerRows = 0;
      while (
        headerRows < trs.length &&
        (tagOf(trs[headerRows].parentNode) === "thead" || cells(trs[headerRows]).every((c) => tagOf(c) === "th"))
      ) {
        headerRows++;
      }
      return [
        {
          type: "table",
          caption: caption ? inlineHtml(caption, ctx) || null : null,
          headerRows,
          rows: trs.map((tr) => cells(tr).map((c) => inlineHtml(c, ctx))),
        },
      ];
    }
    case "form":
      return [{ type: "form", blocks: children(n, ctx) }];
    case "label":
      return labelField(n, ctx);
    case "input":
    case "select":
    case "textarea":
      if (ctx.consumed.has(n) || n.getAttribute("type") === "hidden") return [];
      return [field(n, n.getAttribute("aria-label") ?? null, ctx)];
    case "sc-for":
      return [{ type: "repeat", list: n.getAttribute("list"), as: n.getAttribute("as"), blocks: children(n, ctx) }];
    case "sc-if":
      return [{ type: "if", value: n.getAttribute("value"), blocks: children(n, ctx) }];
    case "header":
    case "footer":
      return [];
    case "nav":
      if (/breadcrumb/i.test(n.getAttribute("aria-label") ?? "")) return breadcrumb(n, ctx);
  }
  // A run of text with inline links stays one block ("Call <a>(437) 429-6623</a>."); links on their own split out.
  const inlineRun = !containsBlock(n) || (!splitsIntoParts(n) && !hasNonLinkBlock(n) && textOutsideLinks(n));
  if (!inlineRun) return children(n, ctx);
  // Render the element itself, so its own italic/bold styling (a serif "01", a bold label) is kept.
  const html = inlineHtml(withChildren([n]), ctx);
  if (!html) return [];
  for (const t of unknownTags(n)) {
    ctx.warn(`unhandled <${t.tag}> in ${ctx.section ?? "?"}: ${htmlToText(inlineHtml(t.node, ctx)).slice(0, 40)}`);
  }
  return [labelled(textBlock("text", html), n)];
}

/** The node and its descendants whose tag the extractor doesn't know, first occurrence per tag. */
function unknownTags(n, seen = new Map()) {
  const tag = tagOf(n);
  if (!KNOWN.has(tag) && !BLOCK.has(tag) && !HEADING.test(tag) && !seen.has(tag)) seen.set(tag, { tag, node: n });
  for (const c of elements(n)) if (!hidden(c)) unknownTags(c, seen);
  return [...seen.values()];
}

/** True when a descendant other than a plain inline <a> is block-level. */
function hasNonLinkBlock(n) {
  return elements(n).some(
    (c) => !hidden(c) && ((tagOf(c) !== "a" && isBlockish(c)) || (tagOf(c) === "a" && containsBlock(c)) || hasNonLinkBlock(c)),
  );
}

/** Blocks for one element. ctx = { pageMap, warn, section? }. */
export function blocksFrom(node, ctx) {
  return blocksOf(node, { ...ctx, root: node, consumed: new Set() });
}

/** Named sections of a design page, without the header and footer. */
export function extractSections(root, ctx) {
  const xdc = root.querySelector("x-dc");
  if (!xdc) throw new Error("no <x-dc> element");
  const wrapper = elements(xdc).find((c) => tagOf(c) !== "helmet");
  if (!wrapper) return [];
  const sections = [];
  let pending = null;
  let unnamed = 0;
  for (const c of wrapper.childNodes) {
    if (c.nodeType === 8) {
      pending = c.rawText.trim();
      continue;
    }
    if (c.nodeType !== 1) continue;
    const name = pending;
    pending = null;
    if (["header", "footer"].includes(tagOf(c)) || name === "Header" || name === "Footer") continue;
    const sectionName = name ?? `Section ${++unnamed}`;
    const blocks = blocksFrom(c, { ...ctx, section: sectionName });
    if (blocks.length) sections.push({ name: sectionName, blocks });
  }
  return sections;
}
