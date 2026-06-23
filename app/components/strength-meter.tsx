import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import {
	CRACK_DEVICES,
	type CrackEstimate,
	crackSeconds,
	humanTime,
} from "@/lib/crack-time";
import { cn } from "@/lib/utils";

const SEGMENTS = 5;

const SEGMENT_COLOR: Record<number, string> = {
	1: "bg-error",
	2: "bg-purple-400",
	3: "bg-purple-500",
	4: "bg-purple-600",
	5: "bg-purple-700",
};

export function StrengthMeter({ estimate }: { estimate: CrackEstimate }) {
	const { score, label, strengthLabel, entropyBits } = estimate;
	const Icon = score === 0 ? Shield : score <= 1 ? ShieldAlert : ShieldCheck;

	return (
		<div className="flex flex-col gap-3 rounded-3 border border-border bg-fill-raised/50 p-5">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2 text-ink-dim">
					<Icon className="size-5" />
					<span className=" font-[560]">Time to crack</span>
				</div>
				<span className=" font-[560] text-ink-dim">{strengthLabel}</span>
			</div>

			<p className="text-2xl font-[600] tracking-tight text-ink tabular-nums sm:text-3xl">
				{label}
			</p>

			<div className="flex gap-1.5" aria-hidden>
				{Array.from({ length: SEGMENTS }, (_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length list of positional, non-reorderable meter segments.
						key={i}
						className={cn(
							"h-2 flex-1 rounded-full transition-colors duration-300",
							i < score ? SEGMENT_COLOR[score] : "bg-purple-200",
						)}
					/>
				))}
			</div>

			<p className="text-ink-dim/70">
				≈ {entropyBits > 0 ? Math.round(entropyBits) : 0} bits of entropy ·
				Estimated against 10 billion guesses/sec
			</p>

			{entropyBits > 0 && (
				<div className="flex flex-col gap-0.5 text-sm text-ink-dim/60">
					{CRACK_DEVICES.map((device) => (
						<p key={device.name}>
							{humanTime(crackSeconds(entropyBits, device.guessesPerSecond))} to
							crack with {device.name}
						</p>
					))}
				</div>
			)}
		</div>
	);
}
