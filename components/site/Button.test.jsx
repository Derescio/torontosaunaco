import { render, screen } from "@testing-library/react";
import Button from "./Button";
import { cn } from "../../lib/site/cn";

jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return Link;
});

describe("Button", () => {
  it('renders a button with type="button" by default', () => {
    render(<Button>Book a visit</Button>);
    expect(screen.getByRole("button", { name: "Book a visit" })).toHaveAttribute("type", "button");
  });

  it("keeps an explicit type", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("renders a link with the href when href is given", () => {
    render(<Button href="/saunas">Shop saunas</Button>);
    const link = screen.getByRole("link", { name: "Shop saunas" });
    expect(link).toHaveAttribute("href", "/saunas");
    expect(link).not.toHaveAttribute("type");
  });

  it.each([
    ["dark", "bg-ink"],
    ["walnut", "bg-walnut"],
    ["light", "bg-white"],
    ["outline-light", "border-white"],
    ["outline-walnut", "border-walnut"],
  ])("applies the %s variant classes", (variant, cls) => {
    render(<Button variant={variant}>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass(cls, "rounded-full", "font-semibold");
  });

  it.each([
    ["sm", ["h-9", "px-4", "text-small"]],
    ["md", ["h-11", "px-5", "text-small"]],
    ["lg", ["h-13", "px-7", "text-body"]],
  ])("applies the %s size classes", (size, classes) => {
    render(<Button size={size}>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass(...classes);
  });

  it("defaults to dark and md", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-ink", "h-11");
  });

  it("keeps the size class when a colour class is added", () => {
    expect(cn("text-small", "text-white").split(" ")).toEqual(["text-small", "text-white"]);
    expect(cn("text-small", "text-body")).toBe("text-body");
  });

  it("lets the caller override the fill", () => {
    render(
      <Button variant="walnut" className="bg-ink">
        Go
      </Button>
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("bg-ink");
    expect(btn).not.toHaveClass("bg-walnut");
  });

  it("keeps variant classes when the caller adds layout classes", () => {
    render(<Button className="w-full">Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("w-full", "bg-ink", "text-small", "text-white");
  });
});
