import { render, screen, within } from "@testing-library/react";
import StyleGuidePage, { metadata } from "./page";

const tokens = require("../../lib/site/tokens.js");

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("/style-guide", () => {
  const original = process.env.VERCEL_ENV;
  afterEach(() => {
    process.env.VERCEL_ENV = original;
  });

  it("calls notFound in production", () => {
    process.env.VERCEL_ENV = "production";
    expect(() => StyleGuidePage()).toThrow("NEXT_NOT_FOUND");
  });

  it("renders every colour token name outside production", () => {
    process.env.VERCEL_ENV = "preview";
    render(<StyleGuidePage />);
    const colours = within(screen.getByRole("region", { name: "Colours" }));
    for (const name of Object.keys(tokens.colors)) expect(colours.getByText(name)).toBeInTheDocument();
  });

  it("renders every type step", () => {
    process.env.VERCEL_ENV = "preview";
    render(<StyleGuidePage />);
    for (const name of Object.keys(tokens.fontSize)) expect(screen.getByText(`text-${name}`)).toBeInTheDocument();
  });

  it("renders all five button variants in all three sizes", () => {
    process.env.VERCEL_ENV = "preview";
    render(<StyleGuidePage />);
    expect(screen.getAllByRole("button")).toHaveLength(15);
  });

  it("metadata is noindex", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
