import Link from "next/link";

import { cn } from "@/lib/utils";

// Shared by every pill-shaped control so the rotating edge is consistent.
export const pillClass =
  "shine-border-hover relative rounded-full border border-(--site-surface-border) text-(--site-muted) transition hover:text-(--site-text)";

export function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        pillClass,
        "shrink-0 px-4 py-2 text-sm whitespace-nowrap",
        active && "shine-border site-nav-active",
      )}
    >
      {children}
    </Link>
  );
}
