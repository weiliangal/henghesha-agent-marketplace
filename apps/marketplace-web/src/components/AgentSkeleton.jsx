export default function AgentSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="h-64 bg-[linear-gradient(135deg,rgba(13,92,156,0.12),rgba(255,255,255,0.85),rgba(251,124,50,0.12))] skeleton-shimmer" />
      <div className="space-y-4 p-6">
        <div className="h-4 w-24 rounded-full bg-ink/8 skeleton-shimmer" />
        <div className="h-8 w-2/3 rounded-2xl bg-ink/8 skeleton-shimmer" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded-2xl bg-ink/8 skeleton-shimmer" />
          <div className="h-4 w-5/6 rounded-2xl bg-ink/8 skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 rounded-[1.3rem] bg-ink/8 skeleton-shimmer" />
          <div className="h-16 rounded-[1.3rem] bg-ink/8 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
