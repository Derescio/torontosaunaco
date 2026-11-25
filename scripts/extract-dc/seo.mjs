// The slim SEO index the site imports (content/seo.json): each route's extracted head and page-map row, nothing else.
// Kept out of content/redesign/ because the price diff and slug backfill read every .json there as a design page.

export function buildSeoIndex(pages) {
  const routes = {};
  for (const p of [...pages].filter((pg) => pg.route).sort((a, b) => (a.route < b.route ? -1 : 1))) {
    routes[p.route] = { head: p.head, pageMap: p.pageMap };
  }
  return { routes };
}
