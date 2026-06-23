"use client";

import { KeyRound, Type } from "lucide-react";
import { useState } from "react";
import { MnemonicPanel } from "@/components/mnemonic-panel";
import { PassphrasePanel } from "@/components/passphrase-panel";
import { cn } from "@/lib/utils";

type Mode = "mnemonic" | "passphrase";

const MODES: { id: Mode; label: string; sub: string; icon: typeof Type }[] = [
	{
		id: "mnemonic",
		label: "First-letter mnemonic",
		sub: "Turn a sentence into a password",
		icon: Type,
	},
	{
		id: "passphrase",
		label: "Passphrase",
		sub: "Memorable words, joined up",
		icon: KeyRound,
	},
];

export function Generator() {
	const [mode, setMode] = useState<Mode>("mnemonic");

	return (
		<div className="flex w-full flex-col gap-6">
			<div
				className="grid gap-3 sm:grid-cols-2"
				role="tablist"
				aria-label="Generator mode"
			>
				{MODES.map(({ id, label, sub, icon: Icon }) => {
					const active = mode === id;
					return (
						<button
							key={id}
							type="button"
							role="tab"
							aria-selected={active}
							onClick={() => setMode(id)}
							className={cn(
								"flex items-center gap-3 rounded-3 border p-4 text-left transition-all duration-200 cursor-pointer",
								"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
								active
									? "border-brand bg-brand/5 outline-4 outline-brand/15"
									: "border-border bg-fill hover:border-brand/40",
							)}
						>
							<span
								className={cn(
									"grid size-11 shrink-0 place-items-center rounded-2 transition-colors",
									active
										? "bg-brand text-brand-ink-flip"
										: "bg-fill-raised text-ink-dim",
								)}
							>
								<Icon className="size-5" />
							</span>
							<span className="flex flex-col">
								<span className="font-[580] text-ink">{label}</span>
								<span className="text-xs text-ink-dim/80">{sub}</span>
							</span>
						</button>
					);
				})}
			</div>

			<div className="rounded-4 border border-border bg-fill p-5 sm:p-7">
				{mode === "mnemonic" ? <MnemonicPanel /> : <PassphrasePanel />}
			</div>
		</div>
	);
}
