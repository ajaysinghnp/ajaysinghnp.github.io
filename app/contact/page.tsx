import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

import { socialMedia } from "@/data/social";
import SocialLinksPanel from "@/components/social-links-panel";

export default function ContactPage() {
  return (
    <main className="resume-shell w-full pb-20">
      <header className="grid gap-10 border-b border-[var(--site-border)] pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="section-code">// contact / open channel</p>
          <h1 className="mt-5 max-w-4xl text-6xl font-semibold leading-[0.92] tracking-[-0.06em] text-zinc-50 sm:text-8xl">Let&apos;s make something useful<span className="text-cyan-300">.</span></h1>
        </div>
        <p className="resume-lead max-w-xl text-xl leading-8">Have a product idea, an automation problem, or a technical question worth exploring? Start with a simple note.</p>
      </header>

      <section className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="resume-surface shine-border-hover flex min-h-[22rem] flex-col justify-between p-6 sm:p-8">
          <div><p className="section-code">// best way to reach me</p><h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-zinc-50 sm:text-5xl">Email works best.</h2><p className="resume-muted mt-5 max-w-lg text-lg leading-8">Tell me what you are trying to make, where it is getting stuck, and what a useful outcome would look like.</p></div>
          <div className="mt-10"><Link href={socialMedia.email.href} aria-label="Start a conversation by email" className="glow-action hover:bg-[#a5f3fc] inline-flex items-center gap-3 rounded px-5 py-3 text-sm font-semibold text-[#090b0d]"><Mail className="h-4 w-4" /> Start a conversation <ArrowUpRight className="h-4 w-4" /></Link></div>
        </div>

        <div className="space-y-8">
          <div><p className="section-code">// currently around</p><div className="resume-meta mt-4 flex items-center gap-3 text-lg"><MapPin className="h-5 w-5 text-cyan-300" /> Kathmandu, Nepal</div></div>
          <SocialLinksPanel heading="// find me elsewhere" />
        </div>
      </section>

      <section className="mt-14 border-t border-[var(--site-border)] pt-6"><p className="resume-muted text-sm">No formal brief needed. A rough idea, a half-working prototype, or a problem you cannot quite name is enough to begin.</p></section>
    </main>
  );
}
