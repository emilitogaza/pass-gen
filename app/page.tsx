import { LockKeyhole } from "lucide-react";
import { Generator } from "@/components/generator";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-5 py-16 sm:py-24">
      <header className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-3 border border-border bg-fill-raised/60 px-4 py-2 font-[560] text-ink-dim">
          <LockKeyhole className="size-5" />
          Generated locally · Never leaves your device
        </span>
        <h1 className="text-4xl font-[600] tracking-tight text-ink sm:text-5xl">
          Password generator
        </h1>
        <p className="max-w-lg leading-relaxed text-ink-dim">
          Build a strong password you can actually remember — from a sentence or
          from random words — and see how long it would take to crack as you go.
        </p>
      </header>

      <Generator />

      <footer className="mt-auto pt-6 text-sm text-center text-ink-dim/60">
        Everything runs in your browser. No passwords are sent, stored, or
        logged anywhere.
      </footer>
    </main>
  );
}
