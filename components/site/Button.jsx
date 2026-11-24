import Link from "next/link";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/site/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-body font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        dark: "bg-ink text-white hover:bg-ink-soft focus-visible:ring-walnut",
        walnut: "bg-walnut text-white hover:bg-ink focus-visible:ring-walnut",
        // On dark backgrounds: tan ring (7.5:1 on ink) with an ink offset.
        light: "bg-white text-ink hover:bg-linen focus-visible:ring-tan focus-visible:ring-offset-ink",
        "outline-light": "border border-white text-white hover:bg-white/10 focus-visible:ring-tan focus-visible:ring-offset-ink",
        "outline-walnut": "border border-walnut text-walnut hover:bg-walnut hover:text-white focus-visible:ring-walnut",
      },
      size: {
        sm: "h-9 px-4 text-small",
        md: "h-11 px-5 text-small",
        lg: "h-13 px-7 text-body",
      },
    },
    defaultVariants: { variant: "dark", size: "md" },
  }
);

export default function Button({ variant, size, href, className, type, children, ...props }) {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} className={classes} {...props}>
      {children}
    </button>
  );
}
