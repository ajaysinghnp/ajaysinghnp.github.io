"use client";

import { useState, type ReactNode } from "react";

interface InlineCodeCopyProps {
  children: ReactNode;
  text: string;
}

export function InlineCodeCopy({ children, text }: InlineCodeCopyProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      className="inline-code-copy"
      aria-label={copied ? "Code copied" : `Copy ${text}`}
      title={copied ? "Copied!" : "Click to copy"}
      onClick={copy}
    >
      {children}
    </button>
  );
}
