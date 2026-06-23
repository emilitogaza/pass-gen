import type * as React from "react";
import { cloneElement, isValidElement } from "react";
import { cn } from "./utils";

/**
 * Slot — merges its props onto the single child element instead of
 * rendering a wrapper. Used to implement the `asChild` pattern so a
 * component can render as any element (e.g. a Next.js <Link>).
 *
 * className is merged with tailwind-merge; style objects are shallowly
 * merged (child wins for duplicate keys); all other props follow the
 * same pattern (parent defaults, child overrides).
 */
export function Slot({
  children,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  if (!isValidElement(children)) return <>{children}</>;

  const child = children as React.ReactElement<
    React.HTMLAttributes<HTMLElement>
  >;

  return cloneElement(child, {
    ...props,
    ...child.props,
    className: cn(className, child.props.className),
    style: { ...style, ...child.props.style },
  });
}
