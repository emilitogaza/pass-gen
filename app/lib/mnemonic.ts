/**
 * First-letter mnemonic conversion (fully local, no network).
 *
 * Each whitespace-separated token contributes:
 *   - its leading run of digits, OR its first letter (case preserved), and
 *   - any trailing punctuation attached to it.
 *
 * Example:
 *   "In 2015, I went to Paris and ate an amazing croissant!"
 *   → "I2015,IwtPaaaaac!"
 */
export function mnemonicToPassword(phrase: string): string {
	const tokens = phrase.trim().split(/\s+/).filter(Boolean);
	return tokens.map(tokenToChars).join("");
}

function tokenToChars(token: string): string {
	// Trailing punctuation (anything that isn't a letter or number).
	const trailingMatch = token.match(/[^\p{L}\p{N}]+$/u);
	const trailing = trailingMatch ? trailingMatch[0] : "";
	const core = trailing
		? token.slice(0, token.length - trailing.length)
		: token;

	const digits = core.match(/^\p{N}+/u);
	if (digits) return digits[0] + trailing;

	const letter = core.match(/\p{L}/u);
	return (letter ? letter[0] : "") + trailing;
}
