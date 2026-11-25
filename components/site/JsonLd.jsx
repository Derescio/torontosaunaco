// Structured data for a page: <JsonLd data={pageSeo(route).jsonLd} />. One script tag per item.
// "<" is escaped so no string inside the data can close the script tag.

const serialise = (item) => JSON.stringify(item).replace(/</g, "\\u003c");

export default function JsonLd({ data }) {
  const items = (Array.isArray(data) ? data : data ? [data] : []).filter((item) => item && typeof item === "object");
  if (!items.length) return null;
  return items.map((item, i) => (
    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(item) }} />
  ));
}
