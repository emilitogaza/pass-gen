"use client";

import { Info, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/button";
import {
  Field,
  SegmentedControl,
  Stepper,
  Toggle,
} from "@/components/controls";
import { Input } from "@/components/input";
import { PasswordOutput } from "@/components/password-output";
import { StrengthMeter } from "@/components/strength-meter";
import { crackEstimate, wordAwareEntropy } from "@/lib/crack-time";
import { LANGUAGES, type Language, loadDictionary } from "@/lib/dictionary";
import {
  CAPITALIZATIONS,
  type Capitalization,
  composePassphrase,
  randomDigits,
  randomTransformSeed,
  randomWords,
  SEPARATORS,
} from "@/lib/passphrase";

const MAX_WORDS = 10;

export function PassphrasePanel() {
  // Settings
  const [language, setLanguage] = useState<Language>("en");
  const [wordCount, setWordCount] = useState(4);
  const [userWords, setUserWords] = useState<string[]>(["", "", ""]);
  const [separator, setSeparator] = useState("-");
  const [capitalization, setCapitalization] = useState<Capitalization>("first");
  const [randomSwap, setRandomSwap] = useState(false);
  const [swapNumbers, setSwapNumbers] = useState(false);
  const [swapSymbols, setSwapSymbols] = useState(false);
  const [appendNumber, setAppendNumber] = useState(false);
  const [numberLength, setNumberLength] = useState(2);

  // Random material (kept stable across deterministic edits).
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [randomFill, setRandomFill] = useState<string[]>([]);
  const [numberSuffix, setNumberSuffix] = useState(() => randomDigits(2));
  const [transformSeed, setTransformSeed] = useState<number[]>([]);

  // Load the chosen dictionary locally (code-split, cached). This is the one
  // genuine external sync; the random material below is derived during render.
  useEffect(() => {
    let active = true;
    loadDictionary(language).then((words) => {
      if (active) setDictionary(words);
    });
    return () => {
      active = false;
    };
  }, [language]);

  // Reshuffle the random words whenever the dictionary or word count changes —
  // done during render via a key rather than in an effect, so it's applied
  // before paint without a cascading re-render.
  const wordsKey = `${dictionary.length}:${wordCount}`;
  const [prevWordsKey, setPrevWordsKey] = useState(wordsKey);
  if (wordsKey !== prevWordsKey) {
    setPrevWordsKey(wordsKey);
    if (dictionary.length) {
      setRandomFill(randomWords(dictionary, wordCount));
      setTransformSeed(randomTransformSeed());
    }
  }

  // Regenerate the number suffix when its length changes (same pattern).
  const [prevNumberLength, setPrevNumberLength] = useState(numberLength);
  if (numberLength !== prevNumberLength) {
    setPrevNumberLength(numberLength);
    setNumberSuffix(randomDigits(numberLength));
  }

  const reshuffle = useCallback(() => {
    if (dictionary.length) setRandomFill(randomWords(dictionary, wordCount));
    setNumberSuffix(randomDigits(numberLength));
    setTransformSeed(randomTransformSeed());
  }, [dictionary, wordCount, numberLength]);

  const result = useMemo(
    () =>
      composePassphrase(
        userWords,
        randomFill,
        numberSuffix,
        {
          wordCount,
          separator,
          capitalization,
          randomSwap,
          swapNumbers,
          swapSymbols,
          appendNumber,
        },
        dictionary.length,
        transformSeed,
      ),
    [
      userWords,
      randomFill,
      numberSuffix,
      wordCount,
      separator,
      capitalization,
      randomSwap,
      swapNumbers,
      swapSymbols,
      appendNumber,
      dictionary.length,
      transformSeed,
    ],
  );

  // The output is editable: `manualEdit` overrides the generated value until
  // anything regenerates it (a setting change, new words, or reshuffle).
  const [manualEdit, setManualEdit] = useState<string | null>(null);
  const [prevGenerated, setPrevGenerated] = useState(result.passphrase);
  if (result.passphrase !== prevGenerated) {
    setPrevGenerated(result.passphrase);
    setManualEdit(null);
  }
  const displayed = manualEdit ?? result.passphrase;

  // Strength source: while untouched, use the exact structural entropy (so the
  // settings — incl. deterministic swaps adding 0 — stay honest). Once the user
  // hand-edits, score the actual string with the dictionary-aware estimator so
  // their tweaks update the crack time live.
  const dictionarySet = useMemo(() => new Set(dictionary), [dictionary]);
  const entropyBits =
    manualEdit === null
      ? result.entropyBits
      : wordAwareEntropy(displayed, dictionarySet, dictionary.length);
  const estimate = crackEstimate(entropyBits);

  // Keep user words and the requested total consistent.
  function updateWord(index: number, value: string) {
    const next = userWords.map((w, i) => (i === index ? value : w));
    setUserWords(next);
    const filled = next.filter((w) => w.trim()).length;
    if (filled > wordCount) setWordCount(Math.min(MAX_WORDS, filled));
  }

  function addWordInput() {
    if (userWords.length < MAX_WORDS) setUserWords([...userWords, ""]);
  }

  function removeWordInput(index: number) {
    if (userWords.length <= 1) return;
    setUserWords(userWords.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-6">
      <PasswordOutput
        value={displayed}
        placeholder="velvet-teacup-galaxy-window"
        editable
        onChange={setManualEdit}
      />
      <StrengthMeter estimate={estimate} />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={reshuffle}
          icon={<RefreshCw />}
          className="flex-1"
        >
          Regenerate
        </Button>
        <SegmentedControl<Language>
          value={language}
          options={LANGUAGES.map((l) => ({ value: l.id, label: l.label }))}
          onChange={setLanguage}
          ariaLabel="Dictionary language"
        />
      </div>

      <Field
        label="Your words"
        hint={`${result.randomCount} random of ${wordCount}`}
      >
        <div className="flex flex-col gap-2">
          {userWords.map((word, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional word slots addressed by index (updateWord(i)); list is not reordered.
            <div key={i} className="flex items-center gap-2">
              <Input
                value={word}
                onChange={(e) => updateWord(i, e.target.value)}
                placeholder="Leave blank for a random word"
                spellCheck={false}
                autoComplete="off"
              />
              {/* The first input is never removable, so it always stays. */}
              {userWords.length > 1 &&
                (i > 0 ? (
                  <button
                    type="button"
                    onClick={() => removeWordInput(i)}
                    aria-label="Remove word"
                    className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-2 text-ink-dim transition-colors hover:bg-fill-raised hover:text-ink"
                  >
                    <X className="size-4" />
                  </button>
                ) : (
                  <div className="size-10 shrink-0" aria-hidden />
                ))}
            </div>
          ))}
          <button
            type="button"
            onClick={addWordInput}
            disabled={userWords.length >= MAX_WORDS}
            className="self-start font-[560] text-brand hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Add a word
          </button>
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Total words">
          <Stepper
            value={wordCount}
            min={1}
            max={MAX_WORDS}
            onChange={setWordCount}
          />
        </Field>

        <Field label="Capitalize">
          <SegmentedControl<Capitalization>
            value={capitalization}
            options={CAPITALIZATIONS}
            onChange={setCapitalization}
            ariaLabel="Capitalization"
          />
        </Field>

        <Field label="Separator" className="sm:col-span-2">
          <SegmentedControl
            value={separator}
            options={SEPARATORS}
            onChange={setSeparator}
            ariaLabel="Separator"
          />
        </Field>
      </div>

      <Field label="Swap letters" hint="only random swaps add strength">
        <div className="flex flex-col gap-2">
          <Toggle
            checked={randomSwap}
            onChange={setRandomSwap}
            label="Random (numbers & symbols) — adds crack time"
          />
          <Toggle
            checked={swapNumbers}
            onChange={setSwapNumbers}
            disabled={randomSwap}
            label="Swap all → numbers (o→0, a→4…)"
          />
          <Toggle
            checked={swapSymbols}
            onChange={setSwapSymbols}
            disabled={randomSwap}
            label="Swap all → symbols (a→@, s→$…)"
          />
        </div>
      </Field>

      <div className="flex flex-col gap-2">
        <Toggle
          checked={appendNumber}
          onChange={setAppendNumber}
          label="Add numbers at the end"
        />
        {appendNumber && (
          <div className="flex flex-col w-full gap-2 pl-1">
            <span className=" text-ink-dim w-full">How many digits</span>
            <Stepper
              value={numberLength}
              min={1}
              max={6}
              onChange={setNumberLength}
            />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="space-x-1 flex items-center">
          <Info className="size-5" />
          <p className="text-lg">How it works</p>
        </div>
        <p className="leading-relaxed text-ink-dim/70">
          Words are picked locally with your browser&apos;s crypto-strength
          randomness from a {dictionary.length.toLocaleString("en-US")}-word{" "}
          {language === "sv" ? "Swedish" : "English"} dictionary. Leave inputs
          blank to fill with random words. Only <strong>RaNdOm</strong> caps and
          the <strong>random swap</strong> add real crack time — the &ldquo;swap
          all&rdquo; toggles are predictable, so crackers expect them and they
          don&apos;t. The password is editable — type your own changes and the
          crack time updates to match.
        </p>
      </div>
    </div>
  );
}
