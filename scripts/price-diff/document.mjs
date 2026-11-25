// The meeting document: a Word file the owner and client work through, one table per product, a decision box per row.

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const HOW_TO_USE =
  "Each table lists the prices that differ between the website today and the new design. Tick one box per row: keep " +
  "the website price, use the design price, or write another. Prices that already match are not listed. Prices are " +
  "before tax. The Ref column lets us apply your decisions exactly.";
const DECISION = "☐ Keep website   ☐ Use design   ☐ Other: ______";
const OUTCOME_LABELS = [
  ["same", "Same price (not listed)"],
  ["differs", "Different price"],
  ["on-request", "Priced on request in the design"],
  ["design-only", "Only in the new design"],
  ["website-only", "Only on the website"],
];
const GREY = "6B635B";
const HEADER_FILL = "F4F1EC";
const COLUMNS = [34, 13, 13, 28, 12]; // Option, Website now, New design, Decision, Ref (percent)

/** "$11,884", or "$111.60" when there are cents; null stays null. */
export function money(v) {
  if (v === null || v === undefined) return null;
  const cents = Math.round(v * 100) % 100 !== 0;
  return `$${v.toLocaleString("en-CA", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 })}`;
}

const date = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Toronto" })
    : "unknown";

const text = (t, opts = {}) => new TextRun({ text: t, ...opts });
const para = (children, opts = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], ...opts });

function cell(paragraphs, { width, header = false } = {}) {
  return new TableCell({
    children: paragraphs,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: header ? { type: ShadingType.CLEAR, fill: HEADER_FILL, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
}

const table = (rows) => new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });

function headerRow(labels, widths) {
  return new TableRow({
    tableHeader: true,
    children: labels.map((l, i) => cell([para(text(l, { bold: true }))], { width: widths[i], header: true })),
  });
}

function priceCells(row) {
  const website = row.outcome === "design-only" ? "Not offered" : money(row.website) ?? "—";
  let design;
  if (row.outcome === "website-only") design = "Not offered";
  else if (row.design === null) design = "On request";
  else design = money(row.design);
  return [website, design];
}

function productRow(row) {
  const option = [];
  if (row.group) option.push(para(text(row.group, { size: 16, color: GREY })));
  option.push(para(text(row.label)));
  if (row.websiteLabel && row.websiteLabel !== row.label) {
    option.push(para(text(`Website: ${row.websiteLabel}`, { size: 16, color: GREY, italics: true })));
  }
  const [website, design] = priceCells(row);
  return new TableRow({
    cantSplit: true,
    children: [
      cell(option, { width: COLUMNS[0] }),
      cell([para(text(website), { alignment: AlignmentType.RIGHT })], { width: COLUMNS[1] }),
      cell([para(text(design, { bold: row.outcome === "differs" }), { alignment: AlignmentType.RIGHT })], { width: COLUMNS[2] }),
      cell([para(text(DECISION, { size: 18 }))], { width: COLUMNS[3] }),
      cell([para(text(row.id, { size: 14, color: GREY }))], { width: COLUMNS[4] }),
    ],
  });
}

const range = (min, max) => (min === null ? null : min === max ? money(min) : `${money(min)} – ${money(max)}`);

function sharedRow(entry) {
  const shown = entry.products.slice(0, 8).join(", ");
  const more = entry.products.length > 8 ? ` and ${entry.products.length - 8} more` : "";
  const option = [];
  if (entry.group) option.push(para(text(entry.group, { size: 16, color: GREY })));
  option.push(para(text(entry.label)));
  if (entry.websiteLabels.length && !(entry.websiteLabels.length === 1 && entry.websiteLabels[0] === entry.label)) {
    option.push(para(text(`Website: ${entry.websiteLabels.join("; ")}`, { size: 16, color: GREY, italics: true })));
  }
  option.push(para(text(`On ${entry.products.length} products: ${shown}${more}`, { size: 16, color: GREY })));
  const [website, design] = priceCells({ ...entry, website: entry.websiteMin });
  const websiteText = entry.outcome === "design-only" ? website : range(entry.websiteMin, entry.websiteMax) ?? website;
  return new TableRow({
    cantSplit: true,
    children: [
      cell(option, { width: COLUMNS[0] }),
      cell([para(text(websiteText), { alignment: AlignmentType.RIGHT })], { width: COLUMNS[1] }),
      cell([para(text(design, { bold: entry.outcome === "differs" }), { alignment: AlignmentType.RIGHT })], { width: COLUMNS[2] }),
      cell([para(text(DECISION, { size: 18 }))], { width: COLUMNS[3] }),
      cell([para(text(entry.id, { size: 14, color: GREY }))], { width: COLUMNS[4] }),
    ],
  });
}

function sharedSection(shared) {
  if (!shared?.length) return [];
  return [
    para(text("Options offered on many products"), { heading: HeadingLevel.HEADING_1, pageBreakBefore: true }),
    para(
      text(
        "These options appear on three or more products with the same design price. One decision here applies to " +
          "every product listed. Where the website price varies by product, the range is shown.",
        { color: GREY },
      ),
    ),
    table([headerRow(["Option", "Website now", "New design", "Decision", "Ref"], COLUMNS), ...shared.map(sharedRow)]),
  ];
}

function productBlock(product) {
  const out = [
    para(text(product.name), { heading: HeadingLevel.HEADING_2, keepNext: true }),
    para(
      text(
        `Matched to: ${product.matchedTo.length > 6 ? `${product.matchedTo.length} website records` : product.matchedTo.join(", ")}`,
        { size: 18, color: GREY },
      ),
      { keepNext: true },
    ),
    para(text(`${product.sameCount} ${product.sameCount === 1 ? "price already matches" : "prices already match"}`, { size: 18, color: GREY }), {
      keepNext: product.rows.length > 0,
    }),
  ];
  if (product.rows.length) {
    out.push(table([headerRow(["Option", "Website now", "New design", "Decision", "Ref"], COLUMNS), ...product.rows.map(productRow)]));
  }
  out.push(para(text("")));
  return out;
}

function appendixTable(title, items, nameLabel) {
  const out = [para(text(title), { heading: HeadingLevel.HEADING_2 })];
  if (!items.length) return [...out, para(text("None."))];
  out.push(
    table([
      headerRow([nameLabel, "Price"], [75, 25]),
      ...items.map(
        (it) =>
          new TableRow({
            cantSplit: true,
            children: [
              cell([para(text(it.name))], { width: 75 }),
              cell([para(text(money(it.basePrice) ?? "—"), { alignment: AlignmentType.RIGHT })], { width: 25 }),
            ],
          }),
      ),
    ]),
  );
  return out;
}

export async function renderDocument(report) {
  const sharedLines = report.shared?.length ?? 0;
  const productLines = report.sections.reduce((n, s) => n + s.products.reduce((m, p) => m + p.rows.length, 0), 0);
  const cover = [
    para(text("Price check: new design vs website"), { heading: HeadingLevel.TITLE }),
    para(text(`Prepared ${date(report.generatedAt)}. Website prices as of ${date(report.websiteAsOf)}.`, { color: GREY })),
    para(text("How to use this document"), { heading: HeadingLevel.HEADING_2 }),
    para(text(HOW_TO_USE)),
    para(
      text(
        `This document has ${sharedLines + productLines} lines to decide: ${sharedLines} for options offered on many ` +
          `products and ${productLines} for individual products.`,
        { bold: true },
      ),
    ),
    para(text("")),
    para(text("Prices compared, across all products"), { heading: HeadingLevel.HEADING_3 }),
    table([
      headerRow(["Result", "Prices"], [75, 25]),
      ...OUTCOME_LABELS.map(
        ([key, label]) =>
          new TableRow({
            children: [
              cell([para(text(label))], { width: 75 }),
              cell([para(text(String(report.totals[key] ?? 0)), { alignment: AlignmentType.RIGHT })], { width: 25 }),
            ],
          }),
      ),
    ]),
  ];

  const body = report.sections.flatMap((section) => [
    para(text(section.category), { heading: HeadingLevel.HEADING_1, pageBreakBefore: true }),
    ...section.products.flatMap(productBlock),
  ]);

  const appendix = [
    para(text("Appendix"), { heading: HeadingLevel.HEADING_1, pageBreakBefore: true }),
    ...appendixTable("New in the design (not on the website)", report.designOnly, "Product"),
    para(text("")),
    ...appendixTable("On the website but not in the new design", report.websiteOnly, "Product"),
  ];

  const doc = new Document({
    creator: "The Toronto Sauna Co.",
    title: "Price check: new design vs website",
    styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 864, bottom: 864, left: 864, right: 864 },
          },
        },
        children: [...cover, ...sharedSection(report.shared), ...body, ...appendix],
      },
    ],
  });
  return Packer.toBuffer(doc);
}
