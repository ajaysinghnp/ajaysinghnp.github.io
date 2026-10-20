export function Pill({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1.5 rounded-full border border-(--site-surface-border) px-3 py-1 text-xs resume-muted"
    >
      {children}
    </span>
  );
}
