"use client";

import { type FormEvent, useId, useRef, useState } from "react";

import {
  AlertCircle,
  AtSign,
  CheckCircle2,
  Loader2,
  MessageSquare,
  MessageSquareText,
  RotateCcw,
  Send,
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

  const busy = status === "sending";

  function reset() {
    setValues(EMPTY);
    setPreviewing(false);
    setSubmitted(false);
    setStatus("idle");
    setServerError("");
  }

  function open() {
    if (status === "error") setStatus("idle");
    dialogRef.current?.showModal();
  }

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
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="sparkle inline-flex cursor-pointer items-center gap-2 rounded-sm border border-(--site-accent) bg-(--site-accent)/10 px-6 py-3 text-sm font-semibold site-nav-active hover:border-cyan-300"
      >
        <MessageSquare className="h-4 w-4" /> Share feedback
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${uid}-title`}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
        className="global-search-dialog fixed top-1/2! left-1/2 m-0 max-h-[calc(100dvh-2rem)] w-[min(94vw,44rem)] -translate-x-1/2 -translate-y-1/2 overflow-x-hidden overflow-y-auto rounded-xl p-0"
      >
        <div className="flex items-center gap-3 border-b border-(--site-surface-border) bg-(--site-accent)/5 px-4 py-2.5">
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
          <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5 p-6">
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
      </dialog>
    </>
  );
}
