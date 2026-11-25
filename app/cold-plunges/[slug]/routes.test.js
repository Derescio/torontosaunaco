/** @jest-environment node */
import { notFound, permanentRedirect } from "next/navigation";
import { resolveProductParam } from "@/lib/products/resolve";
import OldPlunge from "@/app/cold-plunge/[id]/page";
import NewPlunge from "@/app/cold-plunges/[slug]/page";
import OldShower from "@/app/showers/[id]/page";
import NewShower from "@/app/outdoor-showers/[slug]/page";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  permanentRedirect: jest.fn((to) => {
    throw new Error(`REDIRECT ${to}`);
  }),
}));
jest.mock("@/lib/products/resolve", () => ({ resolveProductParam: jest.fn(), staticSlugs: jest.fn(async () => []) }));
jest.mock("@/app/cold-plunge/[id]/ColdPlungeClient", () => function ColdPlungeClient() { return null; });
jest.mock("@/app/showers/[id]/ShowersClient", () => function ShowersClient() { return null; });

const ID = "668af06648215c199c421a66";
const params = (p) => ({ params: Promise.resolve(p) });

describe.each([
  ["cold plunge", OldPlunge, NewPlunge, "cold-plunge", "/cold-plunges/arctic"],
  ["shower", OldShower, NewShower, "shower", "/outdoor-showers/sunlight"],
])("%s routes", (_label, OldPage, NewPage, kind, slugUrl) => {
  it("old ID route redirects permanently to the slug URL", async () => {
    resolveProductParam.mockResolvedValue({ redirectTo: slugUrl });
    await expect(OldPage(params({ id: ID }))).rejects.toThrow(`REDIRECT ${slugUrl}`);
    expect(resolveProductParam).toHaveBeenCalledWith(ID, kind);
    expect(permanentRedirect).toHaveBeenCalledWith(slugUrl);
  });

  it("old ID route renders the client page when the product has no slug yet", async () => {
    resolveProductParam.mockResolvedValue({ product: { _id: ID } });
    const el = await OldPage(params({ id: ID }));
    expect(el.props.id).toBe(ID);
  });

  it("old ID route 404s for an unknown product", async () => {
    resolveProductParam.mockResolvedValue(null);
    await expect(OldPage(params({ id: ID }))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("slug route renders the client page with the product's ID", async () => {
    resolveProductParam.mockResolvedValue({ product: { _id: ID } });
    const el = await NewPage(params({ slug: "arctic" }));
    expect(resolveProductParam).toHaveBeenCalledWith("arctic", kind, { slugOnly: true });
    expect(el.props.id).toBe(ID);
  });

  it("slug route 404s for an unknown slug and never redirects", async () => {
    resolveProductParam.mockResolvedValue(null);
    await expect(NewPage(params({ slug: "nope" }))).rejects.toThrow("NEXT_NOT_FOUND");
    resolveProductParam.mockResolvedValue({ redirectTo: slugUrl });
    await expect(NewPage(params({ slug: ID }))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
