import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface TimelineProps<T> {
  items: T[];
  getKey: (item: T, index: number) => string;
  renderContent: (item: T, index: number) => ReactNode;
  variant?: "numbered" | "dot";
  numbering?: "ascending" | "descending";
  className?: string;
}

export function Timeline<T>({
  items,
  getKey,
  renderContent,
  variant = "dot",
  numbering = "ascending",
  className,
}: TimelineProps<T>) {
  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const number = numbering === "descending" ? items.length - index : index + 1;

        return (
          <div key={getKey(item, index)} className="flex items-stretch gap-4">
            {/* Timeline indicator and connector */}
            <div className="relative flex w-8 shrink-0 flex-col items-center">
              {variant === "numbered" ? (
                <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--site-accent) pt-0.5 text-xs font-bold text-(--site-accent-foreground)">
                  {String(number).padStart(2, "0")}
                </div>
              ) : (
                <span className="z-10 mt-1.5 h-2 w-2 shrink-0 rounded-full bg-(--site-accent) shadow-[0_0_14px_#67e8f9]" />
              )}

              {!isLast &&
                (variant === "numbered" ? (
                  <div aria-hidden="true" className="my-2 min-h-8 w-px flex-1 bg-(--site-accent)" />
                ) : (
                  <div
                    aria-hidden="true"
                    className="absolute top-4 bottom-0 w-px bg-(--site-accent)/60"
                  />
                ))}
            </div>

            {/* Entry content */}
            <div className="min-w-0 flex-1 pb-8">{renderContent(item, index)}</div>
          </div>
        );
      })}
    </div>
  );
}
