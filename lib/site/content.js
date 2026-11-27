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

/**
 * Splits `blocks` into `count` groups shaped like `shape` (block types in order), e.g. number/title/text triples.
 * Throws on a wrong count or type, so a design change can't shift titles onto the wrong text without notice.
 */
export function groups(blocks, shape, count) {
  const list = Array.isArray(blocks) ? blocks : [];
  const where = blocks?.where ? ` in ${blocks.where}` : "";
  if (list.length !== shape.length * count) {
    throw new Error(`content: expected ${count} groups of ${shape.join(", ")}, found ${list.length} blocks${where}`);
  }
  const out = [];
  for (let g = 0; g < count; g++) {
    const group = list.slice(g * shape.length, (g + 1) * shape.length);
    group.forEach((block, i) => {
      if (block?.type !== shape[i]) {
        throw new Error(`content: group ${g + 1}, block ${i + 1} is ${block?.type}, expected ${shape[i]}${where}`);
      }
    });
    out.push(group);
  }
  return out;
}

export function pick(blocks, type, index = 0, { level } = {}) {
  const block = pickAll(blocks, type, { level })[index];
  if (!block) {
    const what = `${type}${level === undefined ? "" : ` level ${level}`} #${index}`;
    throw new Error(`content: missing ${what}${blocks?.where ? ` in ${blocks.where}` : ""}`);
  }
  return block;
}
