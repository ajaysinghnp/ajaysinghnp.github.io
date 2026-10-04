import Link from "next/link";

import {
  BriefcaseBusiness,
  Camera,
  GitBranch,
  Globe,
  Mail,
  MessageSquare,
  Play,
} from "lucide-react";

import { socialMedia } from "@/data/social";
import type { Social } from "@/types/social";

export const socials: Social[] = [];

if (socialMedia.facebook)
  socials.push({
    icon: <Globe size={20} />,
    href: socialMedia.facebook.href,
    label: socialMedia.facebook.label,
    handle: socialMedia.facebook.handle,
  });

if (socialMedia.instagram)
  socials.push({
    icon: <Camera size={20} />,
    href: socialMedia.instagram.href,
    label: socialMedia.instagram.label,
    handle: socialMedia.instagram.handle,
  });

if (socialMedia.twitter)
  socials.push({
    icon: <MessageSquare size={20} />,
    href: socialMedia.twitter.href,
    label: socialMedia.twitter.label,
    handle: socialMedia.twitter.handle,
  });

if (socialMedia.email)
  socials.push({
    icon: <Mail size={20} />,
    href: socialMedia.email.href,
    label: socialMedia.email.label,
    handle: socialMedia.email.handle,
  });

if (socialMedia.youtube)
  socials.push({
    icon: <Play size={20} />,
    href: socialMedia.youtube.href,
    label: socialMedia.youtube.label,
    handle: socialMedia.youtube.handle,
  });

if (socialMedia.github)
  socials.push({
    icon: <GitBranch size={20} />,
    href: socialMedia.github.href,
    label: socialMedia.github.label,
    handle: socialMedia.github.handle,
  });

if (socialMedia.linkedin)
  socials.push({
    icon: <BriefcaseBusiness size={20} />,
    href: socialMedia.linkedin.href,
    label: socialMedia.linkedin.label,
    handle: socialMedia.linkedin.handle,
  });

export interface Props {
  icononly?: boolean;
}

const Social = ({ icononly = true }: Props) => {
  return (
    <div className="social-links animate-fade-in flex">
      {socials.map((s) => (
        <Link
          href={s.href}
          key={s.href}
          rel="noopener noreferrer"
          title={
            s.label === "Github" ? `Explore SourceCode @${s.label}` : `Connect with me @${s.handle}`
          }
          target="_blank"
          className="group relative flex flex-col items-center px-4 duration-700 md:gap-8"
        >
          <span className="text-md drop-shadow-orange relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-500 bg-zinc-900 text-zinc-200 duration-1000 group-hover:border-zinc-200 group-hover:bg-zinc-900 group-hover:text-white">
            {s.icon}
          </span>{" "}
          {!icononly && (
            <div className="z-10 flex flex-col items-center">
              <span className="font-display font-medium text-zinc-200 duration-150 group-hover:text-white">
                {s.handle}
              </span>
              <span className="mt-4 text-center text-sm text-zinc-400 duration-1000 group-hover:text-zinc-200">
                {s.label}
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};

export default Social;
