import { fetchProducts } from "@/assets/utils/request";

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
        url: `${baseUrl}/saunas/${product._id}`,
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

  // Service area routes (common locations in Ontario/Canada)
  const serviceAreas = [
    "toronto",
    "aurora",
    "markham",
    "vaughan",
    "richmond-hill",
    "oakville",
    "burlington",
    "ottawa",
    "barrie",
    "muskoka",
    "collingwood ",
    "kawarthas",
    "haliburton",
    "vancouver",
    "calgary",
  ];

  const serviceAreaEntries = serviceAreas.map((area) => ({
    url: `${baseUrl}/service-areas/${area}`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // Product category combinations for better SEO coverage
  const productCategories = [
    "/saunas/668af06648215c199c427a97",
    "/saunas/668af06648215c199c406a65",
    "/cold-plunge/6917e50d3f05f33c3f08ca61",
    "/saunas/668af06648215c199c406a64",
    "/saunas/691273a0fffa32247e8079f5",
  ];

  const categoryEntries = productCategories.map((category) => ({
    url: `${baseUrl}${category}`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Combine all entries
  return [
    ...staticSitemapEntries,
    ...productSitemapEntries,
    ...heaterSitemapEntries,
    ...serviceAreaEntries,
    ...categoryEntries,
  ];
}
