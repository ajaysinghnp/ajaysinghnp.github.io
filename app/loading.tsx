export default function Loading() {
  return (
    <main className="resume-shell flex min-h-[55vh] w-full items-center justify-center py-20">
      <section className="resume-surface shine-border-hover w-full max-w-xl p-6 sm:p-8" aria-label="Loading page">
        <div className="flex items-center justify-between border-b border-[var(--site-border)] pb-4 text-xs uppercase tracking-[0.18em]">
          <span className="section-code">// loading / signal</span>
          <span className="live-dot" />
        </div>
        <div className="mt-10 flex items-center gap-4">
          <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_18px_#67e8f9]" />
          <p className="text-2xl font-semibold tracking-[-0.04em] text-zinc-50">Preparing the next view<span className="text-cyan-300">...</span></p>
        </div>
        <div className="mt-8 h-1 overflow-hidden bg-cyan-300/10"><div className="loading-line h-full bg-cyan-300" /></div>
        <p className="resume-muted mt-5 text-sm">Collecting the useful parts. One moment.</p>
      </section>
    </main>
  );
}
