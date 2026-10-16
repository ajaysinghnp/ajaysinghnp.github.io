"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";

import { RefreshCw } from "lucide-react";

import { ProjectsState } from "@/components/mdx/projects-client";

export default function BlogError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <ProjectsState
      eyebrow="home / landing page"
      label="Something Bad Happened"
      description="The website is currently having difficulties. Please try again shortly."
      action={
        <button
          onClick={() =>
            startTransition(() => {
              router.refresh();
              reset();
            })
          }
          className="action-button shine-border inline-flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold shine-border-contrast"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      }
    />
  );
}
