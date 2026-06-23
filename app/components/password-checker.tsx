"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/components/input";
import { StrengthMeter } from "@/components/strength-meter";
import { charsetEntropy, crackEstimate } from "@/lib/crack-time";

export function PasswordChecker() {
	const [text, setText] = useState("");

	const estimate = useMemo(() => crackEstimate(charsetEntropy(text)), [text]);

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-2">
				<label htmlFor="check-input" className=" font-[560] text-ink">
					Paste any password or text
				</label>
				<Textarea
					id="check-input"
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="type or paste anything…"
					autoFocus
					spellCheck={false}
				/>
			</div>

			<StrengthMeter estimate={estimate} />
		</div>
	);
}
