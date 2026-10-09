"use client";

import { useState } from "react";

import { Check, FileText, Link2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  title: string;
  markdown: string;
  className?: string;
}

const button =
  "inline-flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-sm font-medium site-nav-active hover:bg-(--site-accent)/10";

export function PostActions({ title, markdown, className }: Props) {
  const [copied, setCopied] = useState<"link" | "markdown" | null>(null);

  async function copy(kind: "link" | "markdown") {
    try {
      await navigator.clipboard.writeText(
        kind === "link" ? window.location.href : `# ${title}\n\n${markdown}`,
      );
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.warn("Could not copy to the clipboard.", error);
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      <button type="button" onClick={() => copy("link")} className={button}>
        {copied === "link" ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied === "link" ? "Copied" : "Copy link"}
      </button>
      <button type="button" onClick={() => copy("markdown")} className={button}>
        {copied === "markdown" ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
        {copied === "markdown" ? "Copied" : "Copy as Markdown"}
      </button>
    </div>
  );
}
