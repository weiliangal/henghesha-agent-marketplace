import { ArrowRight, BadgeCheck, Building2, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import SmartImage from "./SmartImage";

const categoryStyles = {
  教育: "bg-sky/10 text-sky",
  企业: "bg-tide/10 text-tide",
  文旅: "bg-gold/18 text-amber-700",
  定制: "bg-slate-100 text-slate-700",
};

export default function AgentCard({ agent }) {
  const cover = agent.imageUrls?.[0] || agent.demoImageUrls?.[0];

  return (
    <article className="glass-card card-hover overflow-hidden">
      <div className="relative h-60 overflow-hidden border-b border-slate-200 bg-slate-100">
        {cover ? (
          <SmartImage
            src={cover}
            alt={agent.name}
            className="h-full w-full object-cover"
            fallbackClassName="h-full w-full"
            label="项目展示"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(180deg,#f8fafc,#eef4fb)] text-sm font-medium text-ink/50">
            项目展示图
          </div>
        )}
        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[agent.category] || "bg-white text-ink"}`}>
            {agent.category}
          </span>
          {agent.featured ? (
            <span className="rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-semibold text-ink/70">平台推荐</span>
          ) : null}
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="space-y-3">
          <h3 className="font-display text-[1.8rem] font-semibold leading-tight text-ink">{agent.name}</h3>
          <p className="text-sm leading-7 text-ink/66">{agent.summary || agent.description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetaBlock icon={<Building2 size={16} />} label="提供方" value={agent.school?.organizationName || "高校团队"} />
          <MetaBlock icon={<BadgeCheck size={16} />} label="审核状态" value={agent.status === "approved" ? "已审核上线" : agent.status} />
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/42">
              <Wallet size={14} />
              参考价格
            </div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
              ¥{(agent.price / 100).toLocaleString("zh-CN")}
            </div>
          </div>
          <Link to={`/agents/${agent.id}`} className="button-secondary">
            查看详情
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function MetaBlock({ icon, label, value }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink/40">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}
