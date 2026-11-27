import { render, screen } from "@testing-library/react";
import BlogIndex from "./BlogIndex";
import { client } from "@/lib/sanity";
import { getCards, toCard } from "../../lib/site/blog";

jest.mock("@/lib/sanity", () => ({
  client: { fetch: jest.fn() },
  urlFor: (source) => ({ url: () => `https://cdn.sanity.io/images/x/${source.asset._ref}.jpg` }),
}));
jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return Link;
});
jest.mock("./CloudinaryImage", () => {
  const Img = ({ fill, priority, loader, ...props }) => <img {...props} />; // eslint-disable-line @next/next/no-img-element, jsx-a11y/alt-text
  return Img;
});
jest.mock("./SanityImage", () => {
  const Img = ({ fill, priority, loader, ...props }) => <img {...props} />; // eslint-disable-line @next/next/no-img-element, jsx-a11y/alt-text
  return Img;
});

const posts = [
  { title: "Newest post", slug: "newest-post", publishedAt: "2026-11-25T15:00:00Z", description: "Fresh", titleimage: { asset: { _ref: "image-a-800x600-jpg" } } },
  { title: "How long?", slug: "how-long-does-an-outdoor-sauna-last", publishedAt: "2026-11-18T15:00:00Z" },
  { title: "Third", slug: "third", publishedAt: "2026-11-01T15:00:00Z" },
];

describe("BlogIndex", () => {
  it("has the design's header as the only h1", () => {
    render(<BlogIndex cards={posts.map(toCard)} />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Guides for sauna owners.");
  });

  it("features the newest post and lists the rest", () => {
    render(<BlogIndex cards={posts.map(toCard)} />);
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s[0]).toBe("Newest post");
    expect(screen.getByText("Latest · November 25, 2026")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["How long?", "Third"]);
    expect(screen.getByText("Ownership · November 18, 2026")).toBeInTheDocument();
  });

  it("ends with the design's CTA band", () => {
    render(<BlogIndex cards={posts.map(toCard)} />);
    expect(screen.getByRole("heading", { level: 2, name: "Ready for your own sauna?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find your fit" })).toHaveAttribute("href", "/sauna-finder");
  });

  it("still shows the design's 11 posts when Sanity has nothing", async () => {
    client.fetch.mockResolvedValue([]);
    const { cards, fromDesign } = await getCards();
    render(<BlogIndex cards={cards} />);
    expect(fromDesign).toBe(true);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(10);
  });
});
