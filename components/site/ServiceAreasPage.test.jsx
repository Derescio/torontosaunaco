import { render, screen } from "@testing-library/react";
import ServiceAreasPage from "./ServiceAreasPage";

jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return Link;
});

describe("ServiceAreasPage", () => {
  beforeEach(() => render(<ServiceAreasPage />));

  it("has the design heading", () => {
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Backyard Sauna Service Areas");
  });

  it("links all 17 cities in the design's order", () => {
    const links = screen.getAllByRole("link", { name: /^Backyard saunas in / });
    expect(links).toHaveLength(17);
    expect(links[0]).toHaveAttribute("href", "/service-areas/toronto");
    expect(links[16]).toHaveAttribute("href", "/service-areas/collingwood");
  });

  it("shows each card's region and neighbourhoods", () => {
    expect(screen.getByText("Peel Region")).toBeInTheDocument();
    expect(screen.getByText("Rosedale, Forest Hill, Lawrence Park, Leaside")).toBeInTheDocument();
  });

  it("keeps the closing paragraph and breadcrumb links", () => {
    expect(screen.getByRole("link", { name: "Ask us about your area" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  });
});
