import { render, screen, within } from "@testing-library/react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import { MAIN_NAV } from "./nav";

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));
jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return Link;
});
jest.mock("next/image", () => {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  const Image = ({ priority, ...props }) => <img {...props} />;
  return Image;
});
jest.mock("./MobileMenu", () => () => null);

const renderAt = (pathname) => {
  usePathname.mockReturnValue(pathname);
  return render(<Header />);
};
const mainNav = () => within(screen.getByRole("navigation", { name: "Main" }));

describe("Header", () => {
  it("renders every main nav label as a link to its href", () => {
    renderAt("/");
    for (const item of MAIN_NAV) {
      expect(mainNav().getByRole("link", { name: new RegExp(`^${item.label}`) })).toHaveAttribute("href", item.href);
    }
  });

  it("renders every dropdown child link", () => {
    renderAt("/");
    for (const child of MAIN_NAV.flatMap((item) => item.children ?? [])) {
      expect(mainNav().getByRole("link", { name: new RegExp(child.label) })).toHaveAttribute("href", child.href);
    }
  });

  it("marks Outdoor Saunas current on /saunas/cube", () => {
    renderAt("/saunas/cube");
    const current = mainNav()
      .getAllByRole("link")
      .filter((a) => a.getAttribute("aria-current") === "page");
    expect(current.map((a) => a.textContent)).toEqual([expect.stringMatching(/^Outdoor Saunas/)]);
  });

  it("marks Heaters current on /sauna-heaters", () => {
    renderAt("/sauna-heaters");
    expect(mainNav().getByRole("link", { name: "Heaters" })).toHaveAttribute("aria-current", "page");
  });

  it("marks nothing current on /", () => {
    renderAt("/");
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(0);
  });

  it("phone link is tel:+14374296623", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: "(437) 429-6623" })).toHaveAttribute("href", "tel:+14374296623");
  });

  it("cart links to /cart", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: "Cart" })).toHaveAttribute("href", "/cart");
  });

  it("shows the Schomberg showroom note", () => {
    renderAt("/");
    expect(screen.getByText(/Showroom in Schomberg, by appointment/)).toBeInTheDocument();
  });

  it("links Find your fit and Request a Quote", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: "Find your fit" })).toHaveAttribute("href", "/sauna-finder");
    expect(screen.getAllByRole("link", { name: "Request a Quote" })[0]).toHaveAttribute("href", "/contact");
  });

  it("logo links home with an accessible name", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: "The Toronto Sauna Co. home" })).toHaveAttribute("href", "/");
  });

  it("has one banner landmark", () => {
    renderAt("/");
    expect(screen.getAllByRole("banner")).toHaveLength(1);
  });
});
