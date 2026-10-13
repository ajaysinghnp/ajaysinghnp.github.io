"use client";

import { useState } from "react";

import { Check, FileDown, FileText, Link2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type PdfState = "idle" | "working" | "done" | "error";

interface Props {
  title: string;
  markdown: string;
  contentId: string; // id of the element holding the rendered article
  fallbackName: string; // PDF file name when the title has no usable characters
  className?: string;
}

const button =
  "inline-flex cursor-pointer items-center gap-2 rounded px-4 py-2 text-sm font-medium site-nav-active hover:bg-(--site-accent)/10 disabled:cursor-wait disabled:opacity-70";

const pdfLabels: Record<PdfState, string> = {
  idle: "Download as PDF",
  working: "Preparing PDF…",
  done: "Downloaded",
  error: "PDF failed",
};

function PdfIcon({ state }: { state: PdfState }) {
  if (state === "working") return <Loader2 className="h-4 w-4 animate-spin" />;
  if (state === "done") return <Check className="h-4 w-4" />;
  return <FileDown className="h-4 w-4" />;
}

export function PostActions({ title, markdown, contentId, fallbackName, className }: Props) {
  const [copied, setCopied] = useState<"link" | "markdown" | null>(null);
  const [pdf, setPdf] = useState<PdfState>("idle");

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

  async function downloadPdf() {
    if (pdf === "working") return;

    setPdf("working");
    let result: PdfState = "error";

    try {
      const source = document.getElementById(contentId);

      if (source) {
        // Loaded on demand so the PDF libraries don't ship with every post view.
        const { html2pdf } = await import("@/lib/html2pdf");
        const name = title.replace(/[^\w\s-]/g, "").trim() || fallbackName;

        if (await html2pdf(source, name)) result = "done";
      }
    } catch (error) {
      console.warn("Could not create the PDF.", error);
    }

    setPdf(result);
    setTimeout(() => setPdf("idle"), 2500);
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
      <button type="button" onClick={downloadPdf} disabled={pdf === "working"} className={button}>
        <PdfIcon state={pdf} />
        {pdfLabels[pdf]}
      </button>
    </div>
  );
}
