// Data objects in a design page's script: JSON literals assigned to a name (`var D = {…}`, `self = this, D = {…}`)
// or returned from a method (`fdData() { return […] }`). Anything that isn't valid JSON is page logic and is skipped.

const ASSIGN = /(\b[A-Za-z_$][\w$]*)\s*=\s*([[{])/g;
const RETURN = /(\b[A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*return\s*([[{])/g;

/** Index just past the bracket matching the one at `start`, or -1. Skips "…", '…' and `…` strings. */
function matchBracket(s, start) {
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      for (i++; i < s.length && s[i] !== ch; i++) if (s[i] === "\\") i++;
      continue;
    }
    if (ch === "{" || ch === "[") depth++;
    else if (ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

const isEmpty = (v) => (Array.isArray(v) ? v.length === 0 : Object.keys(v).length === 0);

export function extractData(scriptText) {
  const found = [];
  for (const re of [ASSIGN, RETURN]) {
    for (const m of scriptText.matchAll(re)) {
      found.push({ name: m[1], start: m.index + m[0].length - 1 });
    }
  }
  found.sort((a, b) => a.start - b.start);

  const out = {};
  let acceptedUntil = -1;
  for (const { name, start } of found) {
    if (start < acceptedUntil) continue;
    const end = matchBracket(scriptText, start);
    if (end < 0) continue;
    let value;
    try {
      value = JSON.parse(scriptText.slice(start, end));
    } catch {
      continue;
    }
    if (isEmpty(value)) continue;
    acceptedUntil = end;
    const json = JSON.stringify(value);
    if (Object.entries(out).some(([k, v]) => (k === name || k.startsWith(`${name}_`)) && JSON.stringify(v) === json)) {
      continue;
    }
    let key = name;
    for (let n = 2; key in out; n++) key = `${name}_${n}`;
    out[key] = value;
  }
  return out;
}
