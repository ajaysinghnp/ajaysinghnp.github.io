"use client";

import { useState } from "react";

import { CopyCheck, CopyIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonClasses =
  "shine-border-hover flex cursor-pointer items-center rounded text-xs font-medium";

export interface CopyButtonProps {
  text: string | (() => string);
  className?: string;
  /** Button text and accessible name; defaults to "Copy". */
  label?: string;
  /** Skip the absolute top-right positioning so a parent can lay the button out. */
  inline?: boolean;
}

export function CopyButton({ text, className, label = "Copy", inline = false }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    const value = typeof text === "function" ? text() : text;
    await navigator.clipboard.writeText(value);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2500);
  };

  return (
    <button
      type="button"
      disabled={isCopied}
      onClick={copy}
      aria-label={isCopied ? "Copied to clipboard" : label}
      className={cn(
        buttonClasses,
        className,
        "code-copy-button z-10 gap-1.5 px-2 py-1",
        !inline && "absolute top-2 right-2",
      )}
    >
      {isCopied ? <CopyCheck size={16} /> : <CopyIcon size={16} />}
      <span>{isCopied ? "Copied!" : label}</span>
    </button>
  );
}
