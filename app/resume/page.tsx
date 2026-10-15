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
          <p className="section-code">resume / selected signal</p>
          <h1 className="sparkle-text mt-5 max-w-4xl text-6xl leading-[0.92] font-semibold tracking-[-0.06em] sm:text-8xl">
            &nbsp;{resume.name}.
          </h1>
          <p className="mt-7 max-w-2xl text-xl leading-8 resume-lead">{resume.jobtask}</p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-3 resume-meta">
            <MapPin className="h-4 w-4" /> {resume.contacts.at(0)?.address}
          </div>
          <Link
            href={socialMedia.email.href}
            aria-label="Start a conversation by email"
            className="flex items-center gap-3 resume-meta transition hover:text-cyan-300"
          >
            <Mail className="h-4 w-4" /> Start a conversation
          </Link>
          <Link
            href={socialMedia.github.href}
            target="_blank"
            className="flex items-center gap-3 resume-meta transition hover:text-cyan-300"
          >
            <ArrowUpRight className="h-4 w-4" /> github.com/
            {socialMedia.github.handle}
          </Link>
        </div>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="space-y-8">
          <div className="shine-border-hover resume-surface p-5">
            <div className="relative mx-auto aspect-square max-w-52 overflow-hidden rounded-full border border-current/40 bg-(--photo-c)/80">
              <Image
                src={resume.image}
                alt={`Portrait of ${resume.name}`}
                fill
                sizes="208px"
                className="object-cover object-top contrast-125 grayscale"
              />
            </div>
            <div className="mt-6 border-t border-current/10 pt-5">
              <p className="section-code">working mode</p>
              <p className="mt-3 text-lg leading-7 resume-lead">{resume.profile}</p>
            </div>
          </div>
          <div>
            <p className="section-code">capabilities</p>
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
            <p className="section-code">education / journey</p>

            <div className="mt-6 space-y-0">
              {education.map((item, index) => (
                <div key={item.degree} className="flex gap-4">
                  {/* Step indicator and connecting segment */}
                  <div className="flex w-8 shrink-0 flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--site-accent) text-xs font-bold text-(--site-accent-foreground)">
                      {String(education.length - index).padStart(2, "0")}
                    </div>

                    {index < education.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="my-2 min-h-8 w-px flex-1 bg-(--site-accent)"
                      />
                    )}
                  </div>

                  {/* Education details */}
                  <div className="min-w-0 flex-1 pb-8">
                    <p className="text-xs tracking-[0.12em] site-nav-active">{item.date}</p>

                    <h3 className="mt-2 text-lg leading-snug site-nav-active">{item.degree}</h3>

                    <Link
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-sm resume-muted transition hover:text-(--site-accent)/60"
                    >
                      {item.school}
                      <ArrowUpRight className="h-4 w-4 shrink-0" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex flex-col justify-between">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <p className="section-code">experience</p>
              <span className="text-xs tracking-[0.16em] resume-muted uppercase">signal / 01</span>
            </div>
            {resume.workExperiences.map((job) => (
              <article
                key={job.company}
                className="resume-timeline relative border-l border-(--site-accent)/60 pl-6"
              >
                <span className="absolute top-1 left-[-0.3rem] h-2 w-2 rounded-full bg-(--site-accent) shadow-[0_0_14px_#67e8f9]" />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                  <h2 className="text-3xl site-nav-active">{job.title}</h2>
                  <span className="text-xs tracking-[0.15em] resume-muted uppercase">
                    {job.date}
                  </span>
                </div>
                <Link
                  href={job.link}
                  target="_blank"
                  className="mt-2 inline-flex gap-2 site-nav-active hover:underline"
                >
                  {job.company} <ArrowUpRight className="h-4 w-4" />
                </Link>
                <p className="mt-5 max-w-2xl text-base leading-8 resume-muted">{job.description}</p>
              </article>
            ))}
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between">
              <p className="section-code">selected strengths</p>
              <Sparkles className="h-4 w-4 site-nav-active" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {capabilities.map((skill) => (
                <div
                  key={skill.label}
                  className="shine-border-hover flex items-start gap-3 resume-surface p-4 resume-skill hover:border-cyan-400/55 hover:bg-cyan-400/10"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 site-nav-active" />
                  <div>
                    <h3 className="text-base site-nav-active">{skill.label}</h3>
                    <p className="mt-1 text-sm leading-6 resume-muted">{skill.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="shine-border-hover flex flex-col gap-5 resume-surface p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-code">next conversation</p>
              <h2 className="mt-2 text-2xl site-nav-active">
                Have a useful problem to work through?
              </h2>
            </div>
            <Link
              href={socialMedia.email.href}
              className="action-button shine-border inline-flex w-fit items-center gap-2 px-4 py-3 text-sm font-semibold shine-border-contrast"
            >
              Let&apos;s talk <ArrowUpRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
