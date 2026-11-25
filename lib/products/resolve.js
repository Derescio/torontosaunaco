import connectDB from "@/config/db";
import Products from "@/models/Products";
import { isLikelyMongoObjectId } from "@/assets/utils/slugify";
import { kindOf, productPath } from "./slugs";

const plain = (doc) => JSON.parse(JSON.stringify(doc));

/**
 * Turns a product route param into what the page should do.
 * - ObjectId: redirect to the product's slug URL when it has one; otherwise render it as today (no slug yet, hot tub).
 * - Slug: render only a product of this route's family (`kind`, see kindOf).
 * @returns {Promise<{ product: object } | { redirectTo: string } | null>} null → notFound()
 */
export async function resolveProductParam(param, kind) {
  if (typeof param !== "string" || !param) return null;
  await connectDB();

  if (isLikelyMongoObjectId(param)) {
    const product = await Products.findById(param).lean();
    if (!product) return null;
    const redirectTo = productPath(product);
    return redirectTo ? { redirectTo } : { product: plain(product) };
  }

  const product = await Products.findOne({ slug: param.toLowerCase() }).lean();
  if (!product || kindOf(product) !== kind) return null;
  return { product: plain(product) };
}

/**
 * Slugs to pre-render for a family. Saunas split in two routes: /saunas/[id] (`indoor: false`) and
 * /saunas/indoor/[slug] (`indoor: true`, folder removed).
 */
export async function staticSlugs(kind, { indoor = false } = {}) {
  await connectDB();
  const docs = await Products.find({ slug: { $type: "string" } }, "slug type").lean();
  const slugs = (Array.isArray(docs) ? docs : []).filter((d) => d.slug && kindOf(d) === kind).map((d) => d.slug);
  if (kind !== "sauna") return slugs;
  return indoor
    ? slugs.filter((s) => s.startsWith("indoor/")).map((s) => s.slice("indoor/".length))
    : slugs.filter((s) => !s.includes("/"));
}
