# pass-gen

A small, **fully local** password generator. It helps you build a strong password
you can actually remember — from a sentence or from random words — and shows you
how long it would take to crack as you type.

Everything runs in your browser. No passwords are sent, stored, or logged
anywhere; randomness comes from the Web Crypto API (`crypto.getRandomValues`).

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

## Project layout

```
app/
  page.tsx              # Landing page
  components/
    generator.tsx       # Mode switcher (mnemonic / passphrase)
    mnemonic-panel.tsx
    passphrase-panel.tsx
    strength-meter.tsx
    password-output.tsx
    controls.tsx        # Reusable segmented controls, etc.
  lib/
    mnemonic.ts         # Sentence → first-letter password
    passphrase.ts       # Random word passphrase + transforms
    crack-time.ts       # Entropy + crack-time estimation
    dictionary.ts       # Word list for passphrases
```
