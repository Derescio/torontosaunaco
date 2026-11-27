import { render, screen, within } from "@testing-library/react";
import AboutPage from "./AboutPage";
import About from "../../content/redesign/About.json";

jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return Link;
});
jest.mock("./CloudinaryImage", () => {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  const Img = ({ fill, priority, loader, ...props }) => <img {...props} />;
  return Img;
});

const blocks = About.sections.flatMap((s) => s.blocks);

describe("AboutPage", () => {
  it("has one h1", () => {
    render(<AboutPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Customer first. Every time.");
  });

  it("renders every section heading in design order", () => {
    render(<AboutPage />);
    const want = blocks.filter((b) => b.type === "heading" && b.level === 2).map((b) => b.text);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(want);
  });

  it("renders every photo with its alt text", () => {
    render(<AboutPage />);
    for (const img of blocks.filter((b) => b.type === "image")) expect(screen.getByAltText(img.alt)).toBeInTheDocument();
  });

  it("breadcrumb links home", () => {
    render(<AboutPage />);
    const crumb = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(crumb.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  });

  it("keeps the quote, numbered points and showroom details", () => {
    const { container } = render(<AboutPage />);
    expect(container.querySelector("blockquote")).toHaveTextContent("Every inquiry gets a fast, real answer.");
    for (const t of ["Fast response", "Customer first", "Solutions, not obstacles", "Support that lasts"]) {
      expect(screen.getByText(t)).toBeInTheDocument();
    }
    expect(container.textContent).toContain("17380 Highway 27, Schomberg, ON (by appointment)");
  });

  it("links the buttons as designed", () => {
    render(<AboutPage />);
    expect(screen.getByRole("link", { name: "Book a visit" })).toHaveAttribute("href", "/contact#visit");
    expect(screen.getByRole("link", { name: "Find your fit" })).toHaveAttribute("href", "/sauna-finder");
    expect(screen.getAllByRole("link", { name: "Call (437) 429-6623" })[0]).toHaveAttribute("href", "tel:+14374296623");
  });

  it("says Schomberg and never King Township or Leisurecraft", () => {
    const { container } = render(<AboutPage />);
    expect(container.textContent).toContain("Schomberg");
    expect(container.textContent).not.toMatch(/King Township|Leisurecraft/);
  });
});
