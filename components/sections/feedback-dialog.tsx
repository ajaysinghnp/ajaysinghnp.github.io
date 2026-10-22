"use client";

import { type FormEvent, useEffect, useId, useRef, useState } from "react";

import {
  AlertCircle,
  AtSign,
  CheckCircle2,
  Info,
  Loader2,
  MessageSquareText,
  RotateCcw,
  Send,
  Trash2,
  User,
  X,
} from "lucide-react";

import { MarkdownPreview } from "@/components/ui/markdown-preview";
import { MarkdownToolbar } from "@/components/ui/markdown-toolbar";
import { isFieldValid, ValidatedField, type ValidationRule } from "@/components/ui/validated-field";

type Status = "idle" | "sending" | "sent" | "error";
type FieldName = "name" | "email" | "message";
type Values = Record<FieldName, string>;

const LIMITS = { name: 100, email: 200, message: 4000 } as const;
const EMPTY: Values = { name: "", email: "", message: "" };
const FIELD_ORDER: FieldName[] = ["name", "email", "message"];
export const FEEDBACK_OPEN_EVENT = "feedback:open";
const DRAFT_KEY = "feedback-draft:v1";
const DRAFT_PREF_KEY = "feedback-draft-pref:v1";

function readDraft(): Values | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    if (!parsed || typeof parsed !== "object") return null;
    const draft = { ...EMPTY };
    for (const f of FIELD_ORDER) {
      const v = (parsed as Record<string, unknown>)[f];
      if (typeof v === "string") draft[f] = v.slice(0, 10_000);
    }
    return FIELD_ORDER.some((f) => draft[f]) ? draft : null;
  } catch {
    return null;
  }
}

function storage(action: () => void) {
  try {
    action();
  } catch {
    // Storage can be unavailable (private mode, blocked); the form still works without it.
  }
}

const RULES: Record<FieldName, ValidationRule[]> = {
  name: [
    {
      id: "max",
      label: `At most ${LIMITS.name} characters`,
      test: (v) => v.trim().length <= LIMITS.name,
    },
  ],
  email: [
    { id: "no-space", label: "No spaces", test: (v) => !/\s/.test(v) },
    { id: "at", label: "Exactly one @ symbol", test: (v) => v.split("@").length === 2 },
    { id: "local", label: "Something before the @", test: (v) => /^[^\s@]+@/.test(v) },
    {
      id: "domain",
      label: "A domain after the @, like example.com",
      test: (v) => /@[^\s@]+\.[^\s@]+$/.test(v),
    },
    {
      id: "max",
      label: `At most ${LIMITS.email} characters`,
      test: (v) => v.trim().length <= LIMITS.email,
    },
  ],
  message: [
    { id: "min", label: "At least 3 characters", test: (v) => v.trim().length >= 3 },
    {
      id: "max",
      label: `At most ${LIMITS.message} characters`,
      test: (v) => v.trim().length <= LIMITS.message,
    },
  ],
};

const OPTIONAL: Record<FieldName, boolean> = { name: true, email: true, message: false };

const SERVER_ERRORS: Record<number, string> = {
  400: "Some details look off. Please review the form.",
  413: "That message is too large.",
  429: "Too many attempts. Please wait a few minutes and try again.",
};

export default function FeedbackDialog() {
  const uid = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [previewing, setPreviewing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [saveDraft, setSaveDraft] = useState(true);
  const [restored, setRestored] = useState(false);
  const hydrated = useRef(false);

  const busy = status === "sending";
  const hasContent = FIELD_ORDER.some((f) => values[f]);

  useEffect(() => {
    storage(() => {
      if (localStorage.getItem(DRAFT_PREF_KEY) === "off") {
        setSaveDraft(false);
        return;
      }
      const draft = readDraft();
      if (draft) {
        setValues(draft);
        setRestored(true);
      }
    });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const timer = setTimeout(() => {
      storage(() => {
        if (saveDraft && hasContent) localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
        else localStorage.removeItem(DRAFT_KEY);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [values, saveDraft, hasContent]);

  function toggleSaveDraft(enabled: boolean) {
    setSaveDraft(enabled);
    storage(() => {
      if (enabled) localStorage.removeItem(DRAFT_PREF_KEY);
      else localStorage.setItem(DRAFT_PREF_KEY, "off");
    });
  }

  function discardDraft() {
    setValues(EMPTY);
    setPreviewing(false);
    setSubmitted(false);
    setRestored(false);
    setFormKey((k) => k + 1);
    storage(() => localStorage.removeItem(DRAFT_KEY));
  }

  function reset() {
    discardDraft();
    setStatus("idle");
    setServerError("");
  }

  useEffect(() => {
    const show = () => {
      const dialog = dialogRef.current;
      // Another modal (e.g. search) is open: don't stack on top of it.
      if (!dialog || document.querySelector("dialog[open]")) return;
      setStatus((s) => (s === "error" ? "idle" : s));
      dialog.showModal();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "f" ||
        !(event.metaKey || event.ctrlKey) ||
        event.altKey ||
        event.shiftKey
      ) {
        return;
      }
      event.preventDefault();
      show();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(FEEDBACK_OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(FEEDBACK_OPEN_EVENT, show);
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const firstInvalid = FIELD_ORDER.find((f) => !isFieldValid(RULES[f], values[f], OPTIONAL[f]));
    if (firstInvalid) {
      if (firstInvalid === "message") setPreviewing(false);
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus(),
      );
      return;
    }

    setStatus("sending");
    setServerError("");
    try {
      const website = new FormData(event.currentTarget).get("website");
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website }),
      });
      if (!res.ok) {
        setServerError(SERVER_ERRORS[res.status] ?? "Something went wrong on my side.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      setValues(EMPTY);
      setPreviewing(false);
      setSubmitted(false);
      setRestored(false);
      storage(() => localStorage.removeItem(DRAFT_KEY));
    } catch {
      setServerError("Couldn't reach the server. Check your connection and retry.");
      setStatus("error");
    }
  }

  const field = (name: FieldName) => ({
    id: `${uid}-${name}`,
    name,
    value: values[name],
    onValueChange: (v: string) => setValues((prev) => ({ ...prev, [name]: v })),
    rules: RULES[name],
    optional: OPTIONAL[name],
    disabled: busy,
    showErrors: submitted,
  });

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${uid}-title`}
      onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
      className="global-search-dialog fixed top-1/2! left-1/2 m-0 max-h-[calc(100dvh-2rem)] w-[78vw] max-w-[94vw] min-w-[min(94vw,32rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl p-0 open:flex"
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-(--site-surface-border) bg-(--site-accent)/5 px-4 py-2.5">
        <span className="group flex gap-1.5">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close feedback form"
            className="flex h-3 w-3 cursor-pointer items-center justify-center rounded-full bg-rose-400/90"
          >
            <X className="h-2 w-2 text-rose-950 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
          <i className="h-3 w-3 rounded-full bg-amber-400/80" aria-hidden="true" />
          <i className="h-3 w-3 rounded-full bg-emerald-400/80" aria-hidden="true" />
        </span>
        <span className="flex-1 truncate text-center font-mono text-xs resume-muted">
          ~/feedback <span className="site-nav-active">--send</span>
        </span>
        <span className="w-12" aria-hidden="true" />
      </div>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        {status === "sent" ? (
          <div className="px-6 py-12 text-center" role="status">
            <span className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-500/25 motion-safe:animate-ping" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/60 bg-emerald-500/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </span>
            </span>
            <h2 id={`${uid}-title`} className="mt-6 text-3xl font-semibold tracking-tight">
              Thank you.
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 resume-muted">
              Your feedback is on its way to me. I read every note, even the blunt ones.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-(--site-surface-border) px-5 py-2.5 text-sm font-semibold hover:border-(--site-accent)"
              >
                <RotateCcw className="h-4 w-4" /> Send another
              </button>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="action-button shine-border inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-semibold shine-border-contrast"
              >
                <CheckCircle2 className="h-4 w-4" /> Done
              </button>
            </div>
          </div>
        ) : (
          <form
            key={formKey}
            ref={formRef}
            onSubmit={onSubmit}
            noValidate
            className="space-y-5 p-6"
          >
            <div>
              <h2
                id={`${uid}-title`}
                className="flex items-center gap-3 text-3xl font-semibold tracking-tight"
              >
                <MessageSquareText className="h-7 w-7 site-nav-active" aria-hidden="true" />
                What&apos;s on your mind?
              </h2>
              <p className="mt-2 text-sm leading-6 resume-muted">
                Ideas, bugs, or kind words. Markdown is supported. Add an email if you want a reply.
              </p>
            </div>

            <ValidatedField
              {...field("name")}
              label="name"
              icon={User}
              autoComplete="name"
              placeholder="Ada Lovelace"
            />
            <ValidatedField
              {...field("email")}
              label="email"
              icon={AtSign}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
            <ValidatedField
              {...field("message")}
              label="feedback"
              icon={MessageSquareText}
              multiline
              rows={8}
              counterMax={LIMITS.message}
              textareaRef={messageRef}
              toolbar={
                <MarkdownToolbar
                  textareaRef={messageRef}
                  value={values.message}
                  onValueChange={(v) => setValues((prev) => ({ ...prev, message: v }))}
                  previewing={previewing}
                  onPreviewingChange={setPreviewing}
                  disabled={busy}
                />
              }
              preview={previewing ? <MarkdownPreview source={values.message} /> : undefined}
              placeholder="Tell me what worked, what didn't, or what you'd love to see..."
            />

            {restored && (
              <p className="flex items-center gap-2 text-xs site-nav-active" role="status">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Restored your unsent draft
                from this device.
              </p>
            )}

            <div className="space-y-3 rounded-sm border border-(--site-surface-border) bg-(--site-accent)/5 p-3 text-xs leading-5 resume-muted">
              <p className="flex items-start gap-2">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 site-nav-active" aria-hidden="true" />
                <span>
                  <strong className="text-(--site-text)">Draft saving.</strong> While you type, your
                  entries are saved in this browser&apos;s local storage on this device only. They
                  are not sent anywhere until you press Send, and are deleted once you send or
                  discard them. Turn it off if this is a shared device.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 site-nav-active" aria-hidden="true" />
                <span>
                  <strong className="text-(--site-text)">When you send.</strong> Your feedback, plus
                  your name and email if given, is forwarded to me through a private automation
                  workflow (chat alert and email) and used only to read and reply. Please don&apos;t
                  include sensitive personal information.
                </span>
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-(--site-text)">
                  <input
                    type="checkbox"
                    checked={saveDraft}
                    onChange={(e) => toggleSaveDraft(e.target.checked)}
                    className="h-3.5 w-3.5 cursor-pointer accent-(--site-accent)"
                  />
                  Save draft on this device
                </label>
                {hasContent && (
                  <button
                    type="button"
                    onClick={discardDraft}
                    disabled={busy}
                    className="inline-flex cursor-pointer items-center gap-1.5 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Discard draft
                  </button>
                )}
              </div>
            </div>

            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-2499.75 h-0 w-0 opacity-0"
            />

            {status === "error" && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-sm border border-rose-500/50 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-500"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{serverError}</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="hidden font-mono text-xs resume-muted sm:block" aria-hidden="true">
                esc to close
              </p>
              <button
                type="submit"
                disabled={busy}
                aria-busy={busy}
                className="action-button shine-border ml-auto inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-semibold shine-border-contrast disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 motion-safe:animate-spin" /> Sending
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />{" "}
                    {status === "error" ? "Try again" : "Send feedback"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
