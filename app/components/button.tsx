import type * as React from "react";
import { Slot } from "@/lib/slot";
import { cn } from "@/lib/utils";

// TODO: Outline that grows on hover, or something fun

const variantClasses = {
  default:
    "bg-brand text-brand-ink hover:bg-brand/90 focus-visible:outline-brand font-[580] outline-brand/0 outline-1 hover:outline-4 hover:outline-brand/20",
  destructive:
    "bg-error text-ink-flip hover:bg-error/90 focus-visible:outline-error",
  outline:
    "border border-brand text-brand hover:bg-brand/5 focus-visible:outline-brand",
  secondary:
    "bg-fill-raised text-fill-raised-ink hover:bg-fill-raised/90 focus-visible:outline-fill-raised font-[580] outline-fill-raised/0 outline-1 hover:outline-4 hover:outline-fill-raised/20",
  ghost: "text-ink hover:bg-fill-raised focus-visible:outline-brand",
  link: "text-brand underline underline-offset-4 hover:no-underline focus-visible:outline-brand",
} as const;

const sizeClasses = {
  default:
    "h-14 gap-1 px-6 [&>svg:first-child]:-ml-0.5 [&>svg:last-child]:-mr-0.5 [&_svg:not([class*='size-'])]:size-5",
  sm: "h-12 px-5 [&_svg:not([class*='size-'])]:size-4",
  lg: "h-16 gap-1.5 px-7 [&>svg:first-child]:-ml-1 [&>svg:last-child]:-mr-1 [&_svg:not([class*='size-'])]:size-5",
  icon: "size-12 px-0 [&_svg:not([class*='size-'])]:size-5",
  link: "h-auto px-0 py-4 [&_svg:not([class*='size-'])]:size-5",
} as const;

const baseClasses =
  "inline-flex max-w-full shrink-0 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-3 " +
  "transition-all duration-300 ease-in-out " +
  "hover:scale-[1.02] md:hover:scale-[1.03] active:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "aria-invalid:border-error " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 " +
  "hover:[&_svg]:[animation:var(--animate-wiggle-grow)]";

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}) {
  const classes = buttonVariants({ variant, size, className });
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={classes} {...(props as object)} />;
}
