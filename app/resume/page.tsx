import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Mail, MapPin, Sparkles } from "lucide-react";

import { resume } from "@/data/resume";
import { socialMedia } from "@/data/social";

const capabilities = resume.skills.slice(0, 6);
const education = resume.education.slice(0, 2);

export default function ResumePage() {
  return (
    <main className="resume-shell w-full pb-20 text-zinc-100">
      <header className="resume-intro grid gap-10 border-b pb-12 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div>
          <p className="section-code">// resume / selected signal</p>
          <h1 className="mt-5 max-w-4xl text-6xl font-semibold leading-[0.92] tracking-[-0.06em] text-zinc-50 sm:text-8xl">Ajay Singh<span className="text-cyan-300">.</span></h1>
          <p className="resume-lead mt-7 max-w-2xl text-xl leading-8">I build useful systems, automate the repetitive, and turn technical curiosity into practical tools.</p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <div className="resume-meta flex items-center gap-3"><MapPin className="h-4 w-4 text-cyan-300" /> Kathmandu, Nepal</div>
          <Link href={socialMedia.email.href} aria-label="Start a conversation by email" className="resume-meta flex items-center gap-3 transition hover:text-cyan-300"><Mail className="h-4 w-4 text-cyan-300" /> Start a conversation</Link>
          <Link href={socialMedia.github.href} target="_blank" className="resume-meta flex items-center gap-3 transition hover:text-cyan-300"><ArrowUpRight className="h-4 w-4 text-cyan-300" /> github.com/{socialMedia.github.handle}</Link>
        </div>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="space-y-8">
          <div className="resume-surface shine-border-hover p-5">
            <div className="relative mx-auto aspect-square max-w-[13rem] overflow-hidden rounded-full border border-cyan-300/40 bg-background"><Image src="/images/author.png" alt="Portrait of Ajay Singh" fill sizes="208px" className="object-cover object-top grayscale contrast-125" /></div>
            <div className="mt-6 border-t border-current/10 pt-5"><p className="section-code">// working mode</p><p className="resume-lead mt-3 text-lg leading-7">Hardware-minded. Software-curious. Always looking for the simpler system.</p></div>
          </div>
          <div>
            <p className="section-code">// capabilities</p>
            <div className="mt-4 flex flex-wrap gap-2">{capabilities.map((skill) => <span key={skill.label} className="resume-chip shine-border-hover inline-flex items-center">{skill.label}</span>)}</div>
          </div>
          <div className="resume-surface shine-border-hover p-5"><p className="section-code">// education</p><div className="mt-5 space-y-5">{education.map((item) => <div key={item.degree}><p className="text-xs text-cyan-300">{item.date}</p><h3 className="mt-1 text-lg text-zinc-100">{item.degree}</h3><p className="resume-muted mt-1 text-sm">{item.school}</p></div>)}</div></div>
        </aside>

        <div className="space-y-14">
          <section>
            <div className="mb-6 flex items-center justify-between"><p className="section-code">// experience</p><span className="resume-muted text-xs uppercase tracking-[0.16em]">signal / 01</span></div>
            {resume.workExperiences.map((job) => <article key={job.company} className="resume-timeline relative border-l border-cyan-300/50 pl-6"><span className="absolute -left-[0.3rem] top-1 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_#67e8f9]" /><div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between"><h2 className="text-3xl text-zinc-50">{job.title}</h2><span className="resume-muted text-xs uppercase tracking-[0.15em]">{job.date}</span></div><p className="mt-2 text-cyan-200">{job.company}</p><p className="resume-muted mt-5 max-w-2xl text-base leading-8">Supporting reliable operations through automation, scripting, system support, and practical technical problem-solving.</p></article>)}
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between"><p className="section-code">// selected strengths</p><Sparkles className="h-4 w-4 text-cyan-300" /></div>
            <div className="grid gap-3 sm:grid-cols-2">{capabilities.map((skill) => <div key={skill.label} className="resume-surface resume-skill shine-border-hover hover:border-cyan-400/55 hover:bg-cyan-400/10 flex items-start gap-3 p-4"><Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" /><div><h3 className="text-base text-zinc-100">{skill.label}</h3><p className="resume-muted mt-1 text-sm leading-6">{skill.description}</p></div></div>)}</div>
          </section>

          <section className="resume-surface shine-border-hover flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="section-code">// next conversation</p><h2 className="mt-2 text-2xl text-zinc-50">Have a useful problem to work through?</h2></div><Link href={socialMedia.email.href} className="glow-action shine-border shine-border-contrast inline-flex w-fit items-center gap-2 rounded px-4 py-3 text-sm font-semibold text-[#090b0d]">Let&apos;s talk <ArrowUpRight className="h-4 w-4" /></Link></section>
        </div>
      </div>
    </main>
  );
}
