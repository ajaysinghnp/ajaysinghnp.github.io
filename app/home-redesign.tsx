"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  GitBranch,
  Mail,
  MapPin,
  Rss,
} from "lucide-react";

import { about } from "@/data/about";
import { navigation } from "@/data/navigation";
import { resume } from "@/data/resume";
import { socialMedia } from "@/data/social";
import { Navigation } from "@/components/nav";
import SocialLinksPanel from "@/components/social-links-panel";

const projects = [
  {
    index: "01",
    title: "Ajay Singh / portfolio",
    type: "Personal system",
    description: "A living archive for experiments, writing, and the practical systems behind the work.",
    href: "https://github.com/ajaysinghnp/ajaysinghnp.github.io",
  },
  {
    index: "02",
    title: "Nepali calendar tools",
    type: "Open source utility",
    description: "Small, useful tools for working with local dates and everyday calendar workflows.",
    href: "https://github.com/ajaysinghnp/np-calendar",
  },
  {
    index: "03",
    title: "Maya Utility App",
    type: "Automation toolkit",
    description: "A practical collection of tools shaped by the friction of real technical work.",
    href: "https://github.com/ajaysinghnp/Maya-Utility-App",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay },
  }),
};

export default function HomeRedesign() {
  return (
    <main className="signal-shell relative z-10 min-h-screen overflow-x-clip bg-transparent text-zinc-100">
      <Navigation />

      <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:pb-28 lg:pt-24">
        <motion.div initial="hidden" animate="show" variants={reveal} custom={0.1} className="lg:order-last">
          <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-cyan-300"><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_18px_#67e8f9]" /> Signal online / Kathmandu, Nepal</div>
          <h1 className="max-w-5xl text-[clamp(4rem,11vw,10rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-zinc-50">Ajay<br /><span className="text-cyan-300">Singh.</span></h1>
          <p className="mt-10 max-w-2xl text-xl leading-8 text-zinc-400 sm:text-2xl">I make useful software, small tools, and thoughtful experiments for the space between people and technology.</p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link href="/projects" className="glow-action group inline-flex items-center gap-3 rounded px-5 py-3 text-sm font-semibold text-[#090b0d]">Explore the work <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
            <Link href={socialMedia.github.href} target="_blank" className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-cyan-200"><GitBranch className="h-4 w-4" /> GitHub</Link>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={reveal} custom={0.25} className="relative flex items-end justify-center lg:order-first lg:justify-start">
          <div className="photo-panel glow-frame relative w-full max-w-sm p-3 shadow-[0_0_70px_rgba(34,211,238,0.12)]">
            <div className="profile-meta mb-3 flex items-center justify-between border-b border-white/10 px-2 py-2 pb-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500"><span>Profile / 001</span><span className="inline-flex items-center gap-2 text-cyan-300"><span className="live-dot" /> Live</span></div>
            <div className="relative aspect-[0.9] overflow-hidden bg-zinc-900"><Image src="/images/author.png" alt="Portrait of Ajay Singh" fill priority sizes="(max-width: 1024px) 90vw, 28vw" className="object-cover object-top grayscale contrast-125" /><div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(34,211,238,0.08)_50%,transparent_100%)] bg-[length:100%_8px]" /></div>
            <div className="grid grid-cols-2 gap-3 border-t border-white/10 px-2 pt-4 text-xs"><div><p className="text-zinc-600">Focus</p><p className="mt-1 text-zinc-200">Automation + systems</p></div><div><p className="text-zinc-600">Since</p><p className="mt-1 text-zinc-200">2012 / coding</p></div></div>
          </div>
        </motion.div>
      </section>

      <section className="shuttle-band site-panel relative z-10 border-y border-white/10" aria-label="Profile highlights">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:grid-cols-4 sm:px-8 lg:px-12">
          {about.highlights.map((highlight) => <div key={highlight.label} className="border-l border-cyan-300/40 pl-4"><p className="text-2xl font-semibold text-zinc-100">{highlight.label}</p><p className="mt-1 text-xs uppercase tracking-[0.12em] text-zinc-500">{highlight.description}</p></div>)}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12 lg:py-32" id="work">
        <div className="mb-10 flex items-end justify-between gap-6"><div><p className="section-code">// selected_work</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-zinc-50 sm:text-6xl">Useful by design.</h2></div><Link href="/projects" className="hidden items-center gap-2 text-sm text-zinc-400 transition hover:text-cyan-200 sm:inline-flex">All projects <ArrowUpRight className="h-4 w-4" /></Link></div>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {projects.map((project, index) => <motion.div key={project.index} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={reveal} custom={index * 0.1} className="group grid gap-4 py-7 transition-colors hover:bg-cyan-300/[0.04] sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:px-4"><span className="font-mono text-sm text-cyan-300/70">{project.index}</span><div><p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">{project.type}</p><h3 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-zinc-100">{project.title}</h3><p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-500">{project.description}</p></div><Link href={project.href} target="_blank" rel="noreferrer" aria-label={`View ${project.title} on GitHub`} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-zinc-400 transition group-hover:border-cyan-300 group-hover:text-cyan-200"><ArrowUpRight className="h-4 w-4" /></Link></motion.div>)}
        </div>
      </section>

      <section id="about" className="shuttle-band site-panel relative z-10 border-y border-white/10"><div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-32"><div><p className="section-code">// context</p><h2 className="mt-5 max-w-md text-4xl font-semibold leading-tight tracking-[-0.06em] text-zinc-50 sm:text-5xl">Curiosity with somewhere useful to go.</h2><p className="mt-7 max-w-md text-base leading-8 text-zinc-400">{about.description}</p></div><div><div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-cyan-300"><BriefcaseBusiness className="h-4 w-4" /> How I work</div><div className="mt-6 space-y-5">{resume.skills.slice(0, 3).map((skill) => <div key={skill.label} className="border-l border-cyan-300/50 pl-6"><h3 className="text-2xl text-zinc-100">{skill.label}</h3><p className="mt-2 max-w-xl leading-8 text-zinc-400">{skill.description}</p></div>)}</div><Link href="/about" className="mt-8 inline-flex items-center gap-2 text-sm text-zinc-300 underline decoration-cyan-300/60 underline-offset-8 transition hover:text-cyan-200">More about the work <ArrowUpRight className="h-4 w-4" /></Link></div></div></section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-12 lg:py-32"><div><p className="section-code">// field_notes</p><h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.06em] text-zinc-50 sm:text-6xl">The signal continues in the notes.</h2><p className="mt-6 max-w-lg text-lg leading-8 text-zinc-500">Ideas, lessons, and the occasional rabbit hole from building across software, automation, and hardware.</p><Link href="/blog" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"><Rss className="h-4 w-4" /> Read the blog <ArrowUpRight className="h-4 w-4" /></Link></div><div className="border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-10"><SocialLinksPanel /></div></section>

      <footer id="contact" className="relative z-10 border-t border-cyan-300/30 bg-cyan-300 text-[#090b0d]">
        <div className="mx-auto w-full max-w-[90%] py-12 lg:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#245761]">// open_channel</p>
              <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">Have a good problem?</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#245761]">Bring the messy bit. We can make it clearer, calmer, and useful.</p>
            </div>
            <Link href={socialMedia.email.href} aria-label="Start a conversation by email" className="inline-flex w-fit items-center gap-2 rounded bg-[#090b0d] px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-[#172126]"><Mail className="h-4 w-4" /> Start a conversation</Link>
          </div>
          <div className="mt-12 flex flex-col gap-5 border-t border-[#245761]/30 pt-5 text-xs text-[#245761] sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Ajay Singh. Built in Nepal.</span>
            <nav className="flex flex-wrap gap-x-5 gap-y-2">{navigation.map((item) => <Link key={item.href} href={item.href} className="transition-colors hover:text-[#090b0d]">{item.name}</Link>)}</nav>
          </div>
        </div>
      </footer>
    </main>
  );
}
