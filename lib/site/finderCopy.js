import { section, pick } from "./content";

// The Sauna Finder's copy from SaunaFinder.json ("Sauna finder" section). The design keeps the indoor-only field,
// the idle hint and the no-match message inside `if` blocks keyed by its state variables; they are read by that key.

function branch(blocks, value) {
  const found = blocks.find((b) => b?.type === "if" && b.value === value);
  if (!found) throw new Error(`content: no "${value}" block in ${blocks.where}`);
  return found.blocks;
}

const field = (b) => ({ label: b.label, placeholder: b.placeholder ?? "" });

export function finderCopy(page) {
  const blocks = section(page, "Sauna finder");
  const fields = blocks.filter((b) => b?.type === "field");
  if (fields.length !== 2) throw new Error(`content: expected 2 fields in ${blocks.where}`);
  const ready = branch(blocks, "{{fdReady}}");
  const none = branch(ready, "{{fdNone}}");
  if (none.length !== 2) throw new Error(`content: expected 2 no-match blocks in ${blocks.where}`);

  return {
    breadcrumb: pick(section(page, "Section 1"), "breadcrumb").items,
    eyebrow: pick(blocks, "text", 0),
    heading: pick(blocks, "heading"),
    lead: pick(blocks, "paragraph"),
    widthField: field(fields[0]),
    depthField: field(fields[1]),
    ceilingField: field(pick(branch(blocks, "{{fdIndoor}}"), "field")),
    peopleLabel: pick(blocks, "text", 1),
    idle: pick(branch(blocks, "{{fdIdle}}"), "paragraph"),
    none,
    quoteLabel: pick(blocks, "link", 0).text,
    footnote: pick(blocks, "text", 2),
  };
}
