"use client";

import { useEffect, useState } from "react";
import { charsetEntropy, type CrackEstimate, crackEstimate } from "./crack-time";

type Scorer = (password: string) => CrackEstimate;

// Until the zxcvbn bundle has loaded, fall back to the cheap character-pool
// estimate so the meter still shows something on first paint.
const fallbackScorer: Scorer = (password) =>
  crackEstimate(charsetEntropy(password));

/**
 * Returns a strength-scoring function. zxcvbn (and its dictionaries) are
 * code-split and loaded lazily on mount; before they arrive the returned
 * scorer is the lightweight fallback, then it swaps to the real one.
 */
export function useStrength(): Scorer {
  const [scorer, setScorer] = useState<Scorer>(() => fallbackScorer);

  useEffect(() => {
    let active = true;
    import("./strength").then((m) => {
      if (active) setScorer(() => m.estimateStrength);
    });
    return () => {
      active = false;
    };
  }, []);

  return scorer;
}
