import { ShieldQuestion } from "lucide-react";
import type { Metadata } from "next";
import { PasswordChecker } from "@/components/password-checker";

export const metadata: Metadata = {
	title: "Check a password",
	description:
		"Paste any password or text and see how long it would take to crack — estimated locally, nothing leaves your device.",
};

export default function CheckPage() {
	return (
		<main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-5 py-16 sm:py-24">
			<header className="flex flex-col gap-4">
				<span className="inline-flex w-fit items-center gap-2 rounded-3 border border-border bg-fill-raised/60 px-4 py-2 font-[560] text-ink-dim">
					<ShieldQuestion className="size-5" />
					Checked locally · Never leaves your device
				</span>
				<h1 className="text-4xl font-[600] tracking-tight text-ink sm:text-5xl">
					Check a password
				</h1>
				<p className="max-w-lg leading-relaxed text-ink-dim">
					Paste any password or text and see how long it would take to crack —
					and which everyday devices would get there first.
				</p>
			</header>

			<div className="rounded-4 border border-border bg-fill p-5 sm:p-7">
				<PasswordChecker />
			</div>

			<footer className="mt-auto pt-6 text-xs text-ink-dim/60">
				Everything runs in your browser. Whatever you paste is never sent,
				stored, or logged anywhere.
			</footer>
		</main>
	);
}
