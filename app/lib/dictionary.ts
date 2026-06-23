/**
 * Local word dictionaries for passphrase generation.
 *
 * Both lists ship in the bundle but are code-split via dynamic `import()`,
 * so the (~80kb each) JSON only loads the first time a language is used.
 * Nothing is fetched at runtime — everything is local.
 */

export type Language = "en" | "sv";

export const LANGUAGES: { id: Language; label: string }[] = [
	{ id: "en", label: "English" },
	{ id: "sv", label: "Svenska" },
];

const cache = new Map<Language, string[]>();

export async function loadDictionary(lang: Language): Promise<string[]> {
	const cached = cache.get(lang);
	if (cached) return cached;

	const mod =
		lang === "sv"
			? await import("./dictionaries/sv.json")
			: await import("./dictionaries/en.json");
	const words = mod.default as string[];
	cache.set(lang, words);
	return words;
}
