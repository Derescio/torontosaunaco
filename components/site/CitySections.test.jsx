import { render, screen, within } from "@testing-library/react";
import Aurora from "../../content/redesign/CityAurora.json";
import { section, pick, pickAll, groups } from "../../lib/site/content";
import Chips from "./Chips";
import TrustStrip from "./TrustStrip";
import ProductCard from "./ProductCard";
import ReviewCard from "./ReviewCard";
import Faq from "./Faq";
import Steps from "./Steps";

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

describe("Chips", () => {
  it("renders plain items as a list without links", () => {
    const { container } = render(<Chips items={pick(section(Aurora, "Neighbourhoods"), "list").items} />);
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(5);
    expect(items[0]).toHaveTextContent("Aurora Estates");
    expect(container.querySelector("a")).toBeNull();
  });

  it("renders links as pill links", () => {
    const links = pickAll(section(Aurora, "Nearby"), "link").slice(0, 4);
    render(<Chips links={links} />);
    const anchors = screen.getAllByRole("link");
    expect(anchors).toHaveLength(4);
    expect(anchors[0]).toHaveAttribute("href", "/service-areas/king-city");
  });
});

describe("TrustStrip", () => {
  it("renders the four pairs with inline links", () => {
    render(<TrustStrip pairs={groups(section(Aurora, "Trust strip"), ["text", "text"], 4)} />);
    expect(screen.getByText("Showroom in King Township")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Directions" }).getAttribute("href")).toMatch(/^https:\/\/www\.google\.com\/maps/);
  });
});

describe("ProductCard", () => {
  it("links the whole card and shows the design price", () => {
    render(<ProductCard card={pickAll(section(Aurora, "Picks"), "card")[0]} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/saunas/neptune");
    expect(link).toHaveTextContent("The Neptune");
    expect(link).toHaveTextContent("5–6 person");
    expect(link).toHaveTextContent("$17,896");
  });
});

describe("ReviewCard", () => {
  it("labels the stars and cites the reviewer", () => {
    const [stars, quote] = groups(section(Aurora, "Reviews").slice(3), ["text", "quote"], 3)[0];
    const { container } = render(<ReviewCard stars={stars} quote={quote} />);
    expect(screen.getByRole("img", { name: "5 out of 5 stars" })).toBeInTheDocument();
    expect(within(container.querySelector("footer")).getByText("Matthew Alexander")).toBeInTheDocument();
  });
});

describe("Faq", () => {
  it("puts each question in a summary with the answer in the HTML", () => {
    const { container } = render(<Faq items={pickAll(section(Aurora, "FAQ"), "faq")} />);
    expect(container.querySelectorAll("details")).toHaveLength(5);
    expect(screen.getByText("How far is your showroom from Aurora?").closest("summary")).not.toBeNull();
    expect(screen.getByText(/^Our showroom is at 17380 Highway 27/)).toBeInTheDocument();
  });
});

describe("Steps", () => {
  const items = pick(section(Aurora, "Process"), "list").items.map(({ blocks: [number, title, text] }) => ({ number, title, text }));

  it("lays out as a row of four columns", () => {
    const { container } = render(<Steps items={items} layout="row" />);
    expect(container.querySelectorAll("li")).toHaveLength(4);
    expect(container.querySelector("ol")).toHaveClass("desktop:grid-cols-4");
  });

  it("stays a list by default", () => {
    const { container } = render(<Steps items={items} />);
    expect(container.querySelector("ol")).not.toHaveClass("desktop:grid-cols-4");
  });
});
