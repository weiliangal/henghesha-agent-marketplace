import { Sparkles } from "lucide-react";

export default function EmptyState({ title, description, action = null }) {
  return (
    <div className="section-tint p-10 text-center">
      <div className="relative z-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-sky shadow-[0_16px_36px_rgba(13,92,156,0.12)]">
          <Sparkles size={20} />
        </div>
        <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{title}</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink/66">{description}</p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}
