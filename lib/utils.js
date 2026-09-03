import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 * Standard shadcn/ui utility.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
