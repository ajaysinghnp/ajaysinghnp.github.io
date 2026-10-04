// app/projects/error.tsx
"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";

import { RefreshCw } from "lucide-react";

import { ProjectsState } from "@/components/projects-client";

export default function ProjectsError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <ProjectsState
      label="Projects are temporarily unavailable."
      description="GitHub may be limiting requests to its public API. Please try again shortly."
      action={
        <button
          onClick={() =>
            startTransition(() => {
              router.refresh();
              reset();
            })
          }
          className="shine-border inline-flex items-center gap-2 glow-action rounded px-4 py-3 text-sm font-semibold text-[#090b0d] shine-border-contrast"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      }
    />
  );
}
