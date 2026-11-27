import { render, screen } from "@testing-library/react";
import { CITIES, getCity } from "../../lib/site/cities";
import { section, pick } from "../../lib/site/content";
import CityPage from "./CityPage";

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

describe("CityPage, every city", () => {
  it.each(CITIES.map((c) => [c.slug, c.page]))("renders %s from its design file", (slug, page) => {
    const { container } = render(<CityPage page={page} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(pick(section(page, "Hero"), "heading", 0, { level: 1 }).text);
    const sauna = [...container.querySelectorAll("a[href^='/saunas/']")].filter((a) => a.querySelector("img"));
    expect(sauna).toHaveLength(4);
    expect(container.querySelectorAll("details")).toHaveLength(5);
    const hood = pick(section(page, "Neighbourhoods"), "list").items;
    expect(container.querySelectorAll("[data-neighbourhoods] li")).toHaveLength(hood.length);
  });
});

describe("CityPage, Aurora", () => {
  beforeEach(() => render(<CityPage page={getCity("aurora").page} />));

  it("has the hero buttons", () => {
    expect(screen.getByRole("link", { name: "Book a Free Site Consult" })).toHaveAttribute("href", "/contact#visit");
    expect(screen.getByRole("link", { name: "Call (437) 429-6623" })).toBeInTheDocument();
  });

  it("shows the design's sauna prices", () => {
    for (const price of ["$17,896", "$18,735", "$22,350", "$15,450"]) expect(screen.getByText(price)).toBeInTheDocument();
  });

  it("has the local notes, nearby links and closing band", () => {
    expect(screen.getByText("Oak Ridges Moraine and conservation areas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All service areas →" })).toHaveAttribute("href", "/service-areas");
    expect(screen.getByRole("link", { name: "King City" })).toHaveAttribute("href", "/service-areas/king-city");
    expect(screen.getByRole("heading", { name: "Ready for a sauna in Aurora?" })).toBeInTheDocument();
  });
});
