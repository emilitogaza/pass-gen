import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-14 w-full min-w-0 outline-0",
        "rounded-2 border border-fill-dark",
        "bg-fill/80 text-base",
        "px-4 py-1",
        "placeholder:text-muted-foreground",
        "hover:outline-4 hover:outline-brand/30",
        "focus-visible:border-brand focus-visible:bg-fill focus-visible:outline-4 focus-visible:outline-brand/30 focus-visible:ring-ring/50",
        "aria-invalid:border-error aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // maybe use in future: "file:inline-flex file:h-14 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
        "transition-all duration-200 ease-in-out",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
