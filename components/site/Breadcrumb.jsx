import { Fragment } from "react";
import Link from "next/link";
import { cn } from "../../lib/site/cn";

// Breadcrumb from a design breadcrumb block's items ({ text, href? }). Items without href are plain text.
export default function Breadcrumb({ items, dark = false }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <nav aria-label="Breadcrumb" className={cn("text-caption", dark ? "text-sand-300" : "text-taupe-500")}>
      {list.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && " / "}
          {item.href ? (
            <Link href={item.href} className={cn("underline", dark ? "hover:text-white" : "hover:text-walnut")}>
              {item.text}
            </Link>
          ) : (
            <span aria-current={i === list.length - 1 ? "page" : undefined}>{item.text}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
