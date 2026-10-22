"use client";

import { MessageSquare } from "lucide-react";

import { FEEDBACK_OPEN_EVENT } from "@/components/sections/feedback-dialog";

export default function FeedbackTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(FEEDBACK_OPEN_EVENT))}
      aria-haspopup="dialog"
      aria-keyshortcuts="Control+F Meta+F"
      title="Share feedback (Ctrl/Cmd + F)"
      className="sparkle inline-flex cursor-pointer items-center gap-2 rounded-sm border border-(--site-accent) bg-(--site-accent)/10 px-6 py-3 text-sm font-semibold site-nav-active hover:border-cyan-300"
    >
      <MessageSquare className="h-4 w-4" /> Share feedback
    </button>
  );
}
