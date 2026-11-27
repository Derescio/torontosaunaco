/** @jest-environment node */
import { signParams, listDesignImages, pending, entryFrom, mergeMap } from "./cloudinary.mjs";

const H1 = "0123456789abcdef0123456789abcdef";
const H2 = "fedcba9876543210fedcba9876543210";

describe("cloudinary helpers", () => {
  it("signs parameters the way Cloudinary documents", () => {
    const params = { timestamp: 1315060510, public_id: "sample_image", eager: "w_400,h_300,c_pad|w_260,h_200,c_crop" };
    expect(signParams(params, "abcd")).toBe("bfd09f95f331f558cbd1320e67aa8d488770583e");
    expect(signParams({ ...params, api_key: "123", file: "x", resource_type: "" }, "abcd")).toBe(
      "bfd09f95f331f558cbd1320e67aa8d488770583e"
    );
  });

  it("lists design photos by hash, ignoring PDFs and other names", () => {
    expect(listDesignImages(["a.pdf", "x.jpg", `${H2}.webp`, `${H1}.jpg`, `${H1.slice(1)}0.pdf`])).toEqual([
      { hash: H1, file: `${H1}.jpg` },
      { hash: H2, file: `${H2}.webp` },
    ]);
  });

  it("pending skips photos already in the map", () => {
    const images = [{ hash: H1, file: "a" }, { hash: H2, file: "b" }];
    expect(pending(images, { [H1]: { url: "u", width: 1, height: 1 } })).toEqual([{ hash: H2, file: "b" }]);
  });

  it("mergeMap sorts keys and leaves its input alone", () => {
    const map = { [H2]: { url: "b", width: 1, height: 1 } };
    const out = mergeMap(map, H1, { url: "a", width: 2, height: 2 });
    expect(Object.keys(out)).toEqual([H1, H2]);
    expect(Object.keys(map)).toEqual([H2]);
  });

  it("entryFrom keeps url and size, and rejects incomplete responses", () => {
    expect(entryFrom({ secure_url: "u", width: 1, height: 2, public_id: "p" })).toEqual({ url: "u", width: 1, height: 2 });
    expect(() => entryFrom({ secure_url: "u", height: 2 })).toThrow(/width/);
  });
});
