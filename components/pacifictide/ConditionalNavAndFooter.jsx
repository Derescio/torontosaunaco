"use client";
import { usePathname } from "next/navigation";
import NavbarUpdate from "@/components/NavbarUpdate";
import Footer from "@/components/Footer";
import RedesignFooter from "@/components/redesign/Footer";
import PacificTideNavBar from "@/components/pacifictide/PacificTideNaBar";
//import PacificTideFooter from "@/components/pacifictide/PacificTideFooter";
import PacificTideRedesignFooter from "@/components/pacifictide/Redesign/PacificTideFooter";
import Header from "@/components/redesign/Header";
import PacificTideRedesignNavBar from "@/components/pacifictide/Redesign/PacificTideNavBar";
import { isSiteRoute } from "@/lib/site/routes";

export default function ConditionalNavAndFooter({ children }) {
  const pathname = usePathname();
  const isPacificTide = pathname?.startsWith("/pacifictide");

  // Redesign pages (app/(site)/) render their own header, <main> and footer.
  if (isSiteRoute(pathname)) return children;

  return (
    <>
      {isPacificTide ? (
        <>
          <PacificTideRedesignNavBar />
          <main>{children}</main>
          <PacificTideRedesignFooter />
        </>
      ) : (
        <>
          {/* <NavbarUpdate /> */}
          <Header />
          <main>{children}</main>
          <RedesignFooter />
        </>
      )}
    </>
  );
}
