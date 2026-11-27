import { render, screen } from "@testing-library/react";
import About from "../../content/redesign/About.json";
import Wellness from "../../content/redesign/Wellness.json";
import { section, pick, pickAll } from "../../lib/site/content";
import { Block } from "./Blocks";
import SectionHeader from "./SectionHeader";
import Split from "./Split";
import NumberedPoints from "./NumberedPoints";
import StatGrid from "./StatGrid";
import PhotoGrid from "./PhotoGrid";
import Steps from "./Steps";
import CtaBand from "./CtaBand";

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

const triples = (blocks, start, size) => {
  const out = [];
  for (let i = start; i + size - 1 < blocks.length; i += size) out.push(blocks.slice(i, i + size));
  return out;
};

describe("Blocks additions", () => {
  it("renders a quote as a blockquote", () => {
    const quote = pick(section(About, "Approach"), "quote");
    render(<Block block={quote} />);
    expect(screen.getByText(/Every inquiry gets a fast, real answer/).closest("blockquote")).not.toBeNull();
  });

  it("styles the italic phrase in headings", () => {
    render(<Block block={pick(section(About, "Approach"), "heading")} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("[&_em]:italic");
  });
});

describe("SectionHeader", () => {
  it("renders eyebrow, heading and lead", () => {
    const b = section(Wellness, "Research");
    render(<SectionHeader eyebrow={pick(b, "text")} heading={pick(b, "heading")} lead={pick(b, "paragraph")} />);
    expect(screen.getByText("What the research says").closest("span.uppercase")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("The science of sweat.");
    expect(screen.getByText(/Much of the best-known research/)).toBeInTheDocument();
  });

  it("renders an h1 when asked", () => {
    const b = section(About, "About hero");
    render(<SectionHeader as="h1" heading={pick(b, "heading", 0, { level: 1 })} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Customer first. Every time.");
  });
});

describe("Split", () => {
  it("shows the image beside its content", () => {
    const b = section(About, "Service after install");
    const image = pick(b, "image");
    render(
      <Split image={image} dark>
        <p>content</p>
      </Split>
    );
    expect(screen.getByAltText(image.alt)).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});

describe("NumberedPoints", () => {
  it("renders each number, title and text", () => {
    const b = section(About, "What you can count on");
    const items = triples(b.slice(2), 0, 3).map(([number, title, text]) => ({ number, title, text }));
    render(<NumberedPoints items={items} />);
    expect(items).toHaveLength(4);
    for (const t of ["01", "Fast response", "Support that lasts"]) expect(screen.getByText(t)).toBeInTheDocument();
  });
});

describe("StatGrid", () => {
  it("renders research cards with figure, label, text and source", () => {
    const b = section(Wellness, "Research");
    const items = triples(b.slice(3, 3 + 24), 0, 4).map(([figure, label, text, source]) => ({ figure, label, text, source }));
    render(<StatGrid items={items} variant="cards" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getAllByText("Global Sauna Survey, 2019")).toHaveLength(2);
  });
});

describe("PhotoGrid", () => {
  it("lays out the 11-photo gallery like the design", () => {
    const images = pickAll(section(Wellness, "Inspiration gallery"), "image");
    const { container } = render(<PhotoGrid images={images} layout="gallery" />);
    const tiles = [...container.querySelectorAll("figure")];
    expect(tiles).toHaveLength(11);
    for (const i of [0, 2, 5, 6]) expect(tiles[i]).toHaveClass("row-span-2");
    expect(tiles[9]).toHaveClass("col-span-2");
    for (const img of images) expect(screen.getByAltText(img.alt)).toBeInTheDocument();
  });

  it("renders the 3-photo strip", () => {
    const images = pickAll(section(About, "Photo strip"), "image");
    const { container } = render(<PhotoGrid images={images} layout="strip" />);
    expect(container.querySelectorAll("figure")).toHaveLength(3);
  });
});

describe("Steps", () => {
  it("renders the five ritual steps", () => {
    const list = pick(section(Wellness, "Ritual"), "list");
    const items = list.items.map(({ blocks: [number, title, text] }) => ({ number, title, text }));
    render(<Steps items={items} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByText("Heat up")).toBeInTheDocument();
  });
});

describe("CtaBand", () => {
  it("renders heading, text and buttons, the first in tan", () => {
    const b = section(About, "Section 1");
    render(<CtaBand heading={pick(b, "heading")} text={pick(b, "paragraph")} links={pickAll(b, "link")} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Let’s find your sauna.");
    expect(screen.getByRole("link", { name: "Find your fit" })).toHaveClass("bg-tan");
    expect(screen.getByRole("link", { name: "Shop outdoor saunas" })).toHaveClass("border-white");
    expect(screen.getByRole("link", { name: "Call (437) 429-6623" })).toHaveAttribute("href", "tel:+14374296623");
  });
});
