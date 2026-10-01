import Link from "next/link";

import { socialMedia } from "@/data/social";

export default function SiteFooter() {
  return (
    <footer className="site-footer mx-auto flex max-w-[90%] flex-col gap-2 border-t py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
      <p>© {new Date().getFullYear()} Ajay Singh. Built in Nepal.</p>
      <p>
        <Link href={socialMedia.email.href} className="transition-colors hover:text-cyan-300">
          {socialMedia.email.handle}
        </Link>
      </p>
    </footer>
  );
}
