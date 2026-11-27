import { SITE_ROUTES, isSiteRoute } from "./routes";

describe("isSiteRoute", () => {
  it("includes the style guide", () => {
    expect(SITE_ROUTES).toContain("/style-guide");
    expect(SITE_ROUTES).toContain("/progress");
  });

  it.each(["/privacy", "/refund-policy", "/shipping", "/terms", "/warranty", "/about", "/wellness", "/contact"])("serves the page %s", (route) => {
    expect(SITE_ROUTES).toContain(route);
    expect(isSiteRoute(route)).toBe(true);
  });

  it.each([
    ["/termsx", false],
    ["/style-guide", true],
    ["/style-guide/x", true],
    ["/style-guidex", false],
    ["/", false],
    [null, false],
  ])("%s → %s", (pathname, expected) => {
    expect(isSiteRoute(pathname)).toBe(expected);
  });
});
