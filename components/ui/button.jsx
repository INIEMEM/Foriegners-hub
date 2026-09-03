import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white shadow-[0_12px_30px_rgba(49,92,255,0.25)] hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_16px_36px_rgba(49,92,255,0.3)]",
        destructive:
          "bg-danger text-white hover:bg-danger/90",
        outline:
          "border border-slate-200 bg-white/80 text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-950 hover:shadow-md",
        secondary:
          "bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-800",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900",
        link:
          "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 px-8 py-3 text-base",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Button component — supports all shadcn/ui variants.
 * Uses `asChild` to render as any element via Radix Slot.
 */
function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
