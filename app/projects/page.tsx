"use client";

import Link from "next/link";
import { ArrowUpRight, GitBranch, RefreshCw } from "lucide-react";
import useSWR from "swr";
import { motion } from "framer-motion";

import { fetchProjects } from "@/lib/projects";
import { socialMedia } from "@/data/social";
import type { Project } from "@/types/github";

const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay } }),
};

export default function ProjectsPage() {
  const { data: projects, error, isLoading, mutate } = useSWR<Project[]>("projects", fetchProjects);
  const orderedProjects = [...(projects ?? [])].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  const featured = orderedProjects.find((project) => project.name === socialMedia.github.domain) ?? orderedProjects[0];
  const remaining = orderedProjects.filter((project) => project.name !== featured?.name);

  if (isLoading) {
    return <ProjectsState label="Scanning the project signal..." />;
  }

  if (error) {
    return <ProjectsState label="The project signal is unavailable." action={<button onClick={() => mutate()} className="glow-action inline-flex items-center gap-2 rounded px-4 py-3 text-sm font-semibold text-[#090b0d]"><RefreshCw className="h-4 w-4" /> Try again</button>} />;
  }

  return (
    <main className="resume-shell w-full pb-20">
      <header className="grid gap-10 border-b border-[var(--site-border)] pb-14 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div><p className="section-code">// projects / open signal</p><h1 className="mt-5 max-w-4xl text-6xl font-semibold leading-[0.92] tracking-[-0.06em] text-zinc-50 sm:text-8xl">Things I&apos;ve made<span className="text-cyan-300">.</span></h1></div>
        <p className="resume-lead max-w-xl text-xl leading-8">A changing index of open-source experiments, practical utilities, and tools built to make a real workflow a little better.</p>
      </header>

      {featured ? <motion.section initial="hidden" animate="show" variants={reveal} className="resume-panel mt-14 grid gap-8 overflow-hidden p-6 sm:p-8 lg:grid-cols-[1fr_0.42fr] lg:items-end"><div><p className="section-code">// featured / 01</p><h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.05em] text-zinc-50 sm:text-6xl">{featured.title}<span className="text-cyan-300">.</span></h2><p className="resume-muted mt-5 max-w-2xl text-lg leading-8">{featured.description || "A practical open-source project from the workshop."}</p></div><div className="flex flex-col gap-4 border-t border-[var(--site-border)] pt-5 lg:border-l lg:border-t-0 lg:pl-6"><p className="section-code">// repository</p><p className="resume-muted text-sm">Updated {new Date(featured.updated_at).toLocaleDateString()}</p><Link href={`/projects/${featured.name}`} className="inline-flex items-center gap-2 text-sm text-cyan-300 transition hover:text-cyan-200">Open project <ArrowUpRight className="h-4 w-4" /></Link></div></motion.section> : <ProjectsState label="No public projects are available right now." />}

      {remaining.length > 0 && <section className="mt-20"><div className="mb-8 flex items-end justify-between"><div><p className="section-code">// project index</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-zinc-50 sm:text-5xl">More experiments.</h2></div><Link href={socialMedia.github.href} target="_blank" className="hidden items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 sm:inline-flex">Open GitHub <GitBranch className="h-4 w-4" /></Link></div><div className="divide-y divide-[var(--site-border)] border-y border-[var(--site-border)]">{remaining.map((project, index) => <motion.article key={project.name} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={reveal} custom={index * 0.05} className="group grid gap-4 py-6 sm:grid-cols-[4rem_1fr_auto] sm:items-center"><span className="font-mono text-sm text-cyan-300/70">{String(index + 2).padStart(2, "0")}</span><div><p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/70">{project.visibility} / repository</p><h3 className="mt-2 text-2xl text-zinc-100 transition group-hover:text-cyan-200">{project.title}</h3><p className="resume-muted mt-2 max-w-2xl text-sm leading-7">{project.description || "No description yet. Open the repository to inspect the work."}</p></div><Link href={`/projects/${project.name}`} aria-label={`Open ${project.title}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--site-border)] text-zinc-400 transition group-hover:border-cyan-300 group-hover:text-cyan-300"><ArrowUpRight className="h-4 w-4" /></Link></motion.article>)}</div></section>}
    </main>
  );
}

function ProjectsState({ label, action }: { label: string; action?: React.ReactNode }) {
  return <main className="resume-shell flex min-h-[55vh] w-full flex-col items-center justify-center gap-5 text-center"><p className="section-code">// projects / signal</p><h1 className="text-3xl text-zinc-50">{label}</h1>{action}</main>;
}
