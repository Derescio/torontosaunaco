import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { fontSize } from "./tokens";

// tailwind-merge reads unknown `text-*` classes as colours, so `cn("text-small", "text-white")`
// would drop one. Register the site font sizes so sizes and colours merge separately.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: Object.keys(fontSize) }] } },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
