/** @jest-environment node */
import { Schema } from "mongoose";
import { assignSlug, slugFromName } from "./slugFromName";

function fakeDoc(fields, taken = new Set()) {
  const findOne = jest.fn((q) => ({ lean: async () => (taken.has(q.slug) ? {} : null) }));
  const doc = { _id: "id1", ...fields };
  Object.defineProperty(doc, "constructor", { value: { findOne } });
  return { doc, findOne };
}

describe("assignSlug", () => {
  it("slugifies the name", async () => {
    const { doc } = fakeDoc({ name: "Supreme Sauna Accessory Package" });
    await assignSlug.call(doc);
    expect(doc.slug).toBe("supreme-sauna-accessory-package");
  });

  it("adds -1, -2 when the slug is taken by another document", async () => {
    const one = fakeDoc({ name: "Supreme Sauna Accessory Package" }, new Set(["supreme-sauna-accessory-package"]));
    await assignSlug.call(one.doc);
    expect(one.doc.slug).toBe("supreme-sauna-accessory-package-1");

    const two = fakeDoc(
      { name: "Supreme Sauna Accessory Package" },
      new Set(["supreme-sauna-accessory-package", "supreme-sauna-accessory-package-1"])
    );
    await assignSlug.call(two.doc);
    expect(two.doc.slug).toBe("supreme-sauna-accessory-package-2");
  });

  it("excludes the document itself from the clash check", async () => {
    const { doc, findOne } = fakeDoc({ name: "Thermometer" });
    await assignSlug.call(doc);
    expect(findOne).toHaveBeenCalledWith({ slug: "thermometer", _id: { $ne: "id1" } });
  });

  it("keeps an existing slug without querying", async () => {
    const { doc, findOne } = fakeDoc({ name: "X", slug: "keep" });
    await assignSlug.call(doc);
    expect(doc.slug).toBe("keep");
    expect(findOne).not.toHaveBeenCalled();
  });

  it("leaves the slug empty for a blank name", async () => {
    const { doc } = fakeDoc({ name: "   " });
    await assignSlug.call(doc);
    expect(doc.slug).toBeUndefined();
  });
});

describe("slugFromName plugin", () => {
  it("adds a unique, sparse, lowercase slug field", () => {
    const schema = new Schema({ name: String });
    schema.plugin(slugFromName);
    const { options } = schema.path("slug");
    expect(options).toMatchObject({ type: String, unique: true, sparse: true, trim: true, lowercase: true });
  });
});

describe("catalogue models", () => {
  it("Products and Accessories have the slug field", async () => {
    const { default: Products } = await import("../Products");
    const { default: Accessories } = await import("../Accessories");
    expect(Products.schema.path("slug").options.unique).toBe(true);
    expect(Accessories.schema.path("slug").options.unique).toBe(true);
  });
});
