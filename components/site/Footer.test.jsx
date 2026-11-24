import { render, screen, within } from "@testing-library/react";
import Footer from "./Footer";
import { FOOTER_COLUMNS, FOOTER_BRAND, COPYRIGHT } from "./nav";

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
  const Image = (props) => <img {...props} />;
  return Image;
});

describe("Footer", () => {
  it("renders the brand lines", () => {
    render(<Footer />);
    for (const line of FOOTER_BRAND) expect(screen.getByText(line)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "The Toronto Sauna Co. home" })).toHaveAttribute("href", "/");
  });

  it("has a nav landmark for Shop, Company and Policies", () => {
    render(<Footer />);
    for (const title of ["Shop", "Company", "Policies"]) {
      expect(screen.getByRole("navigation", { name: title })).toBeInTheDocument();
    }
  });

  it("every footer link points to its href", () => {
    render(<Footer />);
    for (const column of FOOTER_COLUMNS) {
      const nav = within(screen.getByRole("navigation", { name: column.title }));
      for (const link of column.links) {
        expect(nav.getByRole("link", { name: link.label })).toHaveAttribute("href", link.href);
      }
    }
  });

  it("shows the copyright line", () => {
    render(<Footer />);
    expect(screen.getByText(COPYRIGHT)).toBeInTheDocument();
  });

  it("has one contentinfo landmark", () => {
    render(<Footer />);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
  });
});
