/**
 * Passphrase generation + transformation (fully local, no network).
 *
 * Randomness comes from `crypto.getRandomValues` via `secureInt`, which uses
 * rejection sampling to stay unbiased.
 *
 * The pieces are split so the UI can keep the random material (words, number,
 * transform seed) stable while the user tweaks deterministic settings and sees
 * the result update live:
 *   - `randomWords` / `randomDigits` / `randomTransformSeed` — random material
 *   - `composePassphrase` — pure given its inputs: merges user words with the
 *     random material, applies transforms, and reports HONEST structural entropy.
 *
 * Honesty note on transforms: a *deterministic* transform (always capitalise
 * the first letter, always swap every o→0) adds ≈0 real bits, because password
 * crackers apply those mangling rules to every candidate for free. Only
 * transforms that inject fresh randomness — "random" capitalisation and the
 * random swap — actually expand the keyspace, so only those move the estimate.
 */

export type Capitalization = "none" | "first" | "all" | "random";

export interface PassphraseOptions {
	wordCount: number;
	separator: string;
	capitalization: Capitalization;
	/** Randomly swap some letters for numbers/symbols (adds real entropy). */
	randomSwap: boolean;
	/** Deterministically swap every letter that maps to a number (o→0, a→4…). */
	swapNumbers: boolean;
	/** Deterministically swap every letter that maps to a symbol (a→@, s→$…). */
	swapSymbols: boolean;
	/** Append a random number group at the end. */
	appendNumber: boolean;
}

export interface PassphraseResult {
	passphrase: string;
	/** How many words came from the random material vs. the user. */
	randomCount: number;
	userCount: number;
}

/** letter → number substitutions. */
export const NUMBER_MAP: Record<string, string> = {
	a: "4",
	e: "3",
	i: "1",
	o: "0",
	s: "5",
	t: "7",
	b: "8",
	g: "9",
};

/** letter → symbol substitutions. */
export const SYMBOL_MAP: Record<string, string> = {
	a: "@",
	e: "&",
	i: "!",
	o: "*",
	s: "$",
	t: "+",
	c: "(",
	l: "|",
};

export const SEPARATORS: { value: string; label: string }[] = [
	{ value: "-", label: "Hyphen  -" },
	{ value: ".", label: "Dot  ." },
	{ value: "_", label: "Underscore  _" },
	{ value: " ", label: "Space" },
	{ value: "", label: "None" },
];

export const CAPITALIZATIONS: { value: Capitalization; label: string }[] = [
	{ value: "none", label: "none" },
	{ value: "first", label: "Each" },
	{ value: "all", label: "ALL" },
	{ value: "random", label: "RaNdOm" },
];

/** Unbiased random integer in [0, max) using the Web Crypto API. */
export function secureInt(max: number): number {
	if (max <= 0) return 0;
	const limit = Math.floor(0x100000000 / max) * max;
	const buf = new Uint32Array(1);
	let value: number;
	do {
		crypto.getRandomValues(buf);
		value = buf[0];
	} while (value >= limit);
	return value % max;
}

/** `n` random words drawn (with replacement) from the dictionary. */
export function randomWords(dictionary: string[], n: number): string[] {
	const out: string[] = [];
	for (let i = 0; i < n; i++) {
		out.push(
			dictionary.length ? dictionary[secureInt(dictionary.length)] : "word",
		);
	}
	return out;
}

/** A string of `n` random decimal digits. */
export function randomDigits(n: number): string {
	let out = "";
	for (let i = 0; i < n; i++) out += secureInt(10).toString();
	return out;
}

/**
 * Stable random values driving the per-character random transforms (random
 * capitalisation + random swap). Consumed one value per letter so the chosen
 * pattern stays fixed until the user reshuffles.
 */
export function randomTransformSeed(n = 256): number[] {
	return Array.from({ length: n }, () => secureInt(0x100000000));
}

/**
 * Build the final passphrase from user words + pre-generated random material.
 *
 * User words fill the leading slots; remaining slots come from `randomFill`
 * (kept stable by the caller). Transforms are applied per character.
 *
 * This only *builds the string* — strength is measured separately by scoring
 * that string (see `wordAwareEntropy`), so generated and hand-typed passwords
 * are judged by one and the same logic.
 *
 * Pure given its inputs: the random transforms read from `transformSeed`
 * rather than fresh randomness, so the result is stable and memoisable.
 */
export function composePassphrase(
	userWords: string[],
	randomFill: string[],
	numberSuffix: string,
	options: PassphraseOptions,
	transformSeed: number[] = [],
): PassphraseResult {
	const userClean = userWords
		.map((w) => w.trim().toLowerCase())
		.filter(Boolean);

	const words: string[] = [];
	for (let i = 0; i < options.wordCount; i++) {
		words.push(userClean[i] ?? randomFill[i] ?? "word");
	}

	const userCount = Math.min(userClean.length, options.wordCount);
	const randomCount = options.wordCount - userCount;

	let seedPos = 0;
	const nextSeed = () =>
		transformSeed.length ? transformSeed[seedPos++ % transformSeed.length] : 0;

	const transformWord = (word: string): string => {
		let out = "";
		let letterIndex = 0;
		for (const ch of word) {
			const lower = ch.toLowerCase();
			const isLetter = lower !== ch.toUpperCase();
			if (!isLetter) {
				out += ch;
				continue;
			}
			const isFirst = letterIndex === 0;
			letterIndex++;

			const deterministicCase =
				options.capitalization === "all" ||
				(options.capitalization === "first" && isFirst)
					? lower.toUpperCase()
					: lower;

			if (options.randomSwap) {
				// Randomly pick between the letter's case form(s) and any substitutes.
				const baseForms =
					options.capitalization === "random"
						? [lower, lower.toUpperCase()]
						: [deterministicCase];
				const subs: string[] = [];
				if (NUMBER_MAP[lower]) subs.push(NUMBER_MAP[lower]);
				if (SYMBOL_MAP[lower]) subs.push(SYMBOL_MAP[lower]);
				const choices = [...baseForms, ...subs];
				out += choices[nextSeed() % choices.length];
				continue;
			}

			let swapped: string | undefined;
			if (options.swapNumbers) swapped = NUMBER_MAP[lower];
			if (!swapped && options.swapSymbols) swapped = SYMBOL_MAP[lower];
			if (swapped) {
				out += swapped;
				continue;
			}

			if (options.capitalization === "random") {
				out += nextSeed() % 2 === 1 ? lower.toUpperCase() : lower;
			} else {
				out += deterministicCase;
			}
		}
		return out;
	};

	let parts = words.map(transformWord);
	if (options.appendNumber && numberSuffix) parts = [...parts, numberSuffix];

	return {
		passphrase: parts.join(options.separator),
		randomCount,
		userCount,
	};
}

/**
 * Apply the *deterministic* transforms (capitalisation + letter swaps) directly
 * to an arbitrary string. Used for the hand-edited output so toggling "swap all"
 * or capitalisation transforms the text the user typed, instead of throwing it
 * away and regenerating.
 *
 * Only the deterministic options are honoured here — random capitalisation and
 * the random swap belong to generation, not to a string you typed. The function
 * is idempotent, so it stays stable as the edited value flows back through it.
 */
export function applyTextTransforms(
	text: string,
	options: {
		capitalization: Capitalization;
		swapNumbers: boolean;
		swapSymbols: boolean;
	},
): string {
	let out = text;

	if (options.capitalization === "all") {
		out = out.toUpperCase();
	} else if (options.capitalization === "first") {
		out = out.replace(/\p{L}+/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1));
	}

	if (options.swapNumbers || options.swapSymbols) {
		out = [...out]
			.map((ch) => {
				const lower = ch.toLowerCase();
				if (options.swapNumbers && NUMBER_MAP[lower]) return NUMBER_MAP[lower];
				if (options.swapSymbols && SYMBOL_MAP[lower]) return SYMBOL_MAP[lower];
				return ch;
			})
			.join("");
	}

	return out;
}
