"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export interface ModeToggleProps {
  className?: string | undefined
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined
}

export function ModeToggle({ className, variant }: ModeToggleProps) {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const currentTheme = theme ?? "dark"
  const nextTheme = currentTheme === "light" ? "dark" : currentTheme === "dark" ? "system" : "light"
  const activeTheme = resolvedTheme ?? currentTheme
  const ThemeIcon = currentTheme === "system" ? Sun : activeTheme === "dark" ? Monitor : Moon

  return (
    <Button
      type="button"
      variant={variant}
      size={null}
      className={`cursor-pointer ${className ?? ""}`}
      aria-label={`Theme: ${currentTheme}. Switch to ${nextTheme}.`}
      title={`Switch to ${nextTheme} theme`}
      onClick={() => setTheme(nextTheme)}
    >
      <ThemeIcon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
    </Button>
  )
}
