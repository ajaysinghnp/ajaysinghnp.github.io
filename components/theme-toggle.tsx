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
  // Use resolvedTheme (actually applied theme) for determining current state
  const actualTheme = resolvedTheme ?? currentTheme
  // Calculate next theme based on the actually applied theme
  const nextTheme = actualTheme === "dark" ? "light" : actualTheme === "light" ? "system" : "dark"
  // Determine icon to show: icon representing CURRENT state, not next state
  const ThemeIcon = actualTheme === "dark" ? Moon : actualTheme === "light" ? Sun : Monitor

  return (
    <Button
      type="button"
      variant={variant}
      size={null}
      className={`cursor-pointer ${className ?? ""}`}
      aria-label={`Currently: ${actualTheme}. Switch to ${nextTheme}.`}
      title={`Currently: ${actualTheme}. Click to switch to ${nextTheme}.`}
    </Button>
  )
}
