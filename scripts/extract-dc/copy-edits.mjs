// Approved copy changes applied to every extracted string (html and text), so they survive re-running extract:dc.
// Exact find/replace only. Add a rule only with the owner's approval and say why.
// extract-dc.mjs fails if a rule matches nothing, which means the design changed and the rule is stale.

export const COPY_EDITS = [
  {
    find: "Schomberg (King Township)",
    replace: "Schomberg",
    why: 'Owner, 2026-11-26: use "Schomberg" everywhere (CLAUDE.md).',
  },
];

/** Deep copy of `value` with every edit applied to every string; `counts` gets occurrences per `find`. */
export function applyCopyEdits(value, edits = COPY_EDITS, counts = new Map()) {
  if (typeof value === "string") {
    let s = value;
    for (const { find, replace } of edits) {
      const parts = s.split(find);
      if (parts.length > 1) {
        counts.set(find, (counts.get(find) ?? 0) + parts.length - 1);
        s = parts.join(replace);
      }
    }
    return s;
  }
  if (Array.isArray(value)) return value.map((v) => applyCopyEdits(v, edits, counts));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, applyCopyEdits(v, edits, counts)]));
  }
  return value;
}

/** Edits that never matched in a run. */
export function unusedEdits(counts, edits = COPY_EDITS) {
  return edits.filter((e) => !counts.get(e.find));
}
