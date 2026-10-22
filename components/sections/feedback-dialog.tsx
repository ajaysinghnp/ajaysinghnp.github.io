"use client";

import { type FormEvent, type ReactNode, useId, useRef, useState } from "react";

import { AlertCircle, CheckCircle2, Loader2, MessageSquare, Send, X } from "lucide-react";

import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";
type FieldName = "name" | "email" | "message";
type Values = Record<FieldName, string>;

const LIMITS = { name: 100, email: 200, message: 4000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY: Values = { name: "", email: "", message: "" };
const FIELD_ORDER: FieldName[] = ["name", "email", "message"];

function validate(field: FieldName, raw: string): string | null {
  const value = raw.trim();
  if (field === "name") return value.length > LIMITS.name ? "Keep it under 100 characters." : null;
  if (field === "email") {
    if (!value) return null;
    if (value.length > LIMITS.email) return "That email is too long.";
    return EMAIL_RE.test(value) ? null : "Enter a valid email, like you@example.com.";
  }
  if (value.length < 3) return "Say a little more, at least 3 characters.";
  if (value.length > LIMITS.message) return "Too long, trim it to 4000 characters.";
  return null;
}

const SERVER_ERRORS: Record<number, string> = {
  400: "Some details look off. Please review the form.",
  413: "That message is too large.",
  429: "Too many attempts. Please wait a few minutes and try again.",
};

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error: string | null;
  valid: boolean;
  trailing?: ReactNode;
  children: (aria: { "aria-invalid": boolean; "aria-describedby": string }) => ReactNode;
}

function Field({ id, label, hint, error, valid, trailing, children }: FieldProps) {
  const messageId = `${id}-msg`;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="section-code">
          {label}
        </label>
        {hint && <span className="text-xs resume-muted">{hint}</span>}
      </div>
      <div className="relative mt-2">
        {children({ "aria-invalid": !!error, "aria-describedby": messageId })}
        <span className="pointer-events-none absolute top-3 right-3" aria-hidden="true">
          {error && <AlertCircle className="h-4 w-4 text-rose-500" />}
          {!error && valid && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        </span>
      </div>
      <div className="mt-1.5 flex min-h-5 items-start justify-between gap-3 text-xs">
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={error ? "text-rose-500" : "resume-muted"}
        >
          {error}
        </p>
        {trailing}
      </div>
    </div>
  );
}

const inputBase =
  "w-full rounded-sm border bg-transparent px-3 py-2.5 pr-9 text-sm text-(--site-text) outline-none transition placeholder:text-(--site-muted)/60 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--site-accent)_20%,transparent)] disabled:opacity-60";

function inputTone(error: string | null, valid: boolean) {
  if (error) return "border-rose-500/70 focus:border-rose-500";
  if (valid) return "border-emerald-500/50 focus:border-emerald-500";
  return "border-(--site-surface-border) focus:border-(--site-accent)";
}

export default function FeedbackDialog() {
  const uid = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    name: false,
    email: false,
    message: false,
  });
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const errors: Record<FieldName, string | null> = {
    name: touched.name ? validate("name", values.name) : null,
    email: touched.email ? validate("email", values.email) : null,
    message: touched.message ? validate("message", values.message) : null,
  };
  const isValid = (f: FieldName) => touched[f] && !validate(f, values[f]) && !!values[f].trim();
  const busy = status === "sending";
  const messageLength = values.message.length;

  function reset() {
    setValues(EMPTY);
    setTouched({ name: false, email: false, message: false });
    setStatus("idle");
    setServerError("");
  }

  function open() {
    if (status === "error") setStatus("idle");
    dialogRef.current?.showModal();
  }

  const bind = (field: FieldName) => ({
    id: `${uid}-${field}`,
    name: field,
    value: values[field],
    disabled: busy,
    onChange: (e: { target: { value: string } }) => {
      const next = e.target.value;
      setValues((v) => ({ ...v, [field]: next }));
      setTouched((t) => (t[field] || !next ? t : { ...t, [field]: true }));
    },
    onBlur: () => setTouched((t) => ({ ...t, [field]: true })),
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, email: true, message: true });

    const firstInvalid = FIELD_ORDER.find((f) => validate(f, values[f]));
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
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
        className="global-search-dialog top-auto! m-auto w-[min(92vw,34rem)] overflow-hidden rounded-xl p-0"
      >
        <div className="flex items-center gap-3 border-b border-(--site-surface-border) bg-(--site-accent)/5 px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <i className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </span>
          <span className="flex-1 truncate font-mono text-xs resume-muted">
            ~/feedback <span className="site-nav-active">--send</span>
          </span>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close feedback form"
            className="light-btn-hover-bg site-icon-button cursor-pointer resume-muted"
          >
            <X className="h-4 w-4" />
          </button>
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
                className="cursor-pointer rounded-sm border border-(--site-surface-border) px-5 py-2.5 text-sm font-semibold hover:border-(--site-accent)"
              >
                Send another
              </button>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="action-button shine-border cursor-pointer px-5 py-2.5 text-sm font-semibold shine-border-contrast"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5 p-6">
            <div>
              <h2 id={`${uid}-title`} className="text-3xl font-semibold tracking-tight">
                What&apos;s on your mind?
              </h2>
              <p className="mt-2 text-sm leading-6 resume-muted">
                Ideas, bugs, or kind words. Name and email are optional, add an email if you want a
                reply.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id={`${uid}-name`}
                label="name"
                hint="optional"
                error={errors.name}
                valid={isValid("name")}
              >
                {(aria) => (
                  <input
                    {...bind("name")}
                    {...aria}
                    autoComplete="name"
                    placeholder="Ada Lovelace"
                    className={cn(inputBase, inputTone(errors.name, isValid("name")))}
                  />
                )}
              </Field>
              <Field
                id={`${uid}-email`}
                label="email"
                hint="optional"
                error={errors.email}
                valid={isValid("email")}
              >
                {(aria) => (
                  <input
                    {...bind("email")}
                    {...aria}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={cn(inputBase, inputTone(errors.email, isValid("email")))}
                  />
                )}
              </Field>
            </div>

            <Field
              id={`${uid}-message`}
              label="feedback"
              hint="required"
              error={errors.message}
              valid={isValid("message")}
              trailing={
                <span
                  className={cn(
                    "shrink-0 font-mono tabular-nums",
                    messageLength > LIMITS.message && "text-rose-500",
                    messageLength > LIMITS.message * 0.9 &&
                      messageLength <= LIMITS.message &&
                      "text-amber-500",
                    messageLength <= LIMITS.message * 0.9 && "resume-muted",
                  )}
                  aria-hidden="true"
                >
                  {messageLength} / {LIMITS.message}
                </span>
              }
            >
              {(aria) => (
                <textarea
                  {...bind("message")}
                  {...aria}
                  rows={5}
                  placeholder="Tell me what worked, what didn't, or what you'd love to see..."
                  className={cn(
                    inputBase,
                    "resize-y",
                    inputTone(errors.message, isValid("message")),
                  )}
                />
              )}
            </Field>

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
