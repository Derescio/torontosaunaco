import { render, screen } from "@testing-library/react";
import ContactPage, { contactCopy } from "./ContactPage";

jest.mock("posthog-js", () => ({ capture: jest.fn() }));
jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return Link;
});

describe("ContactPage", () => {
  it("has one h1", () => {
    render(<ContactPage fallbackEmail={null} />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Let’s talk saunas.");
  });

  it("shows the contact lines with working links", () => {
    const { container } = render(<ContactPage fallbackEmail={null} />);
    expect(container.querySelector('aside a[href="tel:+14374296623"]')).not.toBeNull();
    expect(container.querySelector('aside a[href="mailto:sales@thetorontosaunaco.com"]')).not.toBeNull();
    expect(container.textContent).toContain("17380 Highway 27, Schomberg, ON (by appointment)");
    expect(container.textContent).toContain("Delivery and installation across Ontario and British Columbia.");
  });

  it("renders the form in quote mode", () => {
    render(<ContactPage fallbackEmail={null} />);
    expect(screen.getByRole("button", { name: "Request My Quote" })).toBeInTheDocument();
  });

  it("builds the form copy from the design JSON", () => {
    const copy = contactCopy();
    expect(copy.titles.visit).toContain("Book a showroom");
    expect(copy.labels).toMatchObject({ reason: "How can we help?", name: "Name *", time: "When would you like it installed?" });
    expect(copy.thanks.title).toContain("{{lfFirst}}");
    expect(copy.again).toBe("Send another request");
  });

  it("never puts tjallen in the page, and says Schomberg", () => {
    const { container } = render(<ContactPage fallbackEmail="sales@thetorontosaunaco.com" />);
    expect(container.innerHTML).not.toContain("tjallen");
    expect(JSON.stringify(contactCopy())).not.toContain("tjallen");
    expect(container.textContent).not.toMatch(/King Township|Leisurecraft/);
  });
});
