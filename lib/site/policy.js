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

  // Extra content is an error too: a part this layout doesn't place would otherwise be dropped without notice.
  const check = (ok, what) => {
    if (!ok) throw new Error(`policyParts: ${file}: ${what}`);
  };
  const is = (block, type) => block?.type === type;

  const sections = Array.isArray(page?.sections) ? page.sections : [];
  check(sections.length === 3, `expected exactly three sections (header, body, question band), found ${sections.length}`);
  const [head, body, cta] = sections.map((s) => (Array.isArray(s.blocks) ? s.blocks : []));

  // Section 1, exactly: breadcrumb, eyebrow, H1, contact paragraph, five tabs, "Last updated".
  const [crumb, eyebrow, title, contact] = head;
  check(
    is(crumb, "breadcrumb") && is(eyebrow, "text") && isHeading(1)(title) && is(contact, "paragraph"),
    "header must start with breadcrumb, eyebrow, H1 and contact paragraph"
  );
  const updated = head.at(-1);
  check(head.length > 5 && is(updated, "text"), "missing last-updated line");
  const tabs = head.slice(4, -1).map((b) => {
    check(is(b, "link") || is(b, "text"), `unexpected ${b.type} among the policy tabs`);
    return { label: b.text, href: is(b, "link") ? b.href : null };
  });
  check(tabs.length === 5, `expected five tabs, found ${tabs.length}`);
  check(tabs.filter((t) => t.href === null).length === 1, "expected exactly one current tab");

  // Section 2: intro paragraph, glance label, definitions, then groups each led by an H3.
  const glanceAt = body.findIndex((b) => is(b, "definitions"));
  const glance = need(body[glanceAt], "definitions (at-a-glance box)");
  const [intro, glanceLabel] = body;
  check(
    glanceAt === 2 && is(intro, "paragraph") && is(glanceLabel, "text"),
    "expected only an intro paragraph and a label before the at-a-glance box"
  );
  const glanceItems = Array.isArray(glance.items) ? glance.items : [];
  check(glanceItems.length > 0, "no at-a-glance rows");
  const groups = [];
  for (const block of body.slice(glanceAt + 1)) {
    if (isHeading(3)(block)) groups.push({ heading: block, blocks: [] });
    else need(groups.at(-1), "H3 before body content").blocks.push(block);
  }
  if (!groups.length) need(undefined, "H3 sections");

  // Section 3, exactly: H2, paragraph, call link, email link.
  check(
    cta.length === 4 && isHeading(2)(cta[0]) && is(cta[1], "paragraph") && is(cta[2], "link") && is(cta[3], "link"),
    "question band must be exactly H2, paragraph and two links"
  );

  return {
    breadcrumb: Array.isArray(crumb.items) ? crumb.items : [],
    eyebrow: eyebrow.text,
    title,
    contact,
    tabs,
    updated: updated.text,
    intro,
    glance: { label: glanceLabel.text, items: glanceItems },
    groups,
    cta: { heading: cta[0], text: cta[1], links: [cta[2], cta[3]] },
  };
}
