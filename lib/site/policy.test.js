import { POLICY_PAGES, policyParts } from "./policy";
import { BLOCK_TYPES } from "../../components/site/Blocks";

const TAB_ORDER = ["Warranty", "Returns & Refunds", "Delivery & Shipping", "Terms of Service", "Privacy Policy"];

describe("policyParts", () => {
  it("covers the five policy routes", () => {
    expect(Object.keys(POLICY_PAGES).sort()).toEqual(["/privacy", "/refund-policy", "/shipping", "/terms", "/warranty"]);
  });

  it.each(Object.entries(POLICY_PAGES))("%s parses", (route, page) => {
    const p = policyParts(page);
    expect(page.route).toBe(route);
    expect(p.eyebrow).toBe("Our policies");
    expect(p.title.level).toBe(1);
    expect(p.breadcrumb[0]).toEqual({ text: "Home", href: "/" });
    expect(p.tabs.map((t) => t.label)).toEqual(TAB_ORDER);
    expect(p.tabs.filter((t) => t.href === null)).toHaveLength(1);
    expect(p.updated).toMatch(/^Last updated /);
    expect(p.intro.type).toBe("paragraph");
    expect(p.glance.label).toBe("AT A GLANCE");
    expect(p.glance.items.length).toBeGreaterThan(0);
    expect(p.groups.length).toBeGreaterThan(0);
    for (const g of p.groups) {
      expect(g.heading.level).toBe(3);
      expect(g.blocks.length).toBeGreaterThan(0);
    }
    expect(p.cta.heading.text).toBe("Still have a question?");
    expect(p.cta.text.type).toBe("paragraph");
    expect(p.cta.links.map((l) => l.href)).toEqual(["tel:+14374296623", "mailto:sales@thetorontosaunaco.com"]);
  });

  it.each([
    ["/shipping", "Delivery & Shipping"],
    ["/warranty", "Warranty"],
    ["/privacy", "Privacy Policy"],
  ])("current tab on %s is %s", (route, label) => {
    expect(policyParts(POLICY_PAGES[route]).tabs.find((t) => t.href === null).label).toBe(label);
  });

  it("other tabs link to their policy routes", () => {
    const hrefs = policyParts(POLICY_PAGES["/shipping"]).tabs.map((t) => t.href);
    expect(hrefs).toEqual(["/warranty", "/refund-policy", null, "/terms", "/privacy"]);
  });

  it("every block on the five pages is a type the renderer knows", () => {
    for (const page of Object.values(POLICY_PAGES)) {
      for (const block of page.sections.flatMap((s) => s.blocks)) {
        expect([...BLOCK_TYPES, "breadcrumb"]).toContain(block.type);
      }
    }
  });

  it("throws with the file name when the glance box is missing", () => {
    const page = JSON.parse(JSON.stringify(POLICY_PAGES["/shipping"]));
    page.sections[1].blocks = page.sections[1].blocks.filter((b) => b.type !== "definitions");
    expect(() => policyParts(page)).toThrow(/PolicyShipping\.dc\.html.*definitions/);
  });

  it("throws when a section is missing", () => {
    const page = { ...POLICY_PAGES["/terms"], sections: POLICY_PAGES["/terms"].sections.slice(0, 2) };
    expect(() => policyParts(page)).toThrow(/PolicyTerms\.dc\.html/);
  });

  describe("rejects extra content instead of dropping it", () => {
    const copy = () => JSON.parse(JSON.stringify(POLICY_PAGES["/shipping"]));
    const para = { type: "paragraph", html: "Extra", text: "Extra" };

    it("a fourth section", () => {
      const page = copy();
      page.sections.push({ name: "Section 4", blocks: [para] });
      expect(() => policyParts(page)).toThrow(/PolicyShipping\.dc\.html.*three sections/);
    });

    it("a second paragraph before the glance box", () => {
      const page = copy();
      page.sections[1].blocks.unshift(para);
      expect(() => policyParts(page)).toThrow(/PolicyShipping\.dc\.html.*before the at-a-glance box/);
    });

    it("a third question-band link", () => {
      const page = copy();
      page.sections[2].blocks.push({ type: "link", html: "Visit", text: "Visit", href: "/contact", variant: "button" });
      expect(() => policyParts(page)).toThrow(/PolicyShipping\.dc\.html.*question band/);
    });

    it("an empty glance box", () => {
      const page = copy();
      page.sections[1].blocks.find((b) => b.type === "definitions").items = [];
      expect(() => policyParts(page)).toThrow(/PolicyShipping\.dc\.html.*at-a-glance rows/);
    });

    it("a sixth tab", () => {
      const page = copy();
      const head = page.sections[0].blocks;
      head.splice(head.length - 1, 0, { type: "link", html: "Cookies", text: "Cookies", href: "/cookies", variant: "button" });
      expect(() => policyParts(page)).toThrow(/PolicyShipping\.dc\.html.*five tabs/);
    });

    it("an extra block in the header before the contact line", () => {
      const page = copy();
      page.sections[0].blocks.splice(3, 0, { type: "heading", level: 2, html: "Extra", text: "Extra" });
      expect(() => policyParts(page)).toThrow(/PolicyShipping\.dc\.html.*header/);
    });
  });

  it("no policy says King Township", () => {
    expect(JSON.stringify(POLICY_PAGES)).not.toContain("King Township");
  });
});
