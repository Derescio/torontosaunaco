import Image from "next/image";
import Link from "next/link";
import { COPYRIGHT, FOOTER_BRAND, FOOTER_COLUMNS } from "./nav";

const linkClass = "text-sand-100 underline-offset-4 hover:text-white hover:underline";

function FooterLink({ href, children }) {
  if (href.startsWith("https://")) {
    return (
      <a href={href} className={linkClass} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="bg-ink font-body text-body text-sand-100">
      <div className="mx-auto grid max-w-site grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-10 px-5 pb-10 pt-16 desktop:px-8">
        <div className="flex flex-col gap-3">
          <Link href="/" aria-label="The Toronto Sauna Co. home" className="w-fit">
            <Image src="/images/site/logo-footer.png" alt="The Toronto Sauna Co." width={154} height={56} className="h-14 w-auto" />
          </Link>
          {FOOTER_BRAND.map((line) => (
            <span key={line} className="text-sand-200">
              {line}
            </span>
          ))}
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className="flex flex-col gap-2">
            <span className="font-bold text-white">{column.title}</span>
            {column.links.map((link) => (
              <FooterLink key={link.label} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </nav>
        ))}
      </div>
      <div className="mx-auto max-w-site px-5 desktop:px-8">
        <div className="border-t border-line-dark py-6 text-small text-sand-400">{COPYRIGHT}</div>
      </div>
    </footer>
  );
}
