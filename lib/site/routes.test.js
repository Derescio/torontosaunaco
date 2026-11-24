import { SITE_ROUTES, isSiteRoute } from "./routes";

describe("isSiteRoute", () => {
  it("includes the style guide", () => {
    expect(SITE_ROUTES).toContain("/style-guide");
  });

  it.each([
    ["/style-guide", true],
    ["/style-guide/x", true],
    ["/style-guidex", false],
    ["/", false],
    [null, false],
  ])("%s → %s", (pathname, expected) => {
    expect(isSiteRoute(pathname)).toBe(expected);
  });
});
