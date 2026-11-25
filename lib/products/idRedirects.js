// Old product ID URLs → slug URLs, as next.config.mjs redirects built at `next build`.
// Why not only permanentRedirect() in the pages: app/loading.jsx makes every page stream, so a redirect thrown while
// rendering arrives as a 200 with a meta refresh (and ISR caches it). Config redirects are real 308s served by Vercel
// before any page runs. Products added after a build fall back to the page's soft redirect until the next build.
// Loaded by Node directly from next.config.mjs, so imports are relative with extensions.

import { kindOf, productPath } from "./slugs.js";
import { assertMongoTargetAllowed } from "../env/safety.js";

// Old URL roots per family. Every product, whatever its type, has also been reachable at /saunas/<id>.
const OLD_ROOTS = { "cold-plunge": ["/cold-plunge"], shower: ["/showers"] };

/** [{ source, destination, permanent: true }] for every product with a slug URL. */
export function idRedirects(products) {
  if (!Array.isArray(products)) return [];
  const out = [];
  for (const product of products) {
    const destination = productPath(product);
    if (!destination) continue;
    const id = String(product._id);
    for (const root of ["/saunas", ...(OLD_ROOTS[kindOf(product)] ?? [])]) {
      out.push({ source: `${root}/${id}`, destination, permanent: true });
    }
  }
  return out;
}

/** Reads products from MONGO_URI (with the staging/production guard). Never fails the build: [] and a warning. */
export async function loadIdRedirects(env = process.env) {
  const uri = env.MONGO_URI;
  if (!uri) {
    console.warn("idRedirects: MONGO_URI not set; no product ID redirects");
    return [];
  }
  assertMongoTargetAllowed(uri, env);
  const { MongoClient } = await import("mongodb");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const products = await client
      .db()
      .collection("products")
      .find({ slug: { $type: "string" } }, { projection: { type: 1, slug: 1 } })
      .toArray();
    return idRedirects(products);
  } catch (err) {
    console.warn(`idRedirects: could not read products (${err.message}); no product ID redirects`);
    return [];
  } finally {
    await client.close();
  }
}
