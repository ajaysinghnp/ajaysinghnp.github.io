"use client";

import { type RefObject } from "react";

import {
  Bold,
  Code,
  Eye,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  type LucideIcon,
  Pencil,
  Quote,
  Strikethrough,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface Edit {
  value: string;
  start: number;
  end: number;
}

function wrap(
  value: string,
  s: number,
  e: number,
  before: string,
  after: string,
  placeholder: string,
): Edit {
  const selected = value.slice(s, e) || placeholder;
  const next = value.slice(0, s) + before + selected + after + value.slice(e);
  return { value: next, start: s + before.length, end: s + before.length + selected.length };
}

function prefixLines(value: string, s: number, e: number, prefix: (index: number) => string): Edit {
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const newline = value.indexOf("\n", e);
  const lineEnd = newline === -1 ? value.length : newline;
  const block = value
    .slice(lineStart, lineEnd)
    .split("\n")
    .map((line, i) => prefix(i) + line)
    .join("\n");
  return {
    value: value.slice(0, lineStart) + block + value.slice(lineEnd),
    start: lineStart,
    end: lineStart + block.length,
  };
}

interface Action {
  id: string;
  label: string;
  icon: LucideIcon;
  run: (value: string, s: number, e: number) => Edit;
}

const ACTIONS: Action[] = [
  { id: "bold", label: "Bold", icon: Bold, run: (v, s, e) => wrap(v, s, e, "**", "**", "bold") },
  {
    id: "italic",
    label: "Italic",
    icon: Italic,
    run: (v, s, e) => wrap(v, s, e, "_", "_", "italic"),
  },
  {
    id: "strike",
    label: "Strikethrough",
    icon: Strikethrough,
    run: (v, s, e) => wrap(v, s, e, "~~", "~~", "text"),
  },
  {
    id: "code",
    label: "Inline code",
    icon: Code,
    run: (v, s, e) => wrap(v, s, e, "`", "`", "code"),
  },
  {
    id: "link",
    label: "Link",
    icon: LinkIcon,
    run: (v, s, e) => {
      const edit = wrap(v, s, e, "[", "](https://)", "link text");
      // Leave the URL placeholder selected so it can be typed over.
      const urlStart = edit.end + 2;
      return { ...edit, start: urlStart, end: urlStart + "https://".length };
    },
  },
  {
    id: "heading",
    label: "Heading",
    icon: Heading2,
    run: (v, s, e) => prefixLines(v, s, e, () => "## "),
  },
  { id: "quote", label: "Quote", icon: Quote, run: (v, s, e) => prefixLines(v, s, e, () => "> ") },
  {
    id: "ul",
    label: "Bulleted list",
    icon: List,
    run: (v, s, e) => prefixLines(v, s, e, () => "- "),
  },
  {
    id: "ol",
    label: "Numbered list",
    icon: ListOrdered,
    run: (v, s, e) => prefixLines(v, s, e, (i) => `${i + 1}. `),
  },
];

interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onValueChange: (value: string) => void;
  previewing: boolean;
  onPreviewingChange: (previewing: boolean) => void;
  disabled?: boolean;
}

export function MarkdownToolbar({
  textareaRef,
  value,
  onValueChange,
  previewing,
  onPreviewingChange,
  disabled,
}: MarkdownToolbarProps) {
  function apply(action: Action) {
    const ta = textareaRef.current;
    if (!ta) return;
    const edit = action.run(value, ta.selectionStart, ta.selectionEnd);
    onValueChange(edit.value);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(edit.start, edit.end);
    });
  }

  const tab = (active: boolean) =>
    cn(
      "inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed",
      active ? "bg-(--site-accent)/15 site-nav-active" : "resume-muted hover:text-(--site-text)",
    );

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-(--site-surface-border) bg-(--site-accent)/5 p-1"
    >
      <div className="flex flex-wrap items-center gap-0.5">
        {ACTIONS.map(({ id, label, icon: Icon, run }) => (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            disabled={disabled || previewing}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => apply({ id, label, icon: Icon, run })}
            className="light-btn-hover-bg inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm resume-muted transition-colors hover:text-(--site-text) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-0.5" role="group" aria-label="Editor mode">
        <button
          type="button"
          aria-pressed={!previewing}
          onClick={() => onPreviewingChange(false)}
          disabled={disabled}
          className={tab(!previewing)}
        >
          <Pencil className="h-3.5 w-3.5" /> Write
        </button>
        <button
          type="button"
          aria-pressed={previewing}
          onClick={() => onPreviewingChange(true)}
          disabled={disabled}
          className={tab(previewing)}
        >
          <Eye className="h-3.5 w-3.5" /> Preview
        </button>
      </div>
    </div>
  );
}
