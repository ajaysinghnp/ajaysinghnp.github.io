"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { GitBranch } from "lucide-react";

import { navigation } from "@/data/navigation";
import { socialMedia } from "@/data/social";
import { cn } from "@/lib/utils";

import { ModeToggle } from "./theme-toggle";

interface Props {
  gitTheme?: boolean;
}

export const Navigation: React.FC<Props> = ({ gitTheme = false }: Props) => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b site-navigation transition-all duration-300",
        isScrolled && "site-navigation-scrolled",
      )}
    >
      <div className="mx-auto flex w-full max-w-[80%] items-center justify-between gap-6 py-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 text-sm font-semibold tracking-wide"
        >
          <span className="site-logo shine-border flex h-8 w-8 items-center justify-center rounded border site-control p-1">
            <span aria-hidden="true" className="site-logo-mark h-6 w-6" />
          </span>
          <span className="site-nav-active">
            AJAY SINGH<span className="site-accent animate-[blink_1.5s_step-end_infinite]">_</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-xs tracking-[0.16em] uppercase md:flex">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group light-btn-hover-bg relative rounded p-2 resume-muted transition-colors",
                  isActive && "site-nav-active",
                )}
              >
                {item.name}

                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute -bottom-0.5 left-0 h-0.5 w-full origin-left scale-x-0 overflow-visible rounded-full",
                    "bg-linear-to-r from-transparent via-cyan-700/70 to-transparent",
                    "transition-transform duration-300 group-hover:scale-x-100",
                    isActive && "scale-x-100",
                    "dark:via-(--site-accent)",
                  )}
                >
                  {/* soft glow */}
                  <span className="absolute inset-0 rounded-full bg-inherit opacity-40 blur-[1px]" />

                  {/* moving highlight */}
                  <span className="relative block h-full w-1/4 translate-x-[150%] animate-[nav-shine_1s_ease-in-out_infinite] rounded-full bg-linear-to-r from-transparent via-white/80 to-transparent" />
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={gitTheme ? socialMedia.github.theme : socialMedia.github.href}
            target="_blank"
            rel="noopener noreferrer"
            className="light-btn-hover-bg shine-border-hover site-icon-button site-control hover:resume-surface"
            aria-label="Open GitHub"
          >
            <GitBranch className="h-4 w-4" />
          </Link>
          <ModeToggle
            variant={null}
            className="light-btn-hover-bg shine-border-hover site-icon-button site-control hover:resume-surface"
          />
        </div>
      </div>
    </header>
  );
};
