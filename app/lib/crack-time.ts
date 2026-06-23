/**
 * Lightweight, fully-local password strength estimation.
 *
 * Everything here is pure math on the password string / structure — nothing
 * ever leaves the browser. Two entropy sources are exposed:
 *
 *  - `charsetEntropy`  — naive character-pool estimate, used for the
 *    free-form mnemonic password.
 *  - the passphrase module supplies its own structural entropy (word count ×
 *    log2(dictionary size) + bonuses) and feeds it to `crackEstimate`.
 *  - `wordAwareEntropy` — dictionary-aware estimate for a hand-edited
 *    passphrase, so manual tweaks update the crack time honestly.
 */

import { NUMBER_MAP, SYMBOL_MAP } from "./passphrase";

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

// Reverse leet: a substituted char → the letter it stands in for.
const REVERSE_LEET: Record<string, string> = (() => {
	const r: Record<string, string> = {};
	for (const [letter, sub] of Object.entries(NUMBER_MAP)) r[sub] = letter;
	for (const [letter, sub] of Object.entries(SYMBOL_MAP)) r[sub] = letter;
	return r;
})();

/**
 * Word-aware entropy for a passphrase-shaped string. Used once the user has
 * hand-edited the generated password, where the structural figure no longer
 * applies. Tokens are split on the usual word separators (so leet symbols stay
 * *inside* words), each token is "un-leeted" back to letters and checked
 * against the dictionary:
 *   - a recognised word costs log2(dictionary size), plus ~1 bit per position
 *     the attacker must still guess (an uppercase letter or a substitution) —
 *     i.e. the size of the mangling-rule space around that word.
 *   - a pure digit run costs log2(10) per digit.
 *   - anything unrecognised falls back to the character-pool estimate.
 */
export function wordAwareEntropy(
	password: string,
	dictionary: Set<string>,
	dictSize: number,
): number {
	if (!password) return 0;
	const perWord = dictSize > 1 ? Math.log2(dictSize) : 0;
	let bits = 0;

	for (const token of password.split(/[-._\s]+/)) {
		if (!token) continue;
		if (/^[0-9]+$/.test(token)) {
			bits += token.length * Math.log2(10);
			continue;
		}

		const base = [...token]
			.map((c) => REVERSE_LEET[c] ?? c)
			.join("")
			.toLowerCase()
			.replace(/[^a-zåäö]/g, "");

		if (base && dictionary.has(base)) {
			let varied = 0;
			for (const c of token) {
				if (/[A-ZÅÄÖ]/.test(c))
					varied++; // an uppercase letter to place
				else if (REVERSE_LEET[c] && !/[a-zåäö]/i.test(c)) varied++; // a substitution
			}
			bits += perWord + varied;
		} else {
			bits += charsetEntropy(token);
		}
	}

	return bits;
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
