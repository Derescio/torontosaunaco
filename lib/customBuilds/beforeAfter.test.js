import {
  BEFORE_AFTER_PAIRS,
  customBuildCompareSrc,
} from "./beforeAfter.js";

describe("customBuildCompareSrc", () => {
  it("adds Cloudinary size and format transforms", () => {
    expect(
      customBuildCompareSrc(
        "v1788118999/torontosaunaco/custom_Builds/Green_Floor_Start_dxabea.jpg",
      ),
    ).toBe(
      "https://res.cloudinary.com/dw4ev5whz/image/upload/f_auto,q_auto,c_limit,w_1400/v1788118999/torontosaunaco/custom_Builds/Green_Floor_Start_dxabea.jpg",
    );
  });
});

describe("BEFORE_AFTER_PAIRS", () => {
  it("has three unique Cloudinary before/after pairs", () => {
    const ids = BEFORE_AFTER_PAIRS.map((pair) => pair.id);

    expect(BEFORE_AFTER_PAIRS).toHaveLength(3);
    expect(BEFORE_AFTER_PAIRS.map((pair) => pair.title)).toEqual([
      "Custom Build, Toronto, ON",
      "Custom Build, King City, ON",
      "Custom Build, King City, ON",
    ]);
    expect(new Set(ids).size).toBe(ids.length);

    BEFORE_AFTER_PAIRS.forEach((pair) => {
      expect(pair.beforeSrc).toContain("res.cloudinary.com/dw4ev5whz");
      expect(pair.afterSrc).toContain("res.cloudinary.com/dw4ev5whz");
      expect(pair.beforeSrc).not.toBe(pair.afterSrc);
      expect(pair.beforeAlt).toBeTruthy();
      expect(pair.afterAlt).toBeTruthy();
    });
  });
});
