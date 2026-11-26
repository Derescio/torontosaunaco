// The five policy pages: their extracted design content, and a parser that names each part for PolicyPage.
// Parts are found by position, as laid out in every Policy*.dc.html (spec: docs/superpowers/specs/2026-11-26-policies-design.md).
// Any missing part throws, so a re-extract that changes the layout fails the build instead of shipping a broken page.

import PolicyWarranty from "../../content/redesign/PolicyWarranty.json";
import PolicyReturns from "../../content/redesign/PolicyReturns.json";
import PolicyShipping from "../../content/redesign/PolicyShipping.json";
import PolicyTerms from "../../content/redesign/PolicyTerms.json";
import PolicyPrivacy from "../../content/redesign/PolicyPrivacy.json";

export const POLICY_PAGES = {
  "/warranty": PolicyWarranty,
  "/refund-policy": PolicyReturns,
  "/shipping": PolicyShipping,
  "/terms": PolicyTerms,
  "/privacy": PolicyPrivacy,
};

const isHeading = (level) => (b) => b?.type === "heading" && b.level === level;

export function policyParts(page) {
  const file = page?.file ?? "unknown page";
  const need = (value, what) => {
    if (value === undefined || value === null) throw new Error(`policyParts: ${file}: missing ${what}`);
    return value;
  };

  const sections = Array.isArray(page?.sections) ? page.sections : [];
  const [head, body, cta] = sections.map((s) => (Array.isArray(s.blocks) ? s.blocks : []));
  need(cta, "three sections (header, body, question band)");

  // Section 1: breadcrumb, eyebrow, H1, contact paragraph, tabs…, "Last updated".
  const titleAt = head.findIndex(isHeading(1));
  const title = need(head[titleAt], "H1");
  const contactAt = head.findIndex((b, i) => i > titleAt && b.type === "paragraph");
  const contact = need(head[contactAt], "contact paragraph");
  const updated = need(head.length - 1 > contactAt ? head[head.length - 1] : undefined, "last-updated line");
  if (updated.type !== "text") need(undefined, "last-updated line");
  const tabs = head.slice(contactAt + 1, -1).map((b) => {
    if (b.type === "link") return { label: b.text, href: b.href };
    if (b.type === "text") return { label: b.text, href: null };
    return need(undefined, `tab (found ${b.type})`);
  });
  if (tabs.filter((t) => t.href === null).length !== 1) need(undefined, "exactly one current tab");

  // Section 2: intro paragraph, glance label, definitions, then groups each led by an H3.
  const glanceAt = body.findIndex((b) => b.type === "definitions");
  const glance = need(body[glanceAt], "definitions (at-a-glance box)");
  const groups = [];
  for (const block of body.slice(glanceAt + 1)) {
    if (isHeading(3)(block)) groups.push({ heading: block, blocks: [] });
    else need(groups.at(-1), "H3 before body content").blocks.push(block);
  }
  if (!groups.length) need(undefined, "H3 sections");

  return {
    breadcrumb: need(head.find((b) => b.type === "breadcrumb"), "breadcrumb").items,
    eyebrow: need(head.slice(0, titleAt).find((b) => b.type === "text"), "eyebrow").text,
    title,
    contact,
    tabs,
    updated: updated.text,
    intro: need(body.slice(0, glanceAt).find((b) => b.type === "paragraph"), "intro paragraph"),
    glance: {
      label: need(body.slice(0, glanceAt).find((b) => b.type === "text"), "at-a-glance label").text,
      items: Array.isArray(glance.items) ? glance.items : [],
    },
    groups,
    cta: {
      heading: need(cta.find(isHeading(2)), "question band H2"),
      text: need(cta.find((b) => b.type === "paragraph"), "question band paragraph"),
      links: cta.filter((b) => b.type === "link"),
    },
  };
}
