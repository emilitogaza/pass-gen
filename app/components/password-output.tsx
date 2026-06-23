"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export function PasswordOutput({
	value,
	placeholder = "Your password appears here",
	editable = false,
	onChange,
}: {
	value: string;
	placeholder?: string;
	/** Render the value as an editable input the user can tweak by hand. */
	editable?: boolean;
	onChange?: (next: string) => void;
}) {
	const [copied, setCopied] = useState(false);

	async function copy() {
		if (!value) return;
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1600);
		} catch {
			/* clipboard unavailable — silently ignore */
		}
	}

	const textClasses = "min-w-0 flex-1 font-mono text-lg break-all sm:text-xl";

	return (
		<div className="flex items-stretch gap-2 rounded-3 border border-fill-dark bg-fill p-2 pl-4">
			{editable ? (
				<input
					value={value}
					onChange={(e) => onChange?.(e.target.value)}
					placeholder={placeholder}
					spellCheck={false}
					autoComplete="off"
					aria-label="Generated password (editable)"
					className={cn(
						textClasses,
						"self-center bg-transparent text-ink outline-0 placeholder:text-ink/30",
					)}
				/>
			) : (
				<p
					className={cn(
						"flex items-center",
						textClasses,
						value ? "text-ink" : "text-ink/30",
					)}
				>
					{value || placeholder}
				</p>
			)}
			<Button
				type="button"
				size="icon"
				variant={copied ? "default" : "secondary"}
				onClick={copy}
				disabled={!value}
				aria-label={copied ? "Copied" : "Copy password"}
				className="self-center"
				icon={copied ? <Check /> : <Copy />}
			/>
		</div>
	);
}
