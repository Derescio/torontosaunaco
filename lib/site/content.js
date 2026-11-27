// Look up design copy (content/redesign/*.json) by section name and block type. Every miss throws, so a page whose
// design content changed fails the build instead of rendering with a gap.

export function section(page, name) {
  const found = (Array.isArray(page?.sections) ? page.sections : []).find((s) => s.name === name);
  const where = `${page?.file ?? "unknown page"} › ${name}`;
  if (!found) throw new Error(`content: ${page?.file ?? "unknown page"}: no section "${name}"`);
  const blocks = [...(Array.isArray(found.blocks) ? found.blocks : [])];
  blocks.where = where;
  return blocks;
}

const matches = (type, level) => (b) => b?.type === type && (level === undefined || b.level === level);

export function pickAll(blocks, type, { level } = {}) {
  return (Array.isArray(blocks) ? blocks : []).filter(matches(type, level));
}

export function pick(blocks, type, index = 0, { level } = {}) {
  const block = pickAll(blocks, type, { level })[index];
  if (!block) {
    const what = `${type}${level === undefined ? "" : ` level ${level}`} #${index}`;
    throw new Error(`content: missing ${what}${blocks?.where ? ` in ${blocks.where}` : ""}`);
  }
  return block;
}
