"use client";

import { Minus, Plus } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className=" font-[560] text-ink">{label}</span>
        {hint && <span className=" text-ink-dim/70">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center justify-between gap-3 rounded-3 border border-border px-4 py-3 text-left transition-colors cursor-pointer",
        "hover:border-brand/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border",
        checked ? "bg-brand/5 border-brand/40" : "bg-fill",
      )}
    >
      <span className=" font-[560] text-ink">{label}</span>
      <span
        className={cn(
          "relative h-8 w-14 shrink-0 rounded-3 transition-colors duration-200",
          checked ? "bg-brand" : "bg-purple-200",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 size-6 rounded-2 bg-fill shadow-sm transition-transform duration-200",
            checked && "translate-x-6",
          )}
        />
      </span>
    </button>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-1 rounded-3 border border-border bg-fill p-1 h-16",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: segmented control uses button + role="radio" within a role="radiogroup" by design.
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-2 px-3 h-full  font-[560] whitespace-nowrap transition-colors truncate cursor-pointer",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
              active
                ? "bg-brand text-brand-ink-flip"
                : "text-ink-dim hover:bg-fill-raised",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const stepBtn =
    "grid h-full w-full place-items-center rounded-2 text-ink transition-colors cursor-pointer hover:bg-fill-raised disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand";

  return (
    <div className="flex items-center gap-1 rounded-3 border border-border bg-fill p-1 h-16">
      <button
        type="button"
        className={stepBtn}
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Decrease"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-24 flex-1 text-center text-base font-[600] text-ink tabular-nums">
        {value}
      </span>
      <button
        type="button"
        className={stepBtn}
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Increase"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
