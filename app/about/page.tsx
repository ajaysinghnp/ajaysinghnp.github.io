import Link from "next/link";

import { ArrowUpRight, CircuitBoard, Lightbulb, Mail, Workflow } from "lucide-react";

import { about } from "@/data/about";
import { resume } from "@/data/resume";
import { socialMedia } from "@/data/social";

const principles = [
  {
    icon: Lightbulb,
    title: "Start with curiosity",
    description:
      "The best solutions usually begin with a better question and a willingness to look twice.",
  },
  {
    icon: Workflow,
    title: "Make it useful",
    description:
      "I like technology that removes friction, explains itself, and earns its place in a real workflow.",
  },
  {
    icon: CircuitBoard,
    title: "Stay close to reality",
    description: "Software, hardware, people, and constraints all belong in the same conversation.",
  },
];

export default function AboutPage() {
  return (
    <main className="w-full pb-20 resume-shell">
      <header className="grid gap-10 border-b resume-intro pb-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="section-code">about / the longer signal</p>
          <h1 className="sparkle-text mt-5 max-w-4xl text-6xl leading-[0.92] font-semibold tracking-[-0.06em] sm:text-8xl">
            I love creativity.
          </h1>
        </div>
        <p className="max-w-xl text-xl leading-8 resume-lead">{about.quote}</p>
      </header>

      <section className="mt-14 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="section-code">the short version</p>
          <h2 className="mt-5 max-w-md text-4xl leading-tight font-semibold tracking-tighter text-zinc-50">
            A practical mind with room for wonder.
          </h2>
        </div>
        <div>
          <p className="max-w-3xl text-lg leading-8 resume-lead">{about.description}</p>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {about.highlights.map((highlight) => (
              <div key={highlight.label} className="shine-border-hover resume-surface p-4">
                <p className="text-2xl font-semibold text-zinc-100">{highlight.label}</p>
                <p className="mt-2 text-xs leading-5 tracking-widest resume-muted uppercase">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-20 border-y resume-intro py-14">
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <p className="section-code">working principles</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tighter text-zinc-50 sm:text-5xl">
              How I approach the work.
            </h2>
          </div>
          <span className="hidden text-xs tracking-[0.15em] resume-muted uppercase sm:block">
            signal / 02
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="shine-border-hover resume-surface p-5 resume-skill hover:border-cyan-400/55 hover:bg-cyan-400/10"
            >
              <Icon className="h-5 w-5 text-cyan-300" />
              <h3 className="mt-6 text-xl text-zinc-100">{title}</h3>
              <p className="mt-3 leading-7 resume-muted">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-12 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="section-code">current interests</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tighter text-zinc-50 sm:text-5xl">
            Learning by building.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 resume-lead">
            These are the areas I keep returning to, whether the output is a small script, a useful
            interface, or a physical prototype.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill.label}
                className="shine-border-hover inline-flex items-center resume-chip"
              >
                {skill.label}
              </span>
            ))}
          </div>
        </div>
        <div className="shine-border-hover resume-surface p-6">
          <p className="section-code">keep in touch</p>
          <h2 className="mt-4 text-2xl text-zinc-50">Good ideas become better conversations.</h2>
          <p className="mt-3 leading-7 resume-muted">
            For collaborations, questions, or a problem worth exploring, email is the best place to
            start.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              href={socialMedia.email.href}
              className="shine-border inline-flex items-center gap-2 glow-action rounded px-4 py-3 text-sm font-semibold text-[#090b0d] shine-border-contrast"
            >
              <Mail className="h-4 w-4" /> Say hello
            </Link>
            <Link
              href={socialMedia.github.href}
              target="_blank"
              className="sparkle inline-flex gap-2 rounded-sm border border-cyan-300/40 bg-cyan-300/10 px-6 py-3 text-cyan-100 hover:border-cyan-300"
            >
              View the code <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
