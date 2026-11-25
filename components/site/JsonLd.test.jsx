import { render } from "@testing-library/react";
import JsonLd from "./JsonLd";

const scripts = (container) => [...container.querySelectorAll('script[type="application/ld+json"]')];

describe("JsonLd", () => {
  it("renders one script per item", () => {
    const items = [{ "@type": "WebPage", name: "About" }, { "@type": "BreadcrumbList" }];
    const { container } = render(<JsonLd data={items} />);
    const tags = scripts(container);
    expect(tags).toHaveLength(2);
    expect(tags.map((t) => JSON.parse(t.innerHTML))).toEqual(items);
  });

  it("accepts a single object", () => {
    const { container } = render(<JsonLd data={{ "@type": "WebPage" }} />);
    expect(scripts(container)).toHaveLength(1);
  });

  it("escapes < so text can't close the script tag", () => {
    const { container } = render(<JsonLd data={[{ text: "a</script><b>" }]} />);
    const html = scripts(container)[0].innerHTML;
    expect(html).not.toContain("</script>");
    expect(html).toContain("\\u003c/script>");
    expect(JSON.parse(html).text).toBe("a</script><b>");
  });

  it("renders nothing for empty or missing data", () => {
    expect(scripts(render(<JsonLd data={null} />).container)).toHaveLength(0);
    expect(scripts(render(<JsonLd data={[]} />).container)).toHaveLength(0);
  });
});
