import type * as React from "react";
import { Slot } from "@/lib/slot";
import { cn } from "@/lib/utils";

const variantClasses = {
	default:
		"bg-brand text-brand-ink-flip hover:bg-brand/90 focus-visible:outline-brand font-[580] outline-brand/0 outline-1 hover:outline-4 hover:outline-brand/20",
	destructive:
		"bg-error text-ink-flip hover:bg-error/90 focus-visible:outline-error",
	outline:
		"border border-brand text-brand hover:bg-brand/5 focus-visible:outline-brand",
	secondary:
		"bg-fill-raised text-ink hover:bg-fill-raised/70 focus-visible:outline-brand font-[580] outline-fill-raised/0 outline-1 hover:outline-4 hover:outline-brand/15",
	ghost: "text-ink hover:bg-fill-raised focus-visible:outline-brand",
	link: "text-brand underline underline-offset-4 hover:no-underline focus-visible:outline-brand",
} as const;

const sizeClasses = {
	default: "h-16 gap-2 px-6 [&_svg:not([class*='size-'])]:size-5",
	sm: "h-12 gap-1.5 px-5  [&_svg:not([class*='size-'])]:size-4",
	lg: "h-16 gap-2 px-7 text-lg [&_svg:not([class*='size-'])]:size-6",
	icon: "size-14 px-0 [&_svg:not([class*='size-'])]:size-5",
	link: "h-auto px-0 py-2 [&_svg:not([class*='size-'])]:size-5",
} as const;

const baseClasses =
	"inline-flex max-w-full shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-3 " +
	"transition-all duration-300 ease-in-out " +
	"active:scale-100 active:opacity-60 " +
	"focus-visible:outline-2 focus-visible:outline-offset-2 " +
	"disabled:pointer-events-none disabled:opacity-50 " +
	"aria-invalid:border-error " +
	"[&_svg]:pointer-events-none [&_svg]:shrink-0";

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

export type ButtonProps = React.ComponentProps<"button"> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	asChild?: boolean;
	/** Icon (or any node) rendered before the label. */
	icon?: React.ReactNode;
	/** Icon (or any node) rendered after the label. */
	iconRight?: React.ReactNode;
};

export function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	icon,
	iconRight,
	children,
	...props
}: ButtonProps) {
	const classes = buttonVariants({ variant, size, className });

	// With asChild the single child element must be passed through untouched
	// (Slot clones it), so icon props are ignored in that mode.
	if (asChild) {
		return (
			<Slot data-slot="button" className={classes} {...(props as object)}>
				{children}
			</Slot>
		);
	}

	return (
		<button data-slot="button" className={classes} {...props}>
			{icon}
			{children}
			{iconRight}
		</button>
	);
}
