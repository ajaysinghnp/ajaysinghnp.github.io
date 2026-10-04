import Link from "next/link";

import { ArrowUpRight, BriefcaseBusiness, GitBranch, Play } from "lucide-react";

import { socialMedia } from "@/data/social";

const links = [
  { ...socialMedia.github, icon: GitBranch },
  { ...socialMedia.linkedin, icon: BriefcaseBusiness },
  { ...socialMedia.youtube, icon: Play },
];

interface SocialLinksPanelProps {
  heading?: string;
}

export default function SocialLinksPanel({ heading = "elsewhere" }: SocialLinksPanelProps) {
  return (
    <div>
      <p className="section-code">{heading}</p>
      <div className="social-links-panel mt-5 divide-y divide-(--site-border) border-y border-(--site-surface-border)">
        {links.map(({ label, handle, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between py-4 text-sm transition hover:text-cyan-300"
          >
            <span className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-cyan-300" /> {label}
            </span>
            <span className="flex items-center gap-2 text-xs resume-muted">
              {handle} <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
