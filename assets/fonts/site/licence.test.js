const fs = require("fs");
const path = require("path");

// OFL 1.1 requires the copyright notice and licence text to travel with the font files.
test("every committed font has its OFL licence file", () => {
  const dir = __dirname;
  const fonts = fs.readdirSync(dir).filter((f) => f.endsWith(".woff2"));
  expect(fonts.length).toBeGreaterThan(0);
  for (const font of fonts) {
    const family = font.startsWith("manrope") ? "manrope" : "cormorant-garamond";
    const licence = path.join(dir, `OFL-${family}.txt`);
    expect(fs.existsSync(licence)).toBe(true);
    const text = fs.readFileSync(licence, "utf8");
    expect(text).toMatch(/Copyright/);
    expect(text).toMatch(/SIL OPEN FONT LICENSE Version 1\.1/);
  }
});
