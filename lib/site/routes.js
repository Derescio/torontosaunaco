// Paths served from app/(site)/ with the redesign Header and Footer. ConditionalNavAndFooter
// leaves out the live site's nav and footer for these. Add each route as its page moves over.
export const SITE_ROUTES = [
  "/style-guide",
  "/progress",
  "/privacy",
  "/refund-policy",
  "/shipping",
  "/terms",
  "/warranty",
];

export function isSiteRoute(pathname) {
  if (!pathname) return false;
  return SITE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
