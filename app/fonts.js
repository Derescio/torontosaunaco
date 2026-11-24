import localFont from "next/font/local";

// Redesign fonts, self-hosted (latin, variable weight) and exposed as CSS variables only
// (see fontFamily in lib/site/tokens.js). Setting variables on <html> doesn't change the
// live pages, which keep Poppins.
// Local files, not next/font/google: Google now serves some subsets from extensionless URLs,
// which crashes the next/font/google loader in Next 15.2.
export const display = localFont({
  src: [
    { path: "../assets/fonts/site/cormorant-garamond-latin.woff2", weight: "500 700", style: "normal" },
    { path: "../assets/fonts/site/cormorant-garamond-italic-latin.woff2", weight: "500 700", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const body = localFont({
  src: [{ path: "../assets/fonts/site/manrope-latin.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
