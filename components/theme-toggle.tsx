"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export interface ModeToggleProps {
  className?: string | undefined
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined
}

type Choice = "system" | "dark" | "light"

/**
 * Cycle: system -> opposite of OS theme -> same as OS theme -> system
 *  OS light: system -> dark -> light -> system
 *  OS dark:  system -> light -> dark -> system
 */
function getNextTheme(theme: string | undefined, systemTheme: string | undefined): Choice {
  const system: Choice = systemTheme === "dark" ? "dark" : "light"
  const opposite: Choice = system === "dark" ? "light" : "dark"

  if (!theme || theme === "system") return opposite
  if (theme === opposite) return system
  return "system"
}

/** Icon represents the NEXT theme (the destination), not the current one. */
const icons: Record<Choice, React.ElementType> = {
  system: Monitor,
  dark: Moon,
  light: Sun,
}

export function ModeToggle({ className, variant }: ModeToggleProps) {
  const { theme, systemTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  // Theme is unknown on the server, so render an empty placeholder of the same size
  if (!mounted) {
    return (
      <Button
        type="button"
        variant={variant}
        size={null}
        className={className}
        aria-label="Toggle theme"
        disabled
      >
        <span className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  const current = theme ?? "system"
  const next = getNextTheme(theme, systemTheme)
  const NextIcon = icons[next]

  return (
    <Button
      type="button"
      variant={variant}
      size={null}
      className={`cursor-pointer ${className ?? ""}`}
      aria-label={`Theme: ${current}. Switch to ${next}.`}
      title={`Current: ${current}. Next: ${next}.`}
      onClick={() => setTheme(next)}
    >
      <NextIcon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
    </Button>
  )
}