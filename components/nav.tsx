"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { GitBranch } from "lucide-react";
import { usePathname } from "next/navigation";

import { navigation } from "@/data/navigation";
import { socialMedia } from "@/data/social";
import { ModeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

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
        "site-navigation sticky top-0 z-50 border-b transition-all duration-300",
        isScrolled && "site-navigation-scrolled",
      )}
    >
      <div className="mx-auto flex w-full max-w-[80%] items-center justify-between gap-6 py-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 text-sm font-semibold tracking-wide"
        >
          <span className="site-logo site-control shine-border flex h-8 w-8 items-center justify-center rounded border p-1">
            <Image
              src="/images/logo-black.svg"
              alt="Ajay Singh logo"
              width={24}
              height={24}
              className="logo-light"
            />
            <Image
              src="/images/logo-white.svg"
              alt=""
              width={24}
              height={24}
              className="logo-dark"
              loading="eager"
            />
          </span>
          <span>
            AJAY SINGH<span className="site-accent">_</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.16em] md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "site-nav-link transition-colors hover:text-cyan-600",
                pathname === item.href ? "site-nav-active" : "",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={gitTheme ? socialMedia.github.theme : socialMedia.github.href}
            target="_blank"
            rel="noopener noreferrer"
            className="site-icon-button site-control shine-border-hover hover:bg-cyan-400/[0.14] hover:text-cyan-600"
            aria-label="Open GitHub"
          >
            <GitBranch className="h-4 w-4" />
          </Link>
          <ModeToggle
            variant={null}
            className="site-icon-button site-control shine-border-hover hover:bg-cyan-400/[0.14] hover:text-cyan-600"
          />
        </div>
      </div>
    </header>
  );
};
