import {
  type GroupField,
  isFilled,
  type LinkField,
  type RichTextField,
} from "@prismicio/client";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns true if any section intro field has content.
 * Each field renders independently — no field depends on another being filled.
 * Works with any slice that has overline, title, description, and buttons fields.
 */
export function toAnchorId(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

export function hasSectionIntroContent(slice: {
  primary: {
    overline?: GroupField;
    title?: RichTextField;
    description?: RichTextField;
    buttons?: unknown;
  };
}) {
  const { overline, title, description, buttons } = slice.primary;

  const hasButtons = Array.isArray(buttons)
    ? buttons.some((button) => {
        if (
          typeof button === "object" &&
          button !== null &&
          "link" in (button as Record<string, unknown>)
        ) {
          const { link } = button as { link: LinkField };
          return isFilled.link(link);
        }
        return isFilled.link(button as LinkField);
      })
    : false;

  return (
    isFilled.group(overline) ||
    isFilled.richText(title) ||
    isFilled.richText(description) ||
    hasButtons
  );
}
