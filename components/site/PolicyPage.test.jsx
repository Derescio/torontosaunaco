import { render, screen, within } from "@testing-library/react";
import PolicyPage from "./PolicyPage";
import { POLICY_PAGES, policyParts } from "../../lib/site/policy";

jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return Link;
});

describe.each(Object.entries(POLICY_PAGES))("PolicyPage %s", (route, page) => {
  const parts = policyParts(page);

  it("has one h1 with the page title", () => {
    render(<PolicyPage page={page} />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(parts.title.text);
  });

  it("breadcrumb links Home and leaves Policies as text", () => {
    render(<PolicyPage page={page} />);
    const crumb = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(crumb.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(crumb.queryByRole("link", { name: "Policies" })).toBeNull();
    expect(crumb.getByText(/Policies/)).toBeInTheDocument();
  });

  it("policy tabs: four links and the current page, in design order", () => {
    render(<PolicyPage page={page} />);
    const nav = screen.getByRole("navigation", { name: "Other policies" });
    const items = [...nav.children];
    expect(items.map((el) => el.textContent)).toEqual(parts.tabs.map((t) => t.label));
    expect(within(nav).getAllByRole("link")).toHaveLength(4);
    const current = nav.querySelector('[aria-current="page"]');
    expect(current.tagName).not.toBe("A");
    expect(current).toHaveTextContent(parts.tabs.find((t) => t.href === null).label);
  });

  it("shows every at-a-glance row", () => {
    const { container } = render(<PolicyPage page={page} />);
    expect(container.querySelectorAll("dl dt")).toHaveLength(parts.glance.items.length);
    expect(screen.getByText(parts.glance.label)).toBeInTheDocument();
  });

  it("renders every section heading", () => {
    render(<PolicyPage page={page} />);
    const h3s = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(h3s).toEqual(parts.groups.map((g) => g.heading.text));
  });

  it("ends with the question band and its call and email buttons", () => {
    render(<PolicyPage page={page} />);
    expect(screen.getByRole("heading", { level: 2, name: "Still have a question?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Call (437) 429-6623" })).toHaveAttribute("href", "tel:+14374296623");
    expect(screen.getByRole("link", { name: "Email us" })).toHaveAttribute("href", "mailto:sales@thetorontosaunaco.com");
  });
});

it("shipping says Schomberg, not King Township", () => {
  const { container } = render(<PolicyPage page={POLICY_PAGES["/shipping"]} />);
  expect(container.textContent).toContain("in Schomberg, by appointment");
  expect(container.textContent).not.toContain("King Township");
});
