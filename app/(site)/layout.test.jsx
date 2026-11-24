import { render, screen } from "@testing-library/react";
import SiteLayout from "./layout";

jest.mock("../../components/site/Header", () => () => <header>header</header>);
jest.mock("../../components/site/Footer", () => () => <footer>footer</footer>);

describe("(site) layout", () => {
  it("renders exactly one main between header and footer", () => {
    render(
      <SiteLayout>
        <p>page</p>
      </SiteLayout>
    );
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
    const order = [...document.body.querySelectorAll("header, main, footer")].map((el) => el.tagName);
    expect(order).toEqual(["HEADER", "MAIN", "FOOTER"]);
    expect(screen.getByRole("main")).toHaveTextContent("page");
  });
});
