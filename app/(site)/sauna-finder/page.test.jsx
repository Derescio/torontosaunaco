/** @jest-environment node */
import { fetchProducts } from "@/assets/utils/request";
import Page, { revalidate } from "./page";

jest.mock("@/assets/utils/request", () => ({ fetchProducts: jest.fn() }));

const finderProps = (tree) => {
  const stack = [tree];
  while (stack.length) {
    const node = stack.pop();
    if (node?.props?.catalogue) return node.props;
    const kids = node?.props?.children;
    if (kids) stack.push(...(Array.isArray(kids) ? kids : [kids]));
  }
  return null;
};
const hrefOf = (props, name) => props.catalogue.find((m) => m.n === name).href;

describe("/sauna-finder", () => {
  it("rebuilds every two hours", () => {
    expect(revalidate).toBe(7200);
  });

  it("links only saunas that have a product page", async () => {
    fetchProducts.mockResolvedValue([
      { type: "Cube", slug: "neptune" },
      { type: "Indoor", slug: "indoor/pure-cube-552" },
    ]);
    const props = finderProps(await Page());
    expect(hrefOf(props, "The Neptune")).toBe("/saunas/neptune");
    expect(hrefOf(props, "Pure Cube Indoor 552")).toBe("/saunas/indoor/pure-cube-552");
    expect(hrefOf(props, "Pure Cube 772").startsWith("/contact?msg=")).toBe(true);
  });

  it("keeps the design's links when the catalogue can't be read", async () => {
    fetchProducts.mockResolvedValue([]);
    expect(hrefOf(finderProps(await Page()), "Pure Cube 772")).toBe("/saunas/pure-cube-772");
    fetchProducts.mockRejectedValue(new Error("down"));
    expect(hrefOf(finderProps(await Page()), "Pure Cube 772")).toBe("/saunas/pure-cube-772");
  });
});
