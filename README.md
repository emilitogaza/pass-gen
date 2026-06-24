# pass-gen

A small, **fully local** password generator. It helps you build strong memorable passwords, from a sentence or from random words.

Everything runs in your browser. There's no backend, no telemetry, and no storage,
so every byte stays on your machine. 

Randomness comes from the Web Crypto API (`crypto.getRandomValues`) with rejection sampling, so word and character stay perfectly uniform. Strength is scored live against an offline fast-hash attack, ~10 B guesses/sec.

There's also a [`/check`](app/check/page.tsx) page where you can paste any existing
password and see how long it would take to crack, also estimated on different
devices, for fun.

### What is entropy?

Entropy measures how unpredictable a password is, in **bits**. Each bit doubles the
number of guesses an attacker needs, so a 60-bit password takes twice as long to
crack as a 59-bit one. It's computed from the *generation space* (how many possible
passwords the chosen options could produce), not from the characters you happen to
end up with, which is what makes the crack-time estimate trustworthy.

A passphrase like `correct-horse-battery-staple` works because each word is drawn
uniformly from a large list. Four random words from a 7,776-word list is about 51
bits of entropy, all while staying far easier to remember than a random string of
the same strength.

## What you can do

The app has two generator modes:

- **First-letter mnemonic** — type a sentence and it's distilled into a password
  using the first letter of each word, while keeping digits and trailing
  punctuation. For example, `In 2015, I went to Paris and ate an amazing croissant!`
  becomes `I2015,IwtPaaaaac!`. Easy to recall, hard to guess.
- **Passphrase** — generates a string of memorable random words joined together.
  You can:
  - choose how many words to use and mix in your own words alongside random ones,
  - pick a separator,
  - apply capitalization (none / first / all / random),
  - apply leetspeak substitutions (`a → @`, `e → 3`, …),
  - append a random number group.

In both modes a **strength meter** shows the estimated entropy and an honest
**crack-time estimate** that updates live as you tweak options, plus one-click
copy.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19
- Tailwind CSS v4
- `motion/react` for animation
- All UI components are hand-built — no third-party component libraries
- [Biome](https://biomejs.dev) for formatting and linting

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | What it does                                             |
| ------------------- | ------------------------------------------------------- |
| `pnpm dev`          | Start the dev server                                    |
| `pnpm build`        | Production build                                        |
| `pnpm start`        | Run the production build                                |
| `pnpm lint`         | Run ESLint (Next.js rules)                              |
| `pnpm format`       | Format all files with Biome (writes changes)           |
| `pnpm format:check` | Check formatting without writing                       |
| `pnpm check`        | Biome linter + formatter + import checks (no writes)   |
| `pnpm format:all`   | Apply all safe **and unsafe** Biome fixes (writes)     |

> Note: `app/globals.css` and `*.svg` assets are excluded from Biome —
> the CSS uses Tailwind v4 directives Biome can't parse, and the SVGs are
> static icon assets.
