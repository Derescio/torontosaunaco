// Every header and footer link for the redesign. Copy is verbatim from the design (.dc.html);
// routes come from page-map.csv. See docs/superpowers/specs/2026-11-24-header-footer-design.md.

export const CONTACT = {
  phone: "(437) 429-6623",
  tel: "tel:+14374296623",
  note: "Showroom in Schomberg, by appointment · Delivery and installation across Ontario",
};

const thumb = (file) => ({ src: `/images/site/${file}`, alt: "" });

export const MAIN_NAV = [
  {
    label: "Outdoor Saunas",
    href: "/saunas/best-sellers",
    match: ["/saunas"],
    exclude: ["/saunas/indoor"],
    width: "w-[300px]",
    children: [
      { label: "Best Sellers", href: "/saunas/best-sellers", description: "Our most popular backyard saunas" },
      { label: "Cube Saunas", href: "/saunas/cube", description: "Modern glass-front Pure Cube, Studio Six and more" },
      { label: "Barrel Saunas", href: "/saunas/barrel", description: "Classic cedar barrels, with porch options" },
      { label: "Cabin & Canadian Timber", href: "/saunas/canadian-timber", description: "Traditional cabins and log saunas" },
      { label: "All Outdoor Saunas", href: "/saunas", description: "Browse every outdoor model" },
      { label: "Luna Saunas", href: "/saunas/luna", description: "Modern cedar cabins with rounded corners" },
    ],
  },
  {
    label: "Plunge & Shower",
    href: "/cold-plunges",
    match: ["/cold-plunges", "/outdoor-showers"],
    width: "w-[340px]",
    children: [
      { label: "Cold Plunges", href: "/cold-plunges", description: "Cedar plunge tubs and chillers", image: thumb("nav-cold-plunges.jpg") },
      { label: "Outdoor Showers", href: "/outdoor-showers", description: "Pillar, enclosed and barrel showers", image: thumb("nav-outdoor-showers.jpg") },
    ],
  },
  {
    label: "Indoor Saunas",
    href: "/saunas/indoor",
    match: ["/saunas/indoor"],
    width: "w-[340px]",
    children: [
      { label: "Indoor Sauna Kits", href: "/saunas/indoor/kits", description: "Ready-made rooms in set sizes, from $8,070", image: thumb("nav-indoor-kits.jpg") },
      { label: "Custom Indoor Saunas", href: "/saunas/indoor/custom", description: "Designed and built into your space", image: thumb("nav-indoor-custom.jpg") },
    ],
  },
  { label: "Heaters", href: "/sauna-heaters", match: ["/sauna-heaters"] },
  { label: "Accessories", href: "/accessories", match: ["/accessories"] },
  { label: "Wellness", href: "/wellness", match: ["/wellness"] },
  { label: "Contact", href: "/contact", match: ["/contact"] },
];

export const HEADER_ACTIONS = {
  finder: { label: "Find your fit", href: "/sauna-finder" },
  quote: { label: "Request a Quote", href: "/contact" },
  cart: { label: "Cart", href: "/cart" },
};

export const FOOTER_BRAND = [
  "Premium Canadian cedar saunas, delivered across Ontario.",
  "Showroom visits by appointment only.",
];

export const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Outdoor Saunas", href: "/saunas/best-sellers" },
      { label: "Cold Plunges", href: "/cold-plunges" },
      { label: "Outdoor Showers", href: "/outdoor-showers" },
      { label: "Indoor Saunas", href: "/saunas/indoor" },
      { label: "Heaters", href: "/sauna-heaters" },
      { label: "Accessories", href: "/accessories" },
      { label: "Custom Saunas", href: "/custom-builds" },
      { label: "Sauna Finder", href: "/sauna-finder" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Wellness", href: "/wellness" },
      { label: "Service Areas", href: "/service-areas" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Warranty", href: "/warranty" },
      { label: "Shipping", href: "/shipping" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Instagram", href: "https://instagram.com/thetorontosaunaco" },
    ],
  },
];

export const COPYRIGHT = "© 2026 Toronto Sauna Co. All rights reserved.";

const within = (pathname, base) => pathname === base || pathname.startsWith(`${base}/`);

// True when `pathname` is one of the item's sections, and not one it excludes.
export function isActive(item, pathname) {
  if (!pathname) return false;
  if ((item.exclude ?? []).some((base) => within(pathname, base))) return false;
  return item.match.some((base) => within(pathname, base));
}
