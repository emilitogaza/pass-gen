"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/components/input";
import { PasswordOutput } from "@/components/password-output";
import { StrengthMeter } from "@/components/strength-meter";
import { charsetEntropy, crackEstimate } from "@/lib/crack-time";
import { mnemonicToPassword } from "@/lib/mnemonic";

const EXAMPLE = "In 2015, I went to Paris and ate an amazing croissant!";

export function MnemonicPanel() {
	const [phrase, setPhrase] = useState("");

	const { password, estimate } = useMemo(() => {
		const password = mnemonicToPassword(phrase);
		return { password, estimate: crackEstimate(charsetEntropy(password)) };
	}, [phrase]);

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-2">
				<label htmlFor="mnemonic-phrase" className=" font-[560] text-ink">
					Write a sentence you&apos;ll remember
				</label>
				<Textarea
					id="mnemonic-phrase"
					value={phrase}
					onChange={(e) => setPhrase(e.target.value)}
					placeholder={EXAMPLE}
					autoFocus
					spellCheck={false}
				/>
				<button
					type="button"
					onClick={() => setPhrase(EXAMPLE)}
					className="self-start text-xs font-[560] text-brand hover:underline cursor-pointer"
				>
					Try the example
				</button>
			</div>

			<PasswordOutput value={password} placeholder="I2015,IwtPaaaaac!" />
			<StrengthMeter estimate={estimate} />
			<div className="space-y-1">
				<p className="text-2xl">How it works:</p>
				<p className="leading-relaxed text-ink-dim/70">
					We take the first letter of every word, keep your numbers and
					punctuation, and join them up. Easy to remember, hard to guess.
				</p>
			</div>
		</div>
	);
}
