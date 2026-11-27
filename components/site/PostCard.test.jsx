import { render, screen } from "@testing-library/react";
import PostCard, { sanityDims } from "./PostCard";
import { sanityLoader } from "./SanityImage";
import { toCard } from "../../lib/site/blog";

jest.mock("@/lib/sanity", () => {
  const builder = (source) => ({ url: () => `https://cdn.sanity.io/images/kvgojho3/production/${source.asset._ref.slice(6)}.jpg` });
  return { client: { fetch: jest.fn() }, urlFor: builder };
});
jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return Link;
});
// A plain <img> stand-in for the next/image wrappers (defined inside each factory: mocks are hoisted above imports).
jest.mock("./CloudinaryImage", () => {
  const Img = ({ fill, priority, loader, ...props }) => <img {...props} />; // eslint-disable-line @next/next/no-img-element, jsx-a11y/alt-text
  return Img;
});
jest.mock("./SanityImage", () => {
  const Img = ({ fill, priority, loader, ...props }) => <img {...props} />; // eslint-disable-line @next/next/no-img-element, jsx-a11y/alt-text
  return { __esModule: true, default: Img, sanityLoader: jest.requireActual("./SanityImage").sanityLoader };
});

const COVERED = "how-long-does-an-outdoor-sauna-last";
const image = { _type: "image", asset: { _ref: "image-abc-1200x800-jpg" } };

describe("Sanity image helpers", () => {
  it("asks Sanity's CDN for the width, quality and format", () => {
    expect(sanityLoader({ src: "https://cdn.sanity.io/x.jpg", width: 640 })).toBe("https://cdn.sanity.io/x.jpg?w=640&q=75&auto=format&fit=max");
    expect(sanityLoader({ src: "https://cdn.sanity.io/x.jpg?rect=1,2,3,4", width: 320, quality: 60 })).toBe(
      "https://cdn.sanity.io/x.jpg?rect=1,2,3,4&w=320&q=60&auto=format&fit=max"
    );
  });

  it("reads the size from the asset reference", () => {
    expect(sanityDims(image)).toEqual({ width: 1200, height: 800 });
    expect(sanityDims({ asset: {} })).toBeNull();
  });
});

describe("PostCard", () => {
  it("shows a design-covered post with its category line and design photo", () => {
    const card = toCard({ title: "How long?", slug: COVERED, publishedAt: "2026-11-18T15:00:00Z" });
    render(<PostCard card={card} />);
    expect(screen.getByText("Ownership · November 18, 2026")).toBeInTheDocument();
    expect(screen.getByAltText(card.image.alt)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("How long?");
    expect(screen.getByRole("link", { name: "How long?" })).toHaveAttribute("href", `/blog/${COVERED}`);
    expect(screen.getByRole("link", { name: /Read the article/ })).toHaveAttribute("href", `/blog/${COVERED}`);
  });

  it("shows a Sanity-only post with its Sanity photo and date alone", () => {
    const card = toCard({ title: "New post", slug: "new-post", publishedAt: "2026-11-03T15:00:00Z", titleimage: image, description: "Hi" });
    render(<PostCard card={card} />);
    expect(screen.getByText("November 3, 2026")).toBeInTheDocument();
    expect(screen.getByAltText("New post").getAttribute("src")).toMatch(/^https:\/\/cdn\.sanity\.io\//);
    expect(screen.getByText("Hi")).toBeInTheDocument();
  });

  it("renders no image for a post without one", () => {
    const { container } = render(<PostCard card={toCard({ title: "Bare", slug: "bare" })} />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("marks the featured post as Latest with an h2", () => {
    const card = toCard({ title: "How long?", slug: COVERED, publishedAt: "2026-11-18T15:00:00Z" });
    render(<PostCard card={card} featured />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("How long?");
    expect(screen.getByText("Latest · Ownership · November 18, 2026")).toBeInTheDocument();
  });
});
