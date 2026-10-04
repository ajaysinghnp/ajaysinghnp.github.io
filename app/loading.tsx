export default function Loading() {
  return (
    <main className="flex min-h-[55vh] w-full items-center justify-center py-20 resume-shell">
      <section
        className="shine-border-hover w-full max-w-xl resume-surface p-6 sm:p-8"
        aria-label="Loading page"
      >
        <div className="flex items-center justify-between border-b border-[var(--site-border)] pb-4 text-xs tracking-[0.18em] uppercase">
          <span className="section-code">loading / signal</span>
          <span className="live-dot" />
        </div>
        <div className="mt-10 flex items-center gap-4">
          <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_18px_#67e8f9]" />
          <p className="text-2xl font-semibold tracking-[-0.04em] text-zinc-50">
            Preparing the next view<span className="text-cyan-300">...</span>
          </p>
        </div>
        <div className="mt-8 h-1 overflow-hidden bg-cyan-300/10">
          <div className="h-full loading-line bg-cyan-300" />
        </div>
        <p className="mt-5 text-sm resume-muted">Collecting the useful parts. One moment.</p>
      </section>
    </main>
  );
}
