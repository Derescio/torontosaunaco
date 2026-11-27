// What the client sees at /progress on staging. Update the statuses and UPDATED with each redesign PR.
// Plain language: this is read by the client, not developers. Only link pages listed in lib/site/routes.js.

export const UPDATED = "26 November 2026";

export const STATUS_LABELS = {
  done: "Ready to view",
  "in-progress": "In progress",
  next: "Coming up",
};

// `page: true` marks items that are a page the client can open once done.
export const STAGES = [
  {
    title: "Look and feel",
    summary: "The colours, fonts, buttons, header and footer that every new page is built from.",
    items: [
      { label: "Colours, type and buttons", status: "done", page: true, href: "/style-guide" },
      { label: "Header and menu, including the phone menu", status: "done" },
      { label: "Footer", status: "done" },
      { label: "Behind-the-scenes setup for the new pages", status: "done" },
    ],
  },
  {
    title: "Information pages",
    summary: "The pages that explain who you are and how to reach you.",
    items: [
      { label: "Warranty, shipping, refund, terms and privacy", status: "done", page: true, href: "/warranty" },
      { label: "About, Wellness, Contact and the Blog", status: "done", page: true, href: "/blog" },
      { label: "Service areas and city pages", status: "next", page: true },
      { label: "Sauna Finder", status: "next", page: true },
    ],
  },
  {
    title: "Products",
    summary: "Saunas, cold plunges, showers, heaters and accessories, with your current prices.",
    items: [
      { label: "Category pages with filters", status: "next", page: true },
      { label: "Product pages with options and pricing", status: "next", page: true },
      { label: "Accessories", status: "next", page: true },
      { label: "Homepage", status: "next", page: true },
    ],
  },
  {
    title: "Quote requests",
    summary: "The cart becomes a quote request, emailed to the customer and your sales team.",
    items: [
      { label: "Quote proposal with a printable PDF", status: "next" },
      { label: "Quote emails to the customer and sales", status: "next" },
    ],
  },
  {
    title: "Search and final checks",
    summary: "Keeping your Google rankings and checking every page on phone and desktop.",
    items: [
      { label: "Old addresses forward to the new pages", status: "next" },
      { label: "Search listings, titles and descriptions", status: "next" },
      { label: "Final review on phone and desktop", status: "next" },
    ],
  },
  {
    title: "Launch",
    summary: "The new site goes live once you approve it.",
    items: [{ label: "Your approval, then go live", status: "next" }],
  },
];
