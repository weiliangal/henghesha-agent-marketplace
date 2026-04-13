import { ArrowUpRight, Building2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import SmartImage from "./SmartImage";

const categoryStyles = {
  教育: "bg-sky/10 text-sky",
  企业: "bg-tide/10 text-tide",
  文旅: "bg-gold/15 text-amber-700",
  定制: "bg-rose-100 text-rose-700",
};

export default function AgentCard({ agent }) {
  const cover = agent.imageUrls?.[0] || agent.demoImageUrls?.[0];

  return (
    <article className="glass-card card-hover overflow-hidden">
      <div className="relative h-72 overflow-hidden">
        {cover ? (
          <SmartImage
            src={cover}
            alt={agent.name}
            className="h-full w-full object-cover transition duration-700 hover:scale-105"
            fallbackClassName="h-full w-full"
            label="智能体预览"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#0d5c9c,#0f766e,#fb7c32)] text-white">
            智能体预览
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-aurora/85 via-aurora/20 to-transparent" />
        <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[agent.category] || "bg-white/90 text-ink"}`}>
              {agent.category}
            </span>
            {agent.featured ? (
              <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                推荐
              </span>
            ) : null}
          </div>
          <div className="rounded-full border border-white/18 bg-white/12 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
            ¥{(agent.price / 100).toLocaleString("zh-CN")}
          </div>
        </div>

        <div className="absolute bottom-5 left-5 right-5 text-white">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/70">
            <Sparkles size={14} />
            Curated Agent
          </div>
          <h3 className="mt-3 font-display text-[1.9rem] font-semibold leading-tight">{agent.name}</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/76">{agent.summary}</p>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="grid grid-cols-2 gap-3">
          <MetaCard icon={<Building2 size={16} />} label="提供方" value={agent.school?.organizationName || "平台样例"} />
          <MetaCard icon={<Sparkles size={16} />} label="状态" value={agent.status === "approved" ? "已审核上线" : agent.status} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-ink/58">适用于 {agent.category} 场景，支持直接购买与定制扩展。</div>
          <Link to={`/agents/${agent.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-sky">
            查看详情
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function MetaCard({ icon, label, value }) {
  return (
    <div className="rounded-[1.3rem] border border-ink/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,239,230,0.72))] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink/42">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}
