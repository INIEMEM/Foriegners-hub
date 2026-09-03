import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

/**
 * Accessible label component using Radix UI.
 */
function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-sm font-medium leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
}

export { Label };
