import { Sparkles } from "lucide-react";

export default function EmptyState({ title, description, action = null }) {
  return (
    <div className="surface-panel p-10 text-center">
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-sky">
          <Sparkles size={20} />
        </div>
        <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{title}</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink/66">{description}</p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}
