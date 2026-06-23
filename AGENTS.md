<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:component-rules -->

# No third-party UI component libraries

All UI components are built from scratch using React and Tailwind.

**Never install or import from:**

- `@radix-ui/*` (Radix UI primitives)
- `shadcn/ui` (component registry)
- `class-variance-authority` / `cva`
- `@headlessui/*`, `@ark-ui/*`, or any other component primitive library

- Use `lib/utils.ts` `cn()` for class merging and variant maps (plain objects)
- Use `lib/slot.tsx` for the `asChild` render pattern

**`motion/react` is allowed, with constraints:**

- Use the `m` component (not `motion`) — it requires `LazyMotion` to be in scope, cutting the bundle from ~34kb to ~4.6kb initial
- `LazyMotion` with `domAnimation` is mounted once globally in `app/layout.tsx` via `components/motion-provider.tsx` — do not add it anywhere else
- Only reach for `motion/react` where CSS genuinely cannot do the job: exit animations (`AnimatePresence`), orchestrated multi-element sequences, or physics/gesture-driven values
- Do not use `m` for things CSS handles fine: fade-ins, slide-ins, hover scale, simple scroll reveals
<!-- END:component-rules -->

<!-- BEGIN:naming-rules -->

# Naming Conventions

## CMS (Prismic model labels)

- Field labels use **Title Case**: `First Name`, `Section Theme`, `Remove Top Padding`
- Boolean placeholder text describes the state, not the action: `placeholder_false: "Text is Left-Aligned"`, `placeholder_true: "Text is Centered"`
- Group field labels are nouns, not instructions: `Buttons`, not `Add Buttons`
- Slice names in Slice Machine use **PascalCase**: `HeroBackdrop`, `FAQList`, `StatsSplit`
- Slice API IDs (used in `slice_type`) are **snake_case**: `hero_backdrop`, `faqlist`, `stats_split`

## Components & files

- React component files use **kebab-case**: `hero-backdrop.tsx`, `section-intro.tsx`
- Component exports use **PascalCase**: `export function HeroBackdrop`, `export function SectionIntro`
- Slice folders use **PascalCase** matching the Slice Machine name: `slices/HeroBackdrop/`, `slices/FAQList/`

## Slices registry

- Every new slice must be registered in `slices/index.ts` using its `slice_type` as the key
- Keys are always **snake_case** matching the Prismic API ID exactly: `faqlist`, `hero_backdrop`

## Mocks & placeholder content

- Mock data must use **English**, generic, template-appropriate copy — never project-specific or language-specific remnants
- Placeholder text in model fields describes what goes in the field: `"How do I get started?"`, not lorem ipsum or leftover client copy

## Middlware & Proxy
- There is no middleware file in next16
- Do not use Middleware
- The correct file is Proxy.ts, it has replaced Middleware entierly
<!-- END:naming-rules -->
