/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Keep preview/development deployments out of search results.
    if (process.env.VERCEL_ENV === "production") return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/thewhistlersaunaco",
        destination: "/",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "klgko4j9xb.ufs.sh",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "rehttps",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
