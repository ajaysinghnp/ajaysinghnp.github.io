"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  GitBranch,
  GitBranch as Github,
  Mail,
  MapPin,
  Rss,
} from "lucide-react";

import { resume } from "@/data/resume";
import { socialMedia } from "@/data/social";

const projects = [
  {
    number: "01",
    title: "Personal web / blog",
    description: "A quiet home for experiments, field notes, and the systems behind the work.",
    tags: ["Next.js", "MDX", "Open source"],
    href: "https://github.com/ajaysinghnp/ajaysinghnp.github.io",
  },
  {
    number: "02",
    title: "Nepali calendar tools",
    description: "Useful, lightweight utilities that make local dates and everyday workflows easier to handle.",
    tags: ["JavaScript", "Utilities", "Nepal"],
    href: "https://github.com/ajaysinghnp/np-calendar",
  },
  {
    number: "03",
    title: "Maya Utility App",
    description: "A practical collection of small tools shaped by the friction of real technical work.",
    tags: ["Automation", "Tools", "Open source"],
    href: "https://github.com/ajaysinghnp/Maya-Utility-App",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay },
  }),
};

const navItems = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Notes", href: "/blog" },
];

export default function HomeRedesign() {
  return (
    <main className="portfolio-shell min-h-screen overflow-hidden text-[#20211d]">
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-center gap-3 text-sm font-semibold tracking-[-0.02em]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#20211d] text-sm text-[#d8ff45] transition-transform group-hover:rotate-12">AS</span>
          <span>Ajay Singh<span className="text-[#a6ad9a]">.</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[#65695e] md:flex">
          {navItems.map((item) => <Link key={item.href} href={item.href} className="transition-colors hover:text-[#20211d]">{item.label}</Link>)}
        </nav>
        <Link href={socialMedia.email.href} className="inline-flex items-center gap-2 rounded-full border border-[#20211d]/15 px-4 py-2 text-sm font-medium transition hover:border-[#20211d] hover:bg-[#20211d] hover:text-[#f6f5ef]"><Mail className="h-4 w-4" /> Say hello</Link>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pb-28 lg:pt-20">
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#d8ff45]/50 blur-3xl" />
        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0.08} className="relative z-10 flex flex-col justify-center">
          <div className="mb-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#7d8474]"><span className="h-px w-10 bg-[#20211d]" /> Engineer / builder / curious mind</div>
          <h1 className="max-w-3xl text-[clamp(3.5rem,9vw,8rem)] font-semibold leading-[0.9] tracking-[-0.075em]">Making useful things for the real world<span className="text-[#8eae19]">.</span></h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[#65695e] sm:text-xl">I&apos;m Ajay, an electronics and communication engineer based in Kathmandu. I work across IT operations, automation, software, and the occasional piece of hardware.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="#work" className="inline-flex items-center gap-3 rounded-full bg-[#20211d] px-5 py-3 text-sm font-medium text-[#f6f5ef] transition hover:bg-[#41443d]">See selected work <ArrowDownRight className="h-4 w-4 text-[#d8ff45]" /></Link>
            <GitBranch className="h-5 w-5" /> GitHub
          </div>
          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#7d8474]"><span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Kathmandu, Nepal</span><span className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" /> IT Assistant at Nepal Rastra Bank</span></div>
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0.2} className="relative z-10 flex items-end justify-center lg:justify-end">
          <div className="relative aspect-[0.84] w-full max-w-md overflow-hidden rounded-[2rem] bg-[#c7d0b6] shadow-[18px_18px_0_#20211d]">
            <Image src="/images/author.png" alt="Portrait of Ajay Singh" fill priority sizes="(max-width: 1024px) 90vw, 34vw" className="object-cover object-top grayscale mix-blend-multiply" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-[#20211d]/80 to-transparent p-6 pt-24 text-[#f6f5ef]"><p className="max-w-[13rem] text-sm leading-6">Bridging imagination and reality, one innovation at a time.</p><span className="text-3xl font-semibold text-[#d8ff45]">↗</span></div>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[#20211d]/10 bg-[#ecebe3]" aria-label="Highlights">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 text-sm sm:grid-cols-3 sm:px-8 lg:px-12"><div><p className="text-3xl font-semibold tracking-[-0.05em]">6<span className="text-[#8eae19]">+</span></p><p className="mt-1 text-[#7d8474]">years in IT and operations</p></div><div><p className="text-3xl font-semibold tracking-[-0.05em]">30<span className="text-[#8eae19]">+</span></p><p className="mt-1 text-[#7d8474]">open-source experiments</p></div><div><p className="text-3xl font-semibold tracking-[-0.05em]">∞</p><p className="mt-1 text-[#7d8474]">things still left to learn</p></div></div>
      </section>

      <section id="work" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Selected work</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">Small tools, useful systems.</h2></div><Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium underline decoration-[#b4bf94] underline-offset-8 hover:decoration-[#20211d]">Browse all projects <ArrowUpRight className="h-4 w-4" /></Link></div>
        <div className="divide-y divide-[#20211d]/15 border-y border-[#20211d]/15">
          {projects.map((project, index) => <motion.div key={project.title} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} custom={index * 0.08} className="group grid gap-5 py-7 transition-colors hover:bg-[#ecebe3] sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:px-5"><span className="text-sm text-[#a1a79a]">{project.number}</span><div><div className="flex flex-wrap items-center gap-3"><h3 className="text-2xl font-semibold tracking-[-0.04em]">{project.title}</h3><span className="h-2 w-2 rounded-full bg-[#a8c622]" /></div><p className="mt-2 max-w-xl text-sm leading-7 text-[#65695e]">{project.description}</p><div className="mt-3 flex flex-wrap gap-2 text-xs text-[#7d8474]">{project.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></div><Link href={project.href} target="_blank" rel="noreferrer" aria-label={`View ${project.title} on GitHub`} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#20211d]/15 transition group-hover:border-[#20211d] group-hover:bg-[#20211d] group-hover:text-[#d8ff45]"><ArrowUpRight className="h-5 w-5" /></Link></motion.div>)}
        </div>
      </section>

      <section id="about" className="bg-[#20211d] text-[#f6f5ef]"><div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-12 lg:py-32"><div><p className="eyebrow text-[#d8ff45]">A little context</p><h2 className="mt-5 max-w-sm text-4xl font-semibold leading-tight tracking-[-0.06em] sm:text-5xl">Technical enough to ship. Curious enough to keep asking why.</h2></div><div><p className="max-w-2xl text-xl leading-9 text-[#c2c5b9]">{resume.profile}</p><div className="mt-12 border-t border-white/15 pt-7"><p className="eyebrow text-[#8f9587]">Experience</p>{resume.workExperiences.map((job) => <div key={job.company} className="mt-5 grid gap-3 sm:grid-cols-[12rem_1fr]"><div><p className="font-medium text-[#d8ff45]">{job.company}</p><p className="mt-1 text-sm text-[#8f9587]">{job.date}</p></div><div><h3 className="text-xl font-medium">{job.title}</h3><p className="mt-2 max-w-xl leading-7 text-[#aeb2a6]">Supporting reliable IT operations while building better ways to automate the repetitive parts.</p></div></div>)}</div></div></div></section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-12 lg:py-32"><div><p className="eyebrow">Keep exploring</p><h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">The work is only half the story.</h2><p className="mt-6 max-w-lg text-lg leading-8 text-[#65695e]">I write about the other half: what I learn, what breaks, and the small ideas that make technology feel more human.</p><Link href="/blog" className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#20211d]/20 px-5 py-3 text-sm font-medium transition hover:bg-[#20211d] hover:text-[#f6f5ef]"><Rss className="h-4 w-4" /> Read the notes <ArrowUpRight className="h-4 w-4" /></Link></div><div className="flex flex-col justify-end border-t border-[#20211d]/15 pt-6 lg:border-t-0 lg:border-l lg:pl-10"><p className="eyebrow">Elsewhere</p><div className="mt-5 space-y-3 text-lg"><Link href={socialMedia.github.href} target="_blank" className="flex items-center justify-between border-b border-[#20211d]/15 pb-3 transition hover:text-[#718b0d]"><span className="inline-flex items-center gap-3"><Github className="h-5 w-5" /> GitHub</span><ArrowUpRight className="h-4 w-4" /></Link><Link href={socialMedia.linkedin.href} target="_blank" className="flex items-center justify-between border-b border-[#20211d]/15 pb-3 transition hover:text-[#718b0d]"><span>LinkedIn</span><ArrowUpRight className="h-4 w-4" /></Link><Link href={socialMedia.youtube.href} target="_blank" className="flex items-center justify-between border-b border-[#20211d]/15 pb-3 transition hover:text-[#718b0d]"><span>YouTube / Mentor Maya</span><ArrowUpRight className="h-4 w-4" /></Link></div></div></section>

      <footer id="contact" className="border-t border-[#20211d]/10 bg-[#d8ff45]"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12"><div><p className="eyebrow">Have a good problem?</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">Let&apos;s make it useful.</h2></div><Link href={socialMedia.email.href} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#20211d] px-5 py-3 text-sm font-medium text-[#f6f5ef] transition hover:bg-[#41443d]"><Mail className="h-4 w-4 text-[#d8ff45]" /> {socialMedia.email.handle}</Link></div></footer>
</main>
  );
}
