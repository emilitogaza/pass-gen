/**
 * Crack-time presentation helpers, shared across the app.
 *
 * Actual strength scoring is done by zxcvbn (see `strength.ts`); this module
 * turns an entropy figure into human-readable time, device comparisons, and a
 * 0–5 strength band. `charsetEntropy` remains as a cheap fallback used only
 * until the zxcvbn bundle has finished loading.
 */

/** Guesses per second assumed for an offline attack on a fast hash. */
const GUESSES_PER_SECOND = 1e10;

/**
 * Fun, illustrative reference attackers with wildly different horsepower.
 * Rates are rough order-of-magnitude guesstimates, not benchmarks.
 */
export const CRACK_DEVICES: { name: string; guessesPerSecond: number }[] = [
	{ name: "a smart refrigerator", guessesPerSecond: 2e3 },
	{ name: "an ESP32 microcontroller", guessesPerSecond: 4e4 },
	{ name: "an Android phone", guessesPerSecond: 8e6 },
];

/** Time (in seconds) to crack a given entropy at a given guess rate. */
export function crackSeconds(
	entropyBits: number,
	guessesPerSecond: number,
): number {
	if (entropyBits <= 0) return 0;
	return 2 ** entropyBits / 2 / guessesPerSecond;
}

export type Strength = "empty" | "weak" | "fair" | "good" | "strong" | "elite";

export interface CrackEstimate {
	entropyBits: number;
	/** Average guesses to crack (half the keyspace). */
	guesses: number;
	/** Average seconds to crack at `GUESSES_PER_SECOND`. */
	seconds: number;
	/** Human-readable time, e.g. "3 hours", "12 million years". */
	label: string;
	strength: Strength;
	strengthLabel: string;
	/** 0–5, for progress bars / colour. */
	score: number;
}

/** Estimate entropy of an arbitrary string from its character pool. */
export function charsetEntropy(password: string): number {
	if (!password) return 0;
	let pool = 0;
	if (/[a-z]/.test(password)) pool += 26;
	if (/[A-Z]/.test(password)) pool += 26;
	if (/[0-9]/.test(password)) pool += 10;
	if (/[^a-zA-Z0-9\s]/.test(password)) pool += 33;
	// Non-ASCII letters (å, ä, ö, …) — give them a modest dedicated pool.
	// biome-ignore lint/suspicious/noControlCharactersInRegex: the \x00-\x7F range intentionally matches the ASCII control block to detect any non-ASCII char.
	if (/[^\x00-\x7F]/.test(password)) pool += 40;
	if (/\s/.test(password)) pool += 1;
	if (pool === 0) return 0;
	return password.length * Math.log2(pool);
}

const STRENGTH_TABLE: {
	min: number;
	strength: Strength;
	label: string;
	score: number;
}[] = [
	{ min: 128, strength: "elite", label: "Excellent", score: 5 },
	{ min: 80, strength: "strong", label: "Strong", score: 4 },
	{ min: 60, strength: "good", label: "Good", score: 3 },
	{ min: 40, strength: "fair", label: "Fair", score: 2 },
	{ min: 0, strength: "weak", label: "Weak", score: 1 },
];

function classify(entropyBits: number) {
	// biome-ignore lint/style/noNonNullAssertion: the table has a min:0 row, so find() always matches for any non-negative entropy.
	return STRENGTH_TABLE.find((t) => entropyBits >= t.min)!;
}

/** Turn an entropy figure into a full crack-time estimate. */
export function crackEstimate(entropyBits: number): CrackEstimate {
	if (entropyBits <= 0) {
		return {
			entropyBits: 0,
			guesses: 0,
			seconds: 0,
			label: "—",
			strength: "empty",
			strengthLabel: "Empty",
			score: 0,
		};
	}

	// Average case: attacker finds it after searching half the keyspace.
	const guesses = 2 ** entropyBits / 2;
	const seconds = guesses / GUESSES_PER_SECOND;
	const { strength, label, score } = classify(entropyBits);

	return {
		entropyBits,
		guesses,
		seconds,
		label: humanTime(seconds),
		strength,
		strengthLabel: label,
		score,
	};
}

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const MONTH = 2_629_800; // 30.44 days
const YEAR = 31_557_600; // 365.25 days

const BIG_NAMES: { value: number; name: string }[] = [
	{ value: 1e33, name: "decillion" },
	{ value: 1e30, name: "nonillion" },
	{ value: 1e27, name: "octillion" },
	{ value: 1e24, name: "septillion" },
	{ value: 1e21, name: "sextillion" },
	{ value: 1e18, name: "quintillion" },
	{ value: 1e15, name: "quadrillion" },
	{ value: 1e12, name: "trillion" },
	{ value: 1e9, name: "billion" },
	{ value: 1e6, name: "million" },
	{ value: 1e3, name: "thousand" },
];

/** Format a duration in seconds into a friendly approximate label. */
export function humanTime(seconds: number): string {
	// Sub-millisecond is effectively no time at all.
	if (seconds < 0.001) return "instantly";
	// Below a second, show milliseconds (e.g. "3 ms", "120 ms").
	if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
	if (seconds < MINUTE) return plural(Math.round(seconds), "second");
	if (seconds < HOUR) return plural(Math.round(seconds / MINUTE), "minute");
	if (seconds < DAY) return plural(Math.round(seconds / HOUR), "hour");
	if (seconds < MONTH) return plural(Math.round(seconds / DAY), "day");
	if (seconds < YEAR) return plural(Math.round(seconds / MONTH), "month");

	const years = seconds / YEAR;
	if (years < 1000) return plural(Math.round(years), "year");

	for (const { value, name } of BIG_NAMES) {
		if (years >= value) {
			const n = years / value;
			const display = n >= 100 ? Math.round(n) : Number(n.toPrecision(2));
			return `${formatNumber(display)} ${name} years`;
		}
	}
	return "an eternity";
}

function plural(n: number, unit: string): string {
	return `${formatNumber(n)} ${unit}${n === 1 ? "" : "s"}`;
}

function formatNumber(n: number): string {
	return n.toLocaleString("en-US");
}
