import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Mail, MapPin, Sparkles } from "lucide-react";

import { resume } from "@/data/resume";
import { socialMedia } from "@/data/social";

const capabilities = resume.skills.slice(0, 6);
const education = resume.education.slice(0, 2);

export default function ResumePage() {
  return (
    <main className="w-full pb-20 resume-shell">
      <header className="grid gap-10 border-b resume-intro pb-12 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div>
          <p className="section-code">// resume / selected signal</p>
          <h1 className="mt-5 max-w-4xl text-6xl leading-[0.92] font-semibold tracking-[-0.06em] text-zinc-50 sm:text-8xl">
            Ajay Singh<span className="text-cyan-300">.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-xl leading-8 resume-lead">
            I build useful systems, automate the repetitive, and turn technical curiosity into
            practical tools.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-3 resume-meta">
            <MapPin className="h-4 w-4 text-cyan-300" /> Kathmandu, Nepal
          </div>
          <Link
            href={socialMedia.email.href}
            aria-label="Start a conversation by email"
            className="flex items-center gap-3 resume-meta transition hover:text-cyan-300"
          >
            <Mail className="h-4 w-4 text-cyan-300" /> Start a conversation
          </Link>
          <Link
            href={socialMedia.github.href}
            target="_blank"
            className="flex items-center gap-3 resume-meta transition hover:text-cyan-300"
          >
            <ArrowUpRight className="h-4 w-4 text-cyan-300" /> github.com/
            {socialMedia.github.handle}
          </Link>
        </div>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="space-y-8">
          <div className="shine-border-hover resume-surface p-5">
            <div className="bg-background relative mx-auto aspect-square max-w-52 overflow-hidden rounded-full border border-cyan-300/40">
              <Image
                src="/images/author.png"
                alt="Portrait of Ajay Singh"
                fill
                sizes="208px"
                className="object-cover object-top contrast-125 grayscale"
              />
            </div>
            <div className="mt-6 border-t border-current/10 pt-5">
              <p className="section-code">// working mode</p>
              <p className="mt-3 text-lg leading-7 resume-lead">
                Hardware-minded. Software-curious. Always looking for the simpler system.
              </p>
            </div>
          </div>
          <div>
            <p className="section-code">// capabilities</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {capabilities.map((skill) => (
                <span
                  key={skill.label}
                  className="shine-border-hover inline-flex items-center resume-chip"
                >
                  {skill.label}
                </span>
              ))}
            </div>
          </div>
          <div className="shine-border-hover resume-surface p-5">
            <p className="section-code">// education</p>
            <div className="mt-5 space-y-5">
              {education.map((item) => (
                <div key={item.degree}>
                  <p className="text-xs text-cyan-300">{item.date}</p>
                  <h3 className="mt-1 text-lg text-zinc-100">{item.degree}</h3>
                  <p className="mt-1 text-sm resume-muted">{item.school}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-14">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <p className="section-code">// experience</p>
              <span className="text-xs tracking-[0.16em] resume-muted uppercase">signal / 01</span>
            </div>
            {resume.workExperiences.map((job) => (
              <article
                key={job.company}
                className="resume-timeline relative border-l border-cyan-300/50 pl-6"
              >
                <span className="absolute top-1 left-[-0.3rem] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_#67e8f9]" />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                  <h2 className="text-3xl text-zinc-50">{job.title}</h2>
                  <span className="text-xs tracking-[0.15em] resume-muted uppercase">
                    {job.date}
                  </span>
                </div>
                <p className="mt-2 text-cyan-200">{job.company}</p>
                <p className="mt-5 max-w-2xl text-base leading-8 resume-muted">
                  Supporting reliable operations through automation, scripting, system support, and
                  practical technical problem-solving.
                </p>
              </article>
            ))}
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between">
              <p className="section-code">// selected strengths</p>
              <Sparkles className="h-4 w-4 text-cyan-300" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {capabilities.map((skill) => (
                <div
                  key={skill.label}
                  className="shine-border-hover flex items-start gap-3 resume-surface p-4 resume-skill hover:border-cyan-400/55 hover:bg-cyan-400/10"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <div>
                    <h3 className="text-base text-zinc-100">{skill.label}</h3>
                    <p className="mt-1 text-sm leading-6 resume-muted">{skill.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="shine-border-hover flex flex-col gap-5 resume-surface p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-code">// next conversation</p>
              <h2 className="mt-2 text-2xl text-zinc-50">Have a useful problem to work through?</h2>
            </div>
            <Link
              href={socialMedia.email.href}
              className="shine-border inline-flex w-fit items-center gap-2 glow-action rounded px-4 py-3 text-sm font-semibold text-[#090b0d] shine-border-contrast"
            >
              Let&apos;s talk <ArrowUpRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
