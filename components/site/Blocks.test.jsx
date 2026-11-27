import { render, screen } from "@testing-library/react";
import Blocks, { Block, BLOCK_TYPES } from "./Blocks";
import shipping from "../../content/redesign/PolicyShipping.json";
import warranty from "../../content/redesign/PolicyWarranty.json";

jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return Link;
});

const find = (page, type, i = 0) => page.sections.flatMap((s) => s.blocks).filter((b) => b.type === type)[i];

describe("Blocks", () => {
  it("lists the block types it renders", () => {
    expect(BLOCK_TYPES).toEqual(["paragraph", "heading", "text", "list", "definitions", "link"]);
  });

  it("paragraph keeps inline tel and mailto links", () => {
    render(<Block block={find(shipping, "paragraph")} />);
    expect(screen.getByRole("link", { name: "(437) 429-6623" })).toHaveAttribute("href", "tel:+14374296623");
    expect(screen.getByRole("link", { name: "sales@thetorontosaunaco.com" })).toHaveAttribute(
      "href",
      "mailto:sales@thetorontosaunaco.com"
    );
  });

  it("heading renders its level", () => {
    render(<Block block={{ type: "heading", level: 3, html: "What&#8217;s covered", text: "What’s covered" }} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("What’s covered");
  });

  it("renders ordered and unordered lists", () => {
    const { container } = render(<Blocks blocks={[find(warranty, "list", 0), find(warranty, "list", 1)]} />);
    expect(container.querySelectorAll("ul > li")).toHaveLength(5);
    expect(container.querySelectorAll("ol > li")).toHaveLength(3);
  });

  it("definitions render term and details", () => {
    const { container } = render(<Block block={find(shipping, "definitions")} />);
    expect(container.querySelectorAll("dl dt")).toHaveLength(5);
    expect(screen.getByText("$1,750 anywhere in Ontario").tagName).toBe("DD");
  });

  it("button link points at its href", () => {
    const block = { type: "link", variant: "button", html: "Email us", text: "Email us", href: "mailto:sales@thetorontosaunaco.com" };
    render(<Block block={block} />);
    expect(screen.getByRole("link", { name: "Email us" })).toHaveAttribute("href", "mailto:sales@thetorontosaunaco.com");
  });

  it("plain link keeps its href", () => {
    render(<Block block={{ type: "link", html: "Warranty", text: "Warranty", href: "/warranty" }} />);
    expect(screen.getByRole("link", { name: "Warranty" })).toHaveAttribute("href", "/warranty");
  });

  it("unknown block renders nothing", () => {
    const { container } = render(<Block block={{ type: "carousel" }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
