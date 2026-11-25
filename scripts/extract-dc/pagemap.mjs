// Reads `Launch File/page-map.csv`: which route each .dc.html design page becomes, with its SEO title and description.

/** RFC 4180 CSV: quoted fields, "" escapes, CRLF or LF, newlines inside quotes. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Map of design file name → { route, title, description, index, photos }. */
export function loadPageMap(csvText) {
  const [header, ...rows] = parseCsv(csvText);
  const col = (name) => {
    const i = header.indexOf(name);
    if (i < 0) throw new Error(`page-map.csv has no "${name}" column`);
    return i;
  };
  const c = {
    file: col("Design file"),
    route: col("Live address"),
    title: col("Page title (SEO)"),
    description: col("Search description (SEO)"),
    index: col("Index"),
    photos: col("Photos on page"),
  };
  const map = new Map();
  for (const r of rows) {
    if (!r[c.file]) continue;
    map.set(r[c.file], {
      route: r[c.route],
      title: r[c.title],
      description: r[c.description],
      index: r[c.index] ?? "",
      photos: Number(r[c.photos]) || 0,
    });
  }
  return map;
}
