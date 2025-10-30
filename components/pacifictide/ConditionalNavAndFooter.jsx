"use client";
import { usePathname } from "next/navigation";
import NavbarUpdate from "@/components/NavbarUpdate";
import Footer from "@/components/Footer";
import PacificTideNavBar from "@/components/pacifictide/PacificTideNaBar";
import PacificTideFooter from "@/components/pacifictide/PacificTideFooter";

export default function ConditionalNavAndFooter({ children }) {
  const pathname = usePathname();
  const isPacificTide = pathname?.startsWith("/pacifictide");

  return (
    <>
      {isPacificTide ? (
        <>
          <PacificTideNavBar />
          {children}
          <PacificTideFooter />
        </>
      ) : (
        <>
          <NavbarUpdate />
          {children}
          <Footer />
        </>
      )}
    </>
  );
}
