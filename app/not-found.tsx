import Link from "next/link";
import { ArrowLeft, ArrowUpRight, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="resume-shell flex min-h-[55vh] w-full items-center justify-center py-20">
      <section className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-cyan-300"><SearchX className="h-7 w-7" /></div>
        <p className="section-code mt-8">// 404 / signal lost</p>
        <h1 className="mt-4 text-7xl font-semibold tracking-[-0.08em] text-zinc-50 sm:text-9xl">404<span className="text-cyan-300">.</span></h1>
        <p className="resume-lead mx-auto mt-5 max-w-md text-lg leading-8">This route does not exist, or it moved somewhere else while the system was changing.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-5">
          <Link href="/" className="glow-action inline-flex items-center gap-2 rounded px-5 py-3 text-sm font-semibold text-[#090b0d]"><ArrowLeft className="h-4 w-4" /> Return home</Link>
          <Link href="/projects" className="inline-flex items-center gap-2 py-3 text-sm text-cyan-300 transition hover:text-cyan-200">Browse projects <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>
  );
}
