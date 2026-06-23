"use client";

import { domAnimation, LazyMotion } from "motion/react";

/**
 * Wraps children with LazyMotion using the `domAnimation` feature bundle.
 * This covers animations, variants, and exit animations at ~15kb instead of
 * the full ~34kb `motion` component. Use the `m` component (not `motion`)
 * inside any subtree wrapped by this provider.
 *
 * Place this as high in the tree as needed — typically in app/layout.tsx —
 * so all child components share a single feature bundle load.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
