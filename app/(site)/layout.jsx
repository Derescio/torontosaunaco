import Header from "../../components/site/Header";
import Footer from "../../components/site/Footer";

// Layout for redesign pages. Paths here must also be listed in lib/site/routes.js.
export default function SiteLayout({ children }) {
  return (
    <div className="bg-white font-body text-ink">
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
