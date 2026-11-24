import { contrastRatio } from "./contrast.js";

const tokens = require("./tokens.js");
const extend = require("../../tailwind.config.js").theme.extend;
const twColors = require("tailwindcss/colors");
const twDefault = require("tailwindcss/defaultTheme");

const hex = (name) => (name === "white" ? "#FFFFFF" : tokens.colors[name]);

// Snapshot of theme.extend key names before this slice, so the check doesn't see the new keys.
const LEGACY = {
  colors: ["border", "input", "ring", "background", "foreground", "primary", "secondary", "destructive", "muted",
    "accent", "popover", "card"],
  fontFamily: ["sans", "playfair", "roboto", "atkinson", "nunito", "rubik", "abeezee", "abyssinica", "akaya", "anton",
    "kavivanar", "libre"],
  borderRadius: ["lg", "md", "sm"],
  screens: ["xs"],
};

describe("contrastRatio", () => {
  it("matches known values", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 1);
    expect(contrastRatio("#8A7C70", "#FFFFFF")).toBeCloseTo(4.04, 1);
  });
});

describe("tokens", () => {
  it("defines every colour as a 6-digit hex", () => {
    expect(Object.keys(tokens.colors)).toHaveLength(21);
    for (const value of Object.values(tokens.colors)) expect(value).toMatch(/^#[0-9A-F]{6}$/);
  });

  it.each(["colors", "fontFamily", "fontSize", "letterSpacing", "borderRadius", "boxShadow", "maxWidth", "spacing", "screens"])(
    "%s keys don't collide with legacy or built-in Tailwind keys",
    (group) => {
      const taken = new Set([
        ...(LEGACY[group] ?? []),
        ...Object.keys(twDefault[group] ?? {}),
        ...(group === "colors" ? Object.keys(twColors) : []),
      ]);
      // For colours also check the prefix, so "stone-500" would clash with Tailwind's "stone".
      const clashes = Object.keys(tokens[group]).filter(
        (k) => taken.has(k) || (group === "colors" && taken.has(k.split("-")[0]))
      );
      expect(clashes).toEqual([]);
    }
  );

  it.each(tokens.TEXT_PAIRS)("%s on %s meets 4.5:1", (fg, bg) => {
    expect(hex(fg)).toBeDefined();
    expect(hex(bg)).toBeDefined();
    expect(contrastRatio(hex(fg), hex(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it("never uses tan as text", () => {
    expect(tokens.TEXT_PAIRS.filter(([fg]) => fg === "tan")).toEqual([]);
  });
});

describe("nav size", () => {
  it("matches the design's 15px nav so the header fits on one row", () => {
    expect(tokens.fontSize.nav).toEqual(["15px", { lineHeight: "1.5" }]);
  });
});

describe("breakpoint", () => {
  it("switches between the phone and desktop layouts at 998px", () => {
    expect(tokens.screens).toEqual({ desktop: "998px" });
    expect(extend.screens.desktop).toBe("998px");
    expect(extend.screens.xs).toBe("859px");
  });
});

describe("tailwind config", () => {
  it("exposes the new tokens and keeps the legacy ones", () => {
    expect(extend.colors.walnut).toBe("#7A4E31");
    expect(extend.colors.primary).toBeDefined();
    expect(extend.fontFamily.sans[0]).toMatch(/Poppins/);
    expect(extend.fontFamily.display[0]).toBe("var(--font-display)");
    expect(extend.fontSize["display-xl"]).toEqual(tokens.fontSize["display-xl"]);
    expect(extend.borderRadius.card).toBe("14px");
    expect(extend.borderRadius.lg).toBe("var(--radius)");
    expect(extend.boxShadow.menu).toBe(tokens.boxShadow.menu);
    // The design uses content-box: 1320px of content plus 32px padding each side.
    expect(extend.maxWidth.site).toBe("1384px");
    expect(extend.spacing["13"]).toBe("3.25rem");
  });
});
