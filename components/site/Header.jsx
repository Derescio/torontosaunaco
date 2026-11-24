"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "./Button";
import MobileMenu from "./MobileMenu";
import { CONTACT, HEADER_ACTIONS, MAIN_NAV, isActive } from "./nav";
import { cn } from "../../lib/site/cn";

function BagIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7h14l-1.2 12.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7z" />
      <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
    </svg>
  );
}

export function RulerIcon() {
  return (
    <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17 17 3l4 4L7 21H3z" />
      <path d="m7 13 2 2M10 10l2 2M13 7l2 2" />
    </svg>
  );
}

const navLink = "underline-offset-4 hover:underline";

function DropdownItem({ item, current }) {
  return (
    <div className="group relative inline-flex items-center">
      <Link href={item.href} aria-current={current ? "page" : undefined} className={cn(navLink, current && "underline")}>
        {item.label}
        <span aria-hidden="true" className="ml-1 inline-block -translate-y-px text-caption">
          ▾
        </span>
      </Link>
      {/* Hover only where the device has it, so a first tap on a touch screen follows the link. */}
      <div
        data-dropdown-panel
        className="absolute -left-4 top-full z-50 hidden pt-3.5 group-focus-within:block [@media(hover:hover)]:group-hover:block"
      >
        <div className={cn("flex flex-col gap-0.5 rounded-card border border-line bg-white p-2.5 shadow-menu", item.width)}>
          {item.children.map((child) => (
            <Link
              key={child.href + child.label}
              href={child.href}
              className="flex items-center gap-3.5 rounded-lg px-3 py-2.5 text-ink hover:bg-linen focus-visible:bg-linen focus-visible:outline-none"
            >
              {child.image && (
                <Image src={child.image.src} alt={child.image.alt} width={56} height={56} className="size-14 flex-none rounded-lg object-cover" />
              )}
              <span className="flex flex-col">
                <span className="text-small font-semibold">{child.label}</span>
                <span className="text-caption font-normal text-taupe-500">{child.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-white font-body text-ink">
      <div className="bg-ink text-small text-sand-200">
        <div className="mx-auto flex max-w-site items-center justify-between gap-4 px-5 py-2 md:px-8">
          <span className="hidden md:inline">{CONTACT.note}</span>
          <span className="ml-auto flex items-center gap-5">
            <a href={CONTACT.tel} className="text-sand-100 hover:text-white">
              {CONTACT.phone}
            </a>
            <Link href={HEADER_ACTIONS.cart.href} className="inline-flex items-center gap-1.5 text-sand-100 hover:text-white">
              <BagIcon />
              {HEADER_ACTIONS.cart.label}
            </Link>
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-site items-center justify-between gap-7 px-5 py-3.5 md:px-8">
        <Link href="/" aria-label="The Toronto Sauna Co. home" className="flex-none">
          <Image src="/images/site/logo.png" alt="The Toronto Sauna Co." width={132} height={48} priority className="h-12 w-auto" />
        </Link>

        {/* Keyed by path: remounting drops focus from the clicked link, so its dropdown closes after navigation. */}
        <nav key={pathname} aria-label="Main" className="hidden flex-wrap gap-x-7 gap-y-2 text-nav font-medium md:flex">
          {MAIN_NAV.map((item) => {
            const current = isActive(item, pathname);
            return item.children ? (
              <DropdownItem key={item.label} item={item} current={current} />
            ) : (
              <Link
                key={item.label}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(navLink, current && "underline")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-none items-center gap-2.5">
          <Button href={HEADER_ACTIONS.finder.href} variant="outline-walnut" className="hidden md:inline-flex">
            <RulerIcon />
            {HEADER_ACTIONS.finder.label}
          </Button>
          <Button href={HEADER_ACTIONS.quote.href} variant="dark" className="h-9 px-4 md:h-11 md:px-5">
            {HEADER_ACTIONS.quote.label}
          </Button>
          <MobileMenu pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
