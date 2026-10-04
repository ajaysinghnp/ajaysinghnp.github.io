"use client";

import * as React from "react";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export interface ModeToggleProps {
  className?: string | undefined;
  variant?:
    "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
}

type Choice = "system" | "dark" | "light";

/**
 * Cycle: system -> opposite of OS theme -> same as OS theme -> system
 *  OS light: system -> dark -> light -> system
 *  OS dark:  system -> light -> dark -> system
 */
function getNextTheme(theme: string | undefined, systemTheme: string | undefined): Choice {
  const system: Choice = systemTheme === "dark" ? "dark" : "light";
  const opposite: Choice = system === "dark" ? "light" : "dark";

  if (!theme || theme === "system") return opposite;
  if (theme === opposite) return system;
  return "system";
}

/** Icon represents the NEXT theme (the destination), not the current one. */
const icons: Record<Choice, React.ElementType> = {
  system: Monitor,
  dark: Moon,
  light: Sun,
};

const subscribe = () => () => {};

export function ModeToggle({ className, variant }: ModeToggleProps) {
  const { theme, systemTheme, setTheme } = useTheme();

  // false on the server and during hydration, true afterwards
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const current = mounted ? (theme ?? "system") : null;
  const next = mounted ? getNextTheme(theme, systemTheme) : null;
  const NextIcon = next ? icons[next] : null;

  return (
    <Button
      type="button"
      variant={variant}
      size={null}
      className={`cursor-pointer ${className ?? ""}`}
      aria-label={next ? `Theme: ${current}. Switch to ${next}.` : "Toggle theme"}
      title={next ? `Current: ${current}. Next: ${next}.` : undefined}
      onClick={() => {
        if (next) setTheme(next);
      }}
    >
      {NextIcon ? (
        <NextIcon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
      ) : (
        <span className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
      )}
    </Button>
  );
}
