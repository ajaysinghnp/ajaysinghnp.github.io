"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  speed?: number; // pixels per second
  className?: string;
}

export function Marquee({ children, speed = 24, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ scrolling: false, duration: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const copy = copyRef.current;
    if (!container || !copy) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const measure = () => {
      const last = copy.lastElementChild;
      if (!last) return;

      // Both rects share the track's transform, so this stays correct while animating.
      const natural = last.getBoundingClientRect().right - copy.getBoundingClientRect().left;
      const gap = Number.parseFloat(getComputedStyle(copy).columnGap) || 0;
      const scrolling = !reducedMotion.matches && natural > container.clientWidth + 1;
      const duration = scrolling ? (natural + gap) / speed : 0;

      setState((previous) =>
        previous.scrolling === scrolling && Math.abs(previous.duration - duration) < 0.5
          ? previous
          : { scrolling, duration },
      );
    };

    // Observing fires an initial measurement, so there is no synchronous call here.
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(copy);
    reducedMotion.addEventListener("change", measure);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", measure);
    };
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "marquee py-1",
        state.scrolling
          ? "marquee-fade overflow-hidden"
          : "[scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <div
        className={cn("flex w-max", state.scrolling && "marquee-track will-change-transform")}
        style={
          state.scrolling
            ? ({ "--marquee-duration": `${state.duration}s` } as React.CSSProperties)
            : undefined
        }
      >
        <div ref={copyRef} className={cn("flex shrink-0 gap-2", state.scrolling && "pr-2")}>
          {children}
        </div>
        {state.scrolling && (
          <div aria-hidden="true" inert className="flex shrink-0 gap-2 pr-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
