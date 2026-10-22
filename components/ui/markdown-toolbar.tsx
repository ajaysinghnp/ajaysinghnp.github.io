"use client";

import { type RefObject } from "react";

import {
  Bold,
  Code,
  Eye,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  type LucideIcon,
  Pencil,
  Pilcrow,
  Quote,
  Strikethrough,
  Table,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface Edit {
  value: string;
  start: number;
  end: number;
}

const BLOCK_PREFIX = /^(#{1,6}\s+|>\s?|[-*+]\s+|\d+\.\s+)/;
const URL_PLACEHOLDER = "https://";

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

/** Wraps text as `[text](url)` or `![alt](url)` and leaves the URL selected for typing over. */
function wrapLink(value: string, s: number, e: number, opener: string, placeholder: string): Edit {
  const edit = wrap(value, s, e, opener, `](${URL_PLACEHOLDER})`, placeholder);
  const urlStart = edit.end + 2;
  return { ...edit, start: urlStart, end: urlStart + URL_PLACEHOLDER.length };
}

function prefixLines(
  value: string,
  s: number,
  e: number,
  prefix: (index: number) => string,
  stripExisting = false,
): Edit {
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const newline = value.indexOf("\n", e);
  const lineEnd = newline === -1 ? value.length : newline;
  const block = value
    .slice(lineStart, lineEnd)
    .split("\n")
    .map((line, i) => prefix(i) + (stripExisting ? line.replace(BLOCK_PREFIX, "") : line))
    .join("\n");
  return {
    value: value.slice(0, lineStart) + block + value.slice(lineEnd),
    start: lineStart,
    end: lineStart + block.length,
  };
}

/** Inserts a standalone block padded with blank lines, selecting `selectText` inside it. */
function insertBlock(value: string, s: number, e: number, text: string, selectText: string): Edit {
  const before = value.slice(0, s);
  const after = value.slice(e);
  const endNewlines = /\n*$/.exec(before)?.[0].length ?? 0;
  const startNewlines = /^\n*/.exec(after)?.[0].length ?? 0;
  const lead = before ? "\n".repeat(Math.max(0, 2 - endNewlines)) : "";
  const trail = after ? "\n".repeat(Math.max(0, 2 - startNewlines)) : "";
  const start = s + lead.length + text.indexOf(selectText);
  return { value: before + lead + text + trail + after, start, end: start + selectText.length };
}

const TABLE_TEMPLATE = "| Column 1 | Column 2 |\n| --- | --- |\n| Cell | Cell |";

interface Action {
  id: string;
  label: string;
  icon: LucideIcon;
  run: (value: string, s: number, e: number) => Edit;
}

const GROUPS: Action[][] = [
  [
    {
      id: "p",
      label: "Normal text",
      icon: Pilcrow,
      run: (v, s, e) => prefixLines(v, s, e, () => "", true),
    },
    {
      id: "h1",
      label: "Heading 1",
      icon: Heading1,
      run: (v, s, e) => prefixLines(v, s, e, () => "# ", true),
    },
    {
      id: "h2",
      label: "Heading 2",
      icon: Heading2,
      run: (v, s, e) => prefixLines(v, s, e, () => "## ", true),
    },
  ],
  [
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
  ],
  [
    {
      id: "link",
      label: "Link",
      icon: LinkIcon,
      run: (v, s, e) => wrapLink(v, s, e, "[", "link text"),
    },
    {
      id: "image",
      label: "Image",
      icon: ImageIcon,
      run: (v, s, e) => wrapLink(v, s, e, "![", "alt text"),
    },
  ],
  [
    {
      id: "quote",
      label: "Quote",
      icon: Quote,
      run: (v, s, e) => prefixLines(v, s, e, () => "> "),
    },
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
    {
      id: "table",
      label: "Table",
      icon: Table,
      run: (v, s, e) => insertBlock(v, s, e, TABLE_TEMPLATE, "Column 1"),
    },
  ],
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
        {GROUPS.map((group, index) => (
          <div key={group[0].id} className="flex items-center gap-0.5">
            {index > 0 && (
              <span className="mx-1 h-4 w-px bg-(--site-surface-border)" aria-hidden="true" />
            )}
            {group.map((action) => (
              <button
                key={action.id}
                type="button"
                title={action.label}
                aria-label={action.label}
                disabled={disabled || previewing}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => apply(action)}
                className="light-btn-hover-bg inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm resume-muted transition-colors hover:text-(--site-text) disabled:cursor-not-allowed disabled:opacity-40"
              >
                <action.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
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
