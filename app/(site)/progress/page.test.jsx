import { render, screen } from "@testing-library/react";
import ProgressPage, { metadata } from "./page";
import { STAGES } from "../../../lib/site/progress";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return Link;
});

describe("/progress", () => {
  const original = process.env.VERCEL_ENV;
  afterEach(() => {
    process.env.VERCEL_ENV = original;
  });

  it("calls notFound in production", () => {
    process.env.VERCEL_ENV = "production";
    expect(() => ProgressPage()).toThrow("NEXT_NOT_FOUND");
  });

  it("shows every stage and item outside production", () => {
    process.env.VERCEL_ENV = "preview";
    render(<ProgressPage />);
    for (const stage of STAGES) {
      expect(screen.getByRole("heading", { name: stage.title })).toBeInTheDocument();
      for (const item of stage.items) expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it("links finished pages", () => {
    process.env.VERCEL_ENV = "preview";
    render(<ProgressPage />);
    expect(screen.getByRole("link", { name: /Colours, type and buttons/ })).toHaveAttribute("href", "/style-guide");
  });

  it("metadata is noindex", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
