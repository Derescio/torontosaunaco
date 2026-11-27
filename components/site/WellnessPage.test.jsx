import { render, screen } from "@testing-library/react";
import WellnessPage from "./WellnessPage";
import Wellness from "../../content/redesign/Wellness.json";

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

const blocks = Wellness.sections.flatMap((s) => s.blocks);
const images = [];
const walk = (x) => {
  if (x && typeof x === "object") {
    if (x.type === "image") images.push(x);
    Object.values(x).forEach(walk);
  }
};
walk(Wellness.sections);

describe("WellnessPage", () => {
  it("has one h1", () => {
    render(<WellnessPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Heat. Quiet. Ritual.");
  });

  it("renders every section heading in design order", () => {
    render(<WellnessPage />);
    const want = blocks.filter((b) => b.type === "heading" && b.level === 2).map((b) => b.text);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(want);
  });

  it("renders all 15 photos with their alt text", () => {
    render(<WellnessPage />);
    expect(images).toHaveLength(15);
    for (const img of images) expect(screen.getByAltText(img.alt)).toBeInTheDocument();
  });

  it("every in-page link lands on a section", () => {
    const { container } = render(<WellnessPage />);
    const anchors = [...container.querySelectorAll('a[href^="#"]')];
    expect(anchors.map((a) => a.getAttribute("href"))).toEqual(["#research", "#ritual"]);
    for (const a of anchors) expect(container.querySelector(a.getAttribute("href"))).not.toBeNull();
  });

  it("shows the six research cards with their sources", () => {
    render(<WellnessPage />);
    for (const figure of ["40%", "63%", "66%", "70+", "84%", "#1"]) expect(screen.getByText(figure)).toBeInTheDocument();
    expect(screen.getByText("Mayo Clinic Proceedings, 2018")).toBeInTheDocument();
  });

  it("keeps the tradition stats, lifestyle items, ritual steps, safety tips and sources", () => {
    const { container } = render(<WellnessPage />);
    for (const t of ["80–100°C", "~3M", "2020", "A daily reset", "An elevated backyard", "Heat up", "Repeat"]) {
      expect(screen.getByText(t)).toBeInTheDocument();
    }
    expect(container.querySelector("#ritual ol").children).toHaveLength(5);
    expect(screen.getByText(/Drink water before and after/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Sources" }).parentElement.querySelectorAll("ol > li")).toHaveLength(6);
  });

  it("never says King Township or Leisurecraft", () => {
    const { container } = render(<WellnessPage />);
    expect(container.textContent).not.toMatch(/King Township|Leisurecraft/);
  });
});
