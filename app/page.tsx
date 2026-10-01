"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, GitBranch, Mail, MapPin } from "lucide-react";

import { resume } from "@/data/resume";
import { socialMedia } from "@/data/social";

const projects = [
  {
    title: "Ajay Singh Portfolio",
    description:
      "A personal portfolio and blog built with Next.js, MDX, and Tailwind for sharing work, writing, and contact information.",
    link: "https://github.com/ajaysinghnp/ajaysinghnp.github.io",
    image:
      "https://opengraph.githubassets.com/1/ajaysinghnp/ajaysinghnp.github.io",
  },
  {
    title: "Portfolio Blog Theme",
    description:
      "A lightweight, customizable blog theme with clean typography, dark-mode support, and reusable content patterns.",
    link: "https://github.com/ajaysinghnp/portfolio-blog-theme",
    image:
      "https://opengraph.githubassets.com/1/ajaysinghnp/portfolio-blog-theme",
  },
  {
    title: "Blog",
    description:
      "A focused publishing platform for technical ideas, notes, and project updates with a minimal editorial layout.",
    link: "https://github.com/ajaysinghnp/blog",
    image: "https://opengraph.githubassets.com/1/ajaysinghnp/blog",
  },
];

const navItems = [
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay },
  }),
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_55%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:40px_40px]" />

      <header className="relative z-20 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-medium tracking-[0.24em] text-zinc-200 uppercase">
            {resume.name}
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="mailto:admin@ajaysingh.com.np"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-400/20"
          >
            <Mail className="h-4 w-4" />
            Contact
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:pb-24 lg:pt-20">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.1}
          className="flex flex-col justify-center"
        >
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Available for meaningful work
          </div>

          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
            I build thoughtful digital experiences.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">
            {resume.position} · I design and build practical systems, interfaces, and automation that turn ideas into reliable products.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="mailto:admin@ajaysingh.com.np"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
            >
              Let&apos;s talk
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={socialMedia.github.href}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/10"
            >
              <GitBranch className="h-4 w-4" />
              GitHub
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-5 text-sm text-zinc-400">
            <div>
              <span className="block text-2xl font-semibold text-white">6+ yrs</span>
              <span>experience</span>
            </div>
            <div>
              <span className="block text-2xl font-semibold text-white">30+ </span>
              <span>projects</span>
            </div>
            <div>
              <span className="block text-2xl font-semibold text-white">Nepal</span>
              <span>based</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.2}
          className="relative"
        >
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <div className="rounded-[22px] border border-cyan-400/20 bg-zinc-950/90 p-5">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zinc-400">
                <span>Current focus</span>
                <span className="text-cyan-300">Active</span>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-sm text-zinc-400">Role</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{resume.position}</p>
                </div>

                <div className="space-y-4 border-t border-white/10 pt-5">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    Kathmandu, Nepal
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <BriefcaseBusiness className="h-4 w-4 text-cyan-400" />
                    Product, automation, and web tools
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="projects" className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Selected work</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Projects</h2>
          </div>
          <Link href="/projects" className="text-sm text-zinc-300 transition hover:text-white">
            View all
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <motion.article
              key={project.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              custom={0.1 * index}
              className="group overflow-hidden rounded-[26px] border border-white/10 bg-white/5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10"
            >
              <div className="overflow-hidden border-b border-white/10 bg-zinc-900">
                <img
                  src={project.image}
                  alt={`${project.title} preview`}
                  className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-zinc-400">
                  <span>GitHub</span>
                  <span>Open source</span>
                </div>

                <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                <p className="text-sm leading-7 text-zinc-400">{project.description}</p>

                <Link
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                >
                  View project
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="about" className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={0.1}>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">About</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">A practical engineer with a creative mindset.</h2>
            <p className="mt-6 text-base leading-8 text-zinc-400">{resume.profile}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {resume.education.slice(0, 2).map((item) => (
                <div key={item.degree} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{item.date}</p>
                  <p className="mt-2 font-medium text-white">{item.degree}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={0.2}>
            <div className="border-l border-white/10 pl-6 md:pl-8">
              {resume.workExperiences.map((job, index) => (
                <div key={job.company} className="relative pb-8 last:pb-0">
                  {index !== resume.workExperiences.length - 1 && (
                    <div className="absolute left-[-1.75rem] top-2 h-full w-px bg-white/10" />
                  )}
                  <div className="absolute left-[-2.1rem] top-1.5 h-3 w-3 rounded-full border border-cyan-300 bg-cyan-400/80" />
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                      <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">{job.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-cyan-300">{job.company}</p>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">{job.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="contact" className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0.1}
          className="rounded-[30px] border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-white/5 to-white/0 p-8 text-center sm:p-10"
        >
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Let&apos;s build</p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Need a clean product, automation workflow, or polished web experience?
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="mailto:admin@ajaysingh.com.np"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-cyan-300"
            >
              <Mail className="h-4 w-4" />
              Email me
            </Link>
            <Link
              href={socialMedia.github.href}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-100 transition hover:bg-white/10"
            >
              <GitBranch className="h-4 w-4" />
              GitHub
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
