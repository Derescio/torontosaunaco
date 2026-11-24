import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import ConditionalNavAndFooter from "./ConditionalNavAndFooter";

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));
jest.mock("@/components/NavbarUpdate", () => () => null, { virtual: true });
jest.mock("@/components/Footer", () => () => null, { virtual: true });
jest.mock("@/components/redesign/Header", () => () => <div data-testid="old-header" />, { virtual: true });
jest.mock("@/components/redesign/Footer", () => () => <div data-testid="old-footer" />, { virtual: true });
jest.mock("@/components/pacifictide/PacificTideNaBar", () => () => null, { virtual: true });
jest.mock("@/components/pacifictide/Redesign/PacificTideFooter", () => () => <div data-testid="pt-footer" />, { virtual: true });
jest.mock("@/components/pacifictide/Redesign/PacificTideNavBar", () => () => <div data-testid="pt-header" />, { virtual: true });

const renderAt = (pathname) => {
  usePathname.mockReturnValue(pathname);
  return render(
    <ConditionalNavAndFooter>
      <p>page</p>
    </ConditionalNavAndFooter>
  );
};

describe("ConditionalNavAndFooter", () => {
  it("renders the old header, main and footer on /", () => {
    renderAt("/");
    expect(screen.getByTestId("old-header")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("page");
    expect(screen.getByTestId("old-footer")).toBeInTheDocument();
  });

  it("keeps the PacificTide nav and a main on /pacifictide", () => {
    renderAt("/pacifictide/x");
    expect(screen.getByTestId("pt-header")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("page");
  });

  it("renders only children on /style-guide", () => {
    renderAt("/style-guide");
    expect(screen.queryByTestId("old-header")).not.toBeInTheDocument();
    expect(screen.queryByTestId("old-footer")).not.toBeInTheDocument();
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
    expect(screen.getByText("page")).toBeInTheDocument();
  });
});
