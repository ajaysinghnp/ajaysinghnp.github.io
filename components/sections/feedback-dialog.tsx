"use client";

import { type FormEvent, useRef, useState } from "react";

import { MessageSquare } from "lucide-react";

type Status = "idle" | "sending" | "sent" | "error";

export default function FeedbackDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  function open() {
    setStatus("idle");
    dialogRef.current?.showModal();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      if (!res.ok) throw new Error();
      form.reset();
      setStatus("sent");
    } catch {
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
        aria-labelledby="feedback-title"
        className="m-auto w-[min(92vw,32rem)] p-6 backdrop:bg-black/60"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <h2 id="feedback-title" className="text-2xl font-semibold tracking-tight">
            Share feedback
          </h2>

          <label className="block text-sm">
            Name (optional)
            <input
              name="name"
              maxLength={100}
              autoComplete="name"
              className="mt-1 w-full border p-2"
            />
          </label>
          <label className="block text-sm">
            Email (optional)
            <input
              name="email"
              type="email"
              maxLength={200}
              autoComplete="email"
              className="mt-1 w-full border p-2"
            />
          </label>
          <label className="block text-sm">
            Feedback
            <textarea
              name="message"
              required
              minLength={3}
              maxLength={4000}
              rows={5}
              className="mt-1 w-full border p-2"
            />
          </label>

          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-2499.75 h-0 w-0 opacity-0"
          />

          <p role="status" aria-live="polite" className="min-h-5 text-sm">
            {status === "sent" && "Thanks, your feedback was sent."}
            {status === "error" && "Something went wrong. Please try again."}
          </p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="px-4 py-2 text-sm"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={status === "sending"}
              className="action-button shine-border px-4 py-2 text-sm font-semibold shine-border-contrast"
            >
              {status === "sending" ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
