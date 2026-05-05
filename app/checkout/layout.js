export const metadata = {
  metadataBase: new URL("https://www.thetorontosaunaco.com"),
  alternates: {
    canonical: "/checkout",
  },
  title: "Checkout | Toronto Sauna Co.",
  description:
    "Complete your Toronto Sauna Co. order with secure checkout. Review your cart and pay safely.",
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({ children }) {
  return children;
}
