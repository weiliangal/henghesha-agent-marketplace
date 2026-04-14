export default function AgentSkeleton() {
  return (
    <div className="surface-panel overflow-hidden">
      <div className="h-64 bg-slate-100 skeleton-shimmer" />
      <div className="space-y-4 p-6">
        <div className="h-4 w-24 rounded-full bg-slate-100 skeleton-shimmer" />
        <div className="h-8 w-2/3 rounded-2xl bg-slate-100 skeleton-shimmer" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded-2xl bg-slate-100 skeleton-shimmer" />
          <div className="h-4 w-5/6 rounded-2xl bg-slate-100 skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 rounded-[1.3rem] bg-slate-100 skeleton-shimmer" />
          <div className="h-16 rounded-[1.3rem] bg-slate-100 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
