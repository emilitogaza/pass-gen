/**
 * Password strength scoring via zxcvbn — the single source of truth for how
 * strong a password is, used by the generator, the mnemonic tool, and the
 * checker alike.
 *
 * zxcvbn models a realistic attacker: it recognises common words, names, and
 * breached passwords, and unpicks leetspeak, capitalisation, sequences,
 * repeats and keyboard patterns. We extend its English/common dictionaries
 * with a frequency-ranked Swedish list so Swedish words are scored too.
 *
 * This module statically imports zxcvbn and its (sizeable) dictionaries, so it
 * is only ever pulled in via dynamic `import()` (see `use-strength.ts`) to keep
 * it out of the initial bundle. Everything still runs locally in the browser.
 */

import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as zxcvbnCommon from "@zxcvbn-ts/language-common";
import * as zxcvbnEn from "@zxcvbn-ts/language-en";
import { type CrackEstimate, crackEstimate } from "./crack-time";
import swedish from "./dictionaries/sv-frequency.json";

let factory: ZxcvbnFactory | null = null;

function getFactory(): ZxcvbnFactory {
  if (!factory) {
    factory = new ZxcvbnFactory({
      dictionary: {
        ...zxcvbnCommon.dictionary,
        ...zxcvbnEn.dictionary,
        swedish: swedish as string[],
      },
      graphs: zxcvbnCommon.adjacencyGraphs,
      translations: zxcvbnEn.translations,
    });
  }
  return factory;
}

/** Score any password with zxcvbn and express it on our crack-time scale. */
export function estimateStrength(password: string): CrackEstimate {
  if (!password) return crackEstimate(0);
  const { guesses } = getFactory().check(password);
  // Convert zxcvbn's guess count into an entropy figure so the rest of the UI
  // (time, device comparisons, strength band) can stay unchanged.
  const entropyBits = guesses > 1 ? Math.log2(guesses) : 0;
  return crackEstimate(entropyBits);
}
