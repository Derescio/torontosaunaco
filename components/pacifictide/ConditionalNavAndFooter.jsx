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

export default function ConditionalNavAndFooter({ children }) {
  const pathname = usePathname();
  const isPacificTide = pathname?.startsWith("/pacifictide");

  return (
    <>
      {isPacificTide ? (
        <>
          <PacificTideRedesignNavBar />
          {children}
          <PacificTideRedesignFooter />
        </>
      ) : (
        <>
          {/* <NavbarUpdate /> */}
          <Header />
          {children}
          <RedesignFooter />
        </>
      )}
    </>
  );
}
