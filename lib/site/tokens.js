// Design tokens for the redesign (docs/superpowers/specs/2026-11-23-design-tokens-design.md).
// CommonJS so tailwind.config.js can require it. Every key is new: nothing here may reuse a
// legacy or built-in Tailwind name (lib/site/tokens.test.js checks).

const colors = {
  ink: "#1E1C1A",
  "ink-soft": "#3A3531",
  "ink-deep": "#141211",
  charcoal: "#2B2724",
  "taupe-700": "#4A443E",
  "taupe-500": "#6B635B",
  "sand-100": "#E3D9CC",
  "sand-200": "#CFC6BA",
  "sand-300": "#BDB2A6",
  "sand-400": "#A89C90",
  line: "#E6E0D8",
  "line-strong": "#CFC5B7",
  "line-dark": "#3A322C",
  linen: "#F4F1EC",
  cream: "#F4EDE3",
  putty: "#D9D1C5",
  walnut: "#7A4E31",
  tan: "#D4A373", // accent only, never text
  "tan-light": "#E2B583",
  gold: "#B8862E", // star ratings only
  rust: "#8A3B12",
};

const fontFamily = {
  display: ["var(--font-display)", "Georgia", "serif"],
  body: ["var(--font-body)", "system-ui", "sans-serif"],
};

const fontSize = {
  "display-xl": ["clamp(46px, 6vw, 84px)", { lineHeight: "1" }],
  "display-lg": ["clamp(40px, 4.8vw, 64px)", { lineHeight: "1.05" }],
  "display-md": ["clamp(36px, 4.4vw, 56px)", { lineHeight: "1.05" }],
  "display-sm": ["clamp(28px, 3vw, 40px)", { lineHeight: "1.1" }],
  heading: ["26px", { lineHeight: "1.2" }],
  title: ["22px", { lineHeight: "1.3" }],
  lead: ["18px", { lineHeight: "1.6" }],
  body: ["16px", { lineHeight: "1.6" }],
  // Header nav only: at 16px the seven links no longer fit on one row beside the logo and buttons.
  nav: ["15px", { lineHeight: "1.5" }],
  small: ["14px", { lineHeight: "1.5" }],
  caption: ["12px", { lineHeight: "1.4" }],
  // Pair with the `uppercase` class: Tailwind font sizes can't set text-transform.
  eyebrow: ["13px", { lineHeight: "1.2", letterSpacing: "0.2em", fontWeight: "600" }],
};

const letterSpacing = { eyebrow: "0.2em", caps: "0.1em" };
const borderRadius = { card: "14px" };
const boxShadow = {
  menu: "0 18px 40px rgba(30,28,26,0.14)",
  chip: "0 1px 6px rgba(0,0,0,0.18)",
};
// The design sets max-width: 1320px with padding: 0 32px in content-box, so the outer width is 1384px.
// Tailwind is border-box, so the token is the outer width; pair it with px-5 md:px-8.
const maxWidth = { site: "1384px" };
const spacing = { 13: "3.25rem" }; // 52px, the large button height
// The redesign's single phone/desktop switch (owner's call; the design used 720px). New components use
// `desktop:` instead of `md:`, which stays at 768px for the live pages.
const screens = { desktop: "998px" };

// Every [text, background] pairing the design uses. Each must meet WCAG AA 4.5:1.
const TEXT_PAIRS = [
  ["ink", "white"],
  ["ink", "linen"],
  ["ink", "cream"],
  ["taupe-700", "white"],
  ["taupe-700", "linen"],
  ["taupe-500", "white"],
  ["taupe-500", "linen"],
  ["taupe-500", "cream"],
  ["walnut", "white"],
  ["walnut", "linen"],
  ["walnut", "cream"],
  ["rust", "white"],
  ["white", "ink"],
  ["white", "ink-soft"],
  ["white", "walnut"],
  ["white", "charcoal"],
  ["sand-100", "ink"],
  ["sand-200", "ink"],
  ["sand-300", "ink"],
  ["sand-400", "ink"],
  ["sand-400", "charcoal"],
  ["tan-light", "ink"],
  ["tan-light", "charcoal"],
  ["ink", "tan"],
  ["cream", "ink"],
];

module.exports = { colors, fontFamily, fontSize, letterSpacing, borderRadius, boxShadow, maxWidth, spacing, screens, TEXT_PAIRS };
