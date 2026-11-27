import { fetchProducts } from "@/assets/utils/request";
import { productPath } from "@/lib/products/slugs";
import { CITIES } from "@/lib/site/cities";

const baseUrl = "https://www.thetorontosaunaco.com";

// Static routes based on app directory structure
const staticRoutes = [
  "",
  "/about",
  "/accessories",
  "/best-sellers",
  "/blog",
  "/cold-plunge",
  "/consultation",
  "/custom-builds",
  "/heaters",
  "/quote",
  "/register",
  "/saunas",
  "/saunas/barell",
  "/saunas/canadian-timber",
  "/saunas/cube",
  "/saunas/indoor",
  "/saunas/luna",
  "/service-areas",
  "/showers",
  "/signin",
  "/terms",
  "/tubs",
  "/warranty",
  "/pacifictide",
];

export default async function sitemap() {
  // Get current date for lastModified
  const currentDate = new Date();

  // Create static routes
  const staticSitemapEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency:
      route === "" ? "weekly" : route.includes("/blog") ? "weekly" : "monthly",
    priority:
      route === ""
        ? 1
        : route === "/saunas"
          ? 0.9
          : route.includes("/saunas/")
            ? 0.8
            : 0.7,
  }));

  // Dynamic product routes
  let productSitemapEntries = [];
  try {
    const products = await fetchProducts();
    if (products && Array.isArray(products)) {
      productSitemapEntries = products.map((product) => ({
        // Slug URL when the product has one; until then (and for hot tubs) the old ID URL, which still renders.
        url: `${baseUrl}${productPath(product) ?? `/saunas/${product._id}`}`,
        lastModified: currentDate,
        changeFrequency: "monthly",
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.log("Error fetching products for sitemap:", error);
    // Continue without dynamic routes if products can't be fetched
  }

  let heaterSitemapEntries = [];
  try {
    const connectDB = (await import("@/config/db")).default;
    const Heaters = (await import("@/models/Heaters")).default;
    await connectDB();
    const heaters = await Heaters.find({}, { slug: 1 }).lean();
    heaterSitemapEntries = heaters.map((h) => ({
      url: `${baseUrl}/heaters/${h.slug || String(h._id)}`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch (error) {
    console.log("Error fetching heaters for sitemap:", error);
  }

  // Service area city pages (the 17 design cities)
  const serviceAreaEntries = CITIES.map(({ route }) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // Combine all entries
  return [
    ...staticSitemapEntries,
    ...productSitemapEntries,
    ...heaterSitemapEntries,
    ...serviceAreaEntries,
  ];
}
