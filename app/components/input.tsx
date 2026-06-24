import type * as React from "react";

import { cn } from "@/lib/utils";

const fieldClasses = cn(
	"w-full min-w-0 outline-0",
	"rounded-3 border border-fill-dark",
	"bg-fill/80 text-base text-ink",
	"placeholder:text-ink/40",
	"hover:outline-4 hover:outline-brand/30",
	"focus-visible:border-brand focus-visible:bg-fill focus-visible:outline-4 focus-visible:outline-brand/30",
	"aria-invalid:border-error aria-invalid:outline-error/30",
	"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
	"transition-all duration-200 ease-in-out",
);

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(fieldClasses, "flex h-16 px-4 py-1", className)}
			{...props}
		/>
	);
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				fieldClasses,
				"block min-h-28 px-4 py-3 leading-relaxed resize-y",
				className,
			)}
			{...props}
		/>
	);
}

export { Input, Textarea };
