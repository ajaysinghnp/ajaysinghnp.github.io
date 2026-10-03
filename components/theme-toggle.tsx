"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export interface ModeToggleProps {
  className?: string | undefined
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined
}

/**
 * Theme switch cycle: system → dark → light → system (repeat)
 */
function getNextTheme(current: string) {
  switch (current) {
    case "system": return "dark"          // When in system, next is dark
    case "dark": return "light"           // When in dark, next is light
    case "light": return "system"         // When in light, back to system
    default: return "dark"                // Fallback if unknown
  }
}

/**
 * Theme icon component - shows the NEXT theme (destination) not current
 * Sun for dark mode, Moon for light mode, Monitor for system mode
 */
function ThemeIcon({ nextTheme }: { nextTheme: string }) {
  switch (nextTheme) {
    case "dark": return <Sun className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
    case "light": return <Moon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
    default: return <Monitor className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
  }
}

export function ModeToggle({ className, variant }: ModeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()

      // Use resolvedTheme from hook - handles both server and client consistently
      // When undefined (initial render), theme will be whatever was set on server via defaultTheme
    const currentTheme = typeof window !== "undefined" ? (resolvedTheme ?? "dark") : "dark"

        // Calculate next theme in the cycle
  const nextTheme = getNextTheme(currentTheme)

     return (
      <Button
      type="button"
      variant={variant}
      size={null}
      className={`cursor-pointer ${className ?? ""}`}
      aria-label={`Theme: ${currentTheme}. Switch to ${nextTheme}.`}
      title={`Current: ${currentTheme}. Next: ${nextTheme}.`}
      onClick={() => setTheme(nextTheme)}
     >
       <ThemeIcon nextTheme={nextTheme} />
     </Button>
    )
}
