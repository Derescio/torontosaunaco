import { render, screen, fireEvent, act } from "@testing-library/react";
import MobileMenu from "./MobileMenu";

jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }) => (
    <a
      href={href}
      {...props}
      onClick={(e) => {
        e.preventDefault();
        props.onClick?.(e);
      }}
    >
      {children}
    </a>
  );
  return Link;
});

const menuButton = () => screen.getByRole("button", { name: "Menu" });
const open = () => fireEvent.click(menuButton());

describe("MobileMenu", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("is closed by default", () => {
    render(<MobileMenu pathname="/" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(menuButton()).toHaveAttribute("aria-controls", "site-mobile-menu");
  });

  it("shows the menu button as an icon in a walnut circle, named Menu for screen readers", () => {
    render(<MobileMenu pathname="/" />);
    expect(menuButton()).toHaveAttribute("aria-label", "Menu");
    expect(menuButton().textContent).toBe("");
    expect(menuButton()).toHaveClass("rounded-full", "border-walnut", "text-walnut");
    expect(menuButton().parentElement).toHaveClass("desktop:hidden");
  });

  it("opens the panel and moves focus to the close button", () => {
    render(<MobileMenu pathname="/" />);
    open();
    expect(screen.getByRole("dialog", { name: "Menu" })).toHaveAttribute("id", "site-mobile-menu");
    expect(menuButton()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveFocus();
  });

  it("locks page scroll while open and restores it on close", () => {
    render(<MobileMenu pathname="/" />);
    open();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(document.body.style.overflow).toBe("");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the Menu button", () => {
    render(<MobileMenu pathname="/" />);
    open();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(menuButton()).toHaveFocus();
  });

  it("expands a group to show its links", () => {
    render(<MobileMenu pathname="/" />);
    open();
    const group = screen.getByRole("button", { name: "Outdoor Saunas" });
    expect(group).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Cube Saunas" })).not.toBeInTheDocument();
    fireEvent.click(group);
    expect(group).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Cube Saunas" })).toHaveAttribute("href", "/saunas/cube");
  });

  it("links a group's own page when no child covers it", () => {
    render(<MobileMenu pathname="/" />);
    open();
    fireEvent.click(screen.getByRole("button", { name: "Indoor Saunas" }));
    expect(screen.getByRole("link", { name: "All Indoor Saunas" })).toHaveAttribute("href", "/saunas/indoor");
  });

  it("closes when a link is followed", () => {
    render(<MobileMenu pathname="/" />);
    open();
    fireEvent.click(screen.getByRole("link", { name: "Heaters" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes when the page changes", () => {
    const { rerender } = render(<MobileMenu pathname="/" />);
    open();
    rerender(<MobileMenu pathname="/saunas" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes when the window widens to desktop", () => {
    let listener;
    window.matchMedia = jest.fn(() => ({
      matches: false,
      addEventListener: (_type, fn) => (listener = fn),
      removeEventListener: jest.fn(),
    }));
    render(<MobileMenu pathname="/" />);
    open();
    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 998px)");
    act(() => listener({ matches: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    delete window.matchMedia;
  });

  it("shows Find your fit, Request a Quote and the phone number", () => {
    render(<MobileMenu pathname="/" />);
    open();
    expect(screen.getByRole("link", { name: "Find your fit" })).toHaveAttribute("href", "/sauna-finder");
    expect(screen.getByRole("link", { name: "Request a Quote" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: /437/ })).toHaveAttribute("href", "tel:+14374296623");
  });

  it("marks the current page with aria-current", () => {
    render(<MobileMenu pathname="/accessories" />);
    open();
    expect(screen.getByRole("link", { name: "Accessories" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Heaters" })).not.toHaveAttribute("aria-current");
  });
});
