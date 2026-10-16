"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

type Status = "idle" | "copied" | "failed";

const FEEDBACK_MS = 1800;

// What the floating badge shows for each non-idle state.
const FEEDBACK = {
  copied: { label: "Copied", Icon: Check, tone: "border-(--site-accent) text-(--site-text)" },
  failed: { label: "Copy failed", Icon: X, tone: "border-red-500/60 text-red-500" },
} as const;

// Read out by screen readers; the visible badge is decorative.
const ANNOUNCEMENTS: Record<Status, string> = {
  idle: "",
  copied: "Copied to clipboard",
  failed: "Copy failed",
};

const badgeBase =
  "pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 inline-flex -translate-x-1/2 items-center gap-1 rounded border bg-[color-mix(in_srgb,var(--site-panel)_88%,var(--site-bg))] px-2 py-1 text-xs leading-none font-medium whitespace-nowrap shadow-md";

interface InlineCodeCopyProps {
  children: ReactNode;
  text: string;
}

export function InlineCodeCopy({ children, text }: InlineCodeCopyProps) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    let result: Status = "failed";

    try {
      await navigator.clipboard.writeText(text);
      result = "copied";
    } catch (error) {
      // Also covers pages served without a secure context, where the clipboard API is missing.
      console.warn("Could not copy to the clipboard.", error);
    }

    clearTimeout(timer.current);
    setStatus(result);
    timer.current = setTimeout(() => setStatus("idle"), FEEDBACK_MS);
  };

  const feedback = status === "idle" ? null : FEEDBACK[status];

  return (
    <>
      <button
        type="button"
        className="inline-code-copy relative"
        aria-label={`Copy ${text}`}
        title="Click to copy"
        onClick={copy}
      >
        {children}
        {feedback && (
          <span aria-hidden="true" className={cn(badgeBase, feedback.tone)}>
            <feedback.Icon className="h-3.5 w-3.5" />
            {feedback.label}
          </span>
        )}
      </button>
      <span role="status" className="sr-only">
        {ANNOUNCEMENTS[status]}
      </span>
    </>
  );
}
