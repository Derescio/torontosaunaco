"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "./Button";
import { CONTACT, HEADER_ACTIONS, MAIN_NAV, isActive } from "./nav";
import { cn } from "../../lib/site/cn";

const PANEL_ID = "site-mobile-menu";
const rowLink = "flex min-h-11 items-center py-2 text-title font-medium underline-offset-4 hover:underline";

function MenuIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function Group({ item, pathname, onNavigate }) {
  const [expanded, setExpanded] = useState(false);
  const listId = `site-mobile-menu-${item.label.replace(/\W+/g, "-").toLowerCase()}`;
  const coversParent = item.children.some((child) => child.href === item.href);
  const links = coversParent ? item.children : [{ label: `All ${item.label}`, href: item.href }, ...item.children];

  return (
    <li className="border-b border-line">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={listId}
        onClick={() => setExpanded((v) => !v)}
        className={cn(rowLink, "w-full justify-between", isActive(item, pathname) && "underline")}
      >
        {item.label}
        <span aria-hidden="true" className={cn("text-caption transition-transform", expanded && "rotate-180")}>
          ▾
        </span>
      </button>
      {expanded && (
        <ul id={listId} className="pb-3 pl-4">
          {links.map((link) => (
            <li key={link.href + link.label}>
              <Link
                href={link.href}
                onClick={onNavigate}
                aria-current={pathname === link.href ? "page" : undefined}
                className="flex min-h-11 items-center text-body text-taupe-700 underline-offset-4 hover:text-ink hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function MobileMenu({ pathname }) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
      const onKey = (e) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      menuButtonRef.current?.focus();
    }
  }, [open]);

  // Close on navigation (including back/forward) and when the window widens to desktop,
  // where the panel is hidden but would still hold the scroll lock.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open || typeof window.matchMedia !== "function") return undefined;
    const query = window.matchMedia("(min-width: 998px)");
    const onChange = (e) => {
      if (e.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="desktop:hidden">
      <button
        ref={menuButtonRef}
        type="button"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label="Menu"
        onClick={() => setOpen(true)}
        className="inline-flex size-10 items-center justify-center rounded-full border border-walnut text-walnut transition-colors hover:bg-walnut hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-walnut focus-visible:ring-offset-2"
      >
        <MenuIcon />
      </button>

      {open && (
        <div
          id={PANEL_ID}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 overflow-y-auto bg-white font-body text-ink"
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <span className="text-eyebrow uppercase text-taupe-500">Menu</span>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-linen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-walnut"
            >
              <CloseIcon />
            </button>
          </div>

          <nav aria-label="Main" className="px-5">
            <ul>
              {MAIN_NAV.map((item) =>
                item.children ? (
                  <Group key={item.label} item={item} pathname={pathname} onNavigate={close} />
                ) : (
                  <li key={item.label} className="border-b border-line">
                    <Link
                      href={item.href}
                      onClick={close}
                      aria-current={isActive(item, pathname) ? "page" : undefined}
                      className={cn(rowLink, isActive(item, pathname) && "underline")}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>

          <div className="flex flex-col gap-3 px-5 py-6">
            <Button href={HEADER_ACTIONS.finder.href} variant="outline-walnut" className="w-full" onClick={close}>
              {HEADER_ACTIONS.finder.label}
            </Button>
            <Button href={HEADER_ACTIONS.quote.href} variant="dark" className="w-full" onClick={close}>
              {HEADER_ACTIONS.quote.label}
            </Button>
            <a href={CONTACT.tel} className="mt-2 text-center text-body font-semibold text-walnut">
              {CONTACT.phone}
            </a>
            <p className="text-center text-small text-taupe-500">Showroom in Schomberg, by appointment</p>
          </div>
        </div>
      )}
    </div>
  );
}
