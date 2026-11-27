import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import ContactForm from "./ContactForm";
import { CONTACT_COPY } from "../../lib/site/contactForm";

jest.mock("posthog-js", () => ({ capture: jest.fn() }));
jest.mock("@/assets/utils/marketingAttribution", () => ({
  buildQuoteSubmissionId: () => "sub-1",
  getAttributionForSubmission: () => ({ utm_source: "google" }),
  pushDataLayerEvent: jest.fn(),
}));
jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return Link;
});

const copy = {
  titles: {
    quote: "<strong>Get your sauna <em>quote.</em></strong>",
    visit: "<strong>Book a showroom <em>visit.</em></strong>",
    question: "<strong>Ask us <em>anything.</em></strong>",
  },
  intro: "Every request goes straight to our sales team.",
  labels: {
    reason: "How can we help?",
    name: "Name *",
    phone: "Phone",
    email: "Email",
    city: "City or postal code",
    type: "I'm interested in",
    when: "Preferred days and times",
    time: "When would you like it installed?",
  },
  thanks: {
    title: "<strong>Thanks, {{lfFirst}}.</strong>",
    body: "We’ve got your request (reference {{lfRef}}) and our sales team will be in touch within one business day.",
  },
  again: "Send another request",
};

const fill = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const reply = (status, body) => Promise.resolve({ ok: status === 200, status, json: () => Promise.resolve(body) });

beforeEach(() => {
  window.location.hash = "";
  global.fetch = jest.fn(() => reply(200, { ok: true, ref: "TSC-123456" }));
});

describe("ContactForm", () => {
  it("starts in quote mode with the quote fields and button", () => {
    render(<ContactForm copy={copy} fallbackEmail={null} />);
    expect(screen.getByRole("heading", { name: "Get your sauna quote." })).toBeInTheDocument();
    expect(screen.getByLabelText("I'm interested in")).toBeInTheDocument();
    expect(screen.getByLabelText("When would you like it installed?")).toBeInTheDocument();
    expect(screen.getByLabelText(CONTACT_COPY.msgLabel.quote)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Request My Quote" })).toBeInTheDocument();
  });

  it("switches fields, title and button with the mode", () => {
    render(<ContactForm copy={copy} fallbackEmail={null} />);
    fill("How can we help?", "Book a showroom visit");
    expect(screen.getByRole("heading", { name: "Book a showroom visit." })).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred days and times")).toBeInTheDocument();
    expect(screen.queryByLabelText("When would you like it installed?")).toBeNull();
    expect(screen.getByRole("button", { name: "Request a Visit" })).toBeInTheDocument();
    fill("How can we help?", "Ask a question");
    expect(screen.queryByLabelText("I'm interested in")).toBeNull();
    expect(screen.getByLabelText(CONTACT_COPY.msgLabel.question)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Message" })).toBeInTheDocument();
  });

  describe("a prefilled message", () => {
    afterEach(() => window.history.replaceState({}, "", "/"));

    it("fills the message box from ?msg= and stays in quote mode", async () => {
      window.history.replaceState({}, "", "/contact?msg=Hi%0AWhere%3A%20outdoor%2C%20visit%20soon");
      const { container } = render(<ContactForm copy={copy} fallbackEmail={null} />);
      await waitFor(() => expect(container.querySelector("#c-msg").value).toBe("Hi\nWhere: outdoor, visit soon"));
      expect(screen.getByRole("heading", { name: "Get your sauna quote." })).toBeInTheDocument();
    });

    it("caps the message at 5000 characters", async () => {
      window.history.replaceState({}, "", `/contact?msg=${"a".repeat(6000)}`);
      const { container } = render(<ContactForm copy={copy} fallbackEmail={null} />);
      await waitFor(() => expect(container.querySelector("#c-msg").value).toHaveLength(5000));
    });

    it("leaves the box empty without ?msg=", () => {
      const { container } = render(<ContactForm copy={copy} fallbackEmail={null} />);
      expect(container.querySelector("#c-msg").value).toBe("");
    });
  });

  it("opens in visit mode from #visit", async () => {
    window.location.hash = "#visit";
    render(<ContactForm copy={copy} fallbackEmail={null} />);
    expect(await screen.findByRole("heading", { name: "Book a showroom visit." })).toBeInTheDocument();
  });

  it("shows the design's errors and doesn't send", () => {
    render(<ContactForm copy={copy} fallbackEmail={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Request My Quote" }));
    expect(screen.getByText(CONTACT_COPY.nameError)).toBeInTheDocument();
    expect(screen.getByText(CONTACT_COPY.reachError)).toBeInTheDocument();
    expect(screen.getByLabelText("Name *")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Name *")).toHaveFocus();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends and thanks the visitor with the reference", async () => {
    render(<ContactForm copy={copy} fallbackEmail={null} />);
    fill("Name *", "Ann Lee");
    fill("Email", "ann@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Request My Quote" }));
    expect(await screen.findByText("Thanks, Ann.")).toBeInTheDocument();
    expect(screen.getByText(/reference TSC-123456/)).toBeInTheDocument();
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("/api/site/contact");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ reason: "Get a quote", name: "Ann Lee", email: "ann@example.com", submissionId: "sub-1", hp: "" });
    expect(body.ref).toMatch(/^TSC-\d{6}$/);
  });

  it("on failure before cutover asks the visitor to call, with no email link", async () => {
    fetch.mockImplementation(() => reply(500, { error: "send_failed" }));
    const { container } = render(<ContactForm copy={copy} fallbackEmail={null} />);
    fill("Name *", "Ann Lee");
    fill("Phone", "416 555 1234");
    fireEvent.click(screen.getByRole("button", { name: "Request My Quote" }));
    expect(await screen.findByText(CONTACT_COPY.sendFailed)).toBeInTheDocument();
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("on failure in production offers an email link to sales only", async () => {
    fetch.mockImplementation(() => Promise.reject(new Error("offline")));
    const { container } = render(<ContactForm copy={copy} fallbackEmail="sales@thetorontosaunaco.com" />);
    fill("Name *", "Ann Lee");
    fill("Phone", "416 555 1234");
    fireEvent.click(screen.getByRole("button", { name: "Request My Quote" }));
    await screen.findByText(CONTACT_COPY.sendFailed);
    const links = [...container.querySelectorAll('a[href^="mailto:"]')];
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toMatch(/^mailto:sales@thetorontosaunaco\.com\?subject=/);
  });

  it("'Send another request' returns to the form in the same mode", async () => {
    render(<ContactForm copy={copy} fallbackEmail={null} />);
    fill("How can we help?", "Book a showroom visit");
    fill("Name *", "Ann Lee");
    fill("Email", "ann@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Request a Visit" }));
    fireEvent.click(await screen.findByRole("button", { name: "Send another request" }));
    expect(screen.getByRole("heading", { name: "Book a showroom visit." })).toBeInTheDocument();
    expect(screen.getByLabelText("Name *")).toHaveValue("");
  });

  it("hides the honeypot from people and assistive tech", () => {
    const { container } = render(<ContactForm copy={copy} fallbackEmail={null} />);
    const hp = container.querySelector('input[name="tsc_hp"]');
    expect(hp).toHaveAttribute("tabindex", "-1");
    // Nothing that browser autofill would treat as a name, company or address field.
    expect(container.querySelector('input[name="company"]')).toBeNull();
    expect(hp.getAttribute("id")).not.toMatch(/company|name|address|org/i);
    expect(container.querySelector(`label[for="${hp.id}"]`)).toHaveTextContent("Leave this empty");
    expect(hp.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(within(container).queryByRole("textbox", { name: /company/i })).toBeNull();
  });
});
