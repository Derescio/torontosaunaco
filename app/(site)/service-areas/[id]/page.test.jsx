/** @jest-environment node */
import Page, { generateStaticParams, generateMetadata } from "./page";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("/service-areas/[id]", () => {
  it("pre-builds the 17 design cities", async () => {
    const params = await generateStaticParams();
    expect(params).toHaveLength(17);
    expect(params).toEqual(expect.arrayContaining([{ id: "toronto" }, { id: "muskoka" }, { id: "niagara-on-the-lake" }]));
  });

  it.each(["ottawa", "Toronto", "barrie"])("sends %s to not found", async (id) => {
    await expect(Page({ params: Promise.resolve({ id }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("takes title and canonical from the page map", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: "aurora" }) });
    expect(metadata.title).toBe("Backyard Saunas in Aurora | The Toronto Sauna Co.");
    expect(String(metadata.alternates.canonical)).toMatch(/\/service-areas\/aurora$/);
  });

  it("returns no metadata for an unknown city", async () => {
    await expect(generateMetadata({ params: Promise.resolve({ id: "ottawa" }) })).resolves.toEqual({});
  });
});
