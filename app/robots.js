const baseUrl = "https://www.thetorontosaunaco.com";

export default function robots() {
  // Preview deployments stay crawlable so Google can see the noindex header
  // (set in next.config.mjs) and drop pages it has already indexed.
  if (process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", allow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/editor/",
        "/marketing/",
        "/checkout",
        "/profile",
        "/orders",
        "/messages",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
