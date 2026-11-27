import { render, screen, fireEvent, within } from "@testing-library/react";
import Finder from "../../content/redesign/SaunaFinder.json";
import { finderCopy } from "../../lib/site/finderCopy";
import { findSaunas } from "../../lib/site/saunaFinder";
import SaunaFinder from "./SaunaFinder";

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

const DATA = Finder.data.fdData;
const copy = finderCopy(Finder);
const setup = () => render(<SaunaFinder catalogue={DATA} copy={copy} />);
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const space = (w, d) => {
  type("Width of your space (feet)", w);
  type("Depth of your space (feet)", d);
};
const cards = (container) => container.querySelectorAll("[data-finder-results] > li");

describe("finderCopy", () => {
  it("picks the design copy", () => {
    expect(copy.widthField.label).toBe("Width of your space (feet)");
    expect(copy.ceilingField.label).toBe("Ceiling height (feet, optional)");
    expect(copy.idle.text).toMatch(/^Enter your width and depth to see what fits\./);
    expect(copy.none[0].text).toBe("Nothing off the shelf fits that space.");
    expect(copy.quoteLabel).toBe("Get a quote for my space");
  });
});

describe("SaunaFinder", () => {
  it("starts outdoor and idle, without a ceiling field", () => {
    setup();
    expect(screen.getByRole("button", { name: "Outdoor" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Indoor" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/^Enter your width and depth to see what fits\./)).toBeInTheDocument();
    expect(screen.queryByLabelText("Ceiling height (feet, optional)")).toBeNull();
  });

  it("names the outdoor/indoor group with the design's wording", () => {
    setup();
    expect(screen.getByRole("group", { name: "Where is it going?" })).toBeInTheDocument();
  });

  it("lists what fits, with the summary in a live region", () => {
    const { container } = setup();
    space("10", "8");
    const summary = screen.getByText("15 outdoor saunas fit or come close to your 10′ × 8′ space (1 close).");
    expect(summary.closest("[aria-live='polite']")).not.toBeNull();
    expect(cards(container)).toHaveLength(15);
    const first = within(cards(container)[0]).getByRole("link");
    expect(first).toHaveAttribute("href", "/saunas/pure-cube-552");
    expect(first).toHaveTextContent("Best seller · fits");
    expect(first).toHaveTextContent("$11,884");
  });

  it("asks for the ceiling indoors and points custom builds to the indoor page", () => {
    setup();
    expect(screen.getByRole("link", { name: "Talk to us about a custom build" })).toHaveAttribute("href", "/contact");
    fireEvent.click(screen.getByRole("button", { name: "Indoor" }));
    expect(screen.getByRole("button", { name: "Indoor" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Ceiling height (feet, optional)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore custom indoor saunas" })).toHaveAttribute("href", "/saunas/indoor/custom");
  });

  it("filters by people", () => {
    const { container } = setup();
    space("20", "20");
    fireEvent.click(screen.getByRole("button", { name: "6+" }));
    expect(screen.getByRole("button", { name: "6+" })).toHaveAttribute("aria-pressed", "true");
    expect(cards(container).length).toBeGreaterThan(0);
    for (const card of cards(container)) {
      expect(Number(card.textContent.match(/Seats up to (\d+)/)[1])).toBeGreaterThanOrEqual(6);
    }
  });

  it("sends the quote to the contact page with the space filled in, never by email", () => {
    const { container } = setup();
    space("10", "8");
    const href = screen.getByRole("link", { name: "Get a quote for my space" }).getAttribute("href");
    expect(href.startsWith("/contact?msg=")).toBe(true);
    const lines = findSaunas(DATA, { mode: "out", width: "10", depth: "8" }).quoteLines;
    expect(new URLSearchParams(href.split("?")[1]).get("msg")).toBe(lines.join("\n"));
    expect(container.innerHTML).not.toMatch(/mailto:|sales@|tjallen@/);
  });

  it("says when nothing fits", () => {
    const { container } = setup();
    space("2", "2");
    expect(screen.getByText("Nothing off the shelf fits that space.")).toBeInTheDocument();
    expect(cards(container)).toHaveLength(0);
  });
});
