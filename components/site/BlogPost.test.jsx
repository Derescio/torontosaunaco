import { render, screen, within } from "@testing-library/react";
import BlogPost from "./BlogPost";
import { toCard } from "../../lib/site/blog";

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

const span = (text, marks = []) => ({ _type: "span", _key: text, text, marks });
const block = (style, children, extra = {}) => ({ _type: "block", _key: `${style}-${children[0].text}`, style, markDefs: [], children, ...extra });

const content = [
  block("normal", [span("Opening paragraph.")]),
  block("h2", [span("Why it matters")]),
  block("normal", [span("Bullet one")], { listItem: "bullet", level: 1 }),
  block("normal", [span("Bullet two")], { listItem: "bullet", level: 1 }),
  {
    ...block("normal", [span("Read the study", ["ext"]), span(" or "), span("contact us", ["int"])]),
    markDefs: [
      { _key: "ext", _type: "link", href: "https://pubmed.ncbi.nlm.nih.gov/1/" },
      { _key: "int", _type: "link", href: "/contact" },
    ],
  },
  { _type: "image", _key: "img1", asset: { _ref: "image-pic-1600x900-jpg" }, alt: "Sauna at dusk" },
];

const post = { title: "How Long Does a Sauna Last?", slug: "how-long-does-an-outdoor-sauna-last", publishedAt: "2026-11-18T15:00:00Z", content };
const card = toCard(post);
const related = ["a", "b", "c"].map((s) => toCard({ title: `Related ${s}`, slug: s, publishedAt: "2026-10-01T15:00:00Z" }));

describe("BlogPost", () => {
  it("has the post title as the only h1, with the date line", () => {
    render(<BlogPost post={post} card={card} related={related} />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(post.title);
    expect(screen.getByText("Ownership · November 18, 2026")).toBeInTheDocument();
  });

  it("links the breadcrumb to Home and Blog", () => {
    render(<BlogPost post={post} card={card} related={related} />);
    const crumb = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(crumb.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(crumb.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
  });

  it("renders the Sanity article body in the site's styles", () => {
    const { container } = render(<BlogPost post={post} card={card} related={related} />);
    const article = container.querySelector("article");
    expect(within(article).getByRole("heading", { level: 2, name: "Why it matters" })).toBeInTheDocument();
    expect(article.querySelectorAll("ul > li")).toHaveLength(2);
    const external = within(article).getByRole("link", { name: "Read the study" });
    expect(external).toHaveAttribute("target", "_blank");
    expect(external.getAttribute("rel")).toContain("noopener");
    const internal = within(article).getByRole("link", { name: "contact us" });
    expect(internal).toHaveAttribute("href", "/contact");
    expect(internal).not.toHaveAttribute("target");
    expect(within(article).getByAltText("Sauna at dusk").getAttribute("src")).toMatch(/^https:\/\/cdn\.sanity\.io\//);
  });

  it("shows three related posts and the CTA band", () => {
    render(<BlogPost post={post} card={card} related={related} />);
    for (const r of related) expect(screen.getByRole("link", { name: r.title })).toHaveAttribute("href", r.href);
    expect(screen.getByRole("heading", { level: 2, name: "Ready for your own sauna?" })).toBeInTheDocument();
  });

  it("copes with a post that has no body or photo", () => {
    const bare = { title: "Bare", slug: "bare" };
    render(<BlogPost post={bare} card={toCard(bare)} related={[]} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Bare");
  });
});
