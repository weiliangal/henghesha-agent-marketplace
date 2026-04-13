import {
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  GraduationCap,
  Paperclip,
  PackageSearch,
} from "lucide-react";

import { resolveAssetUrl } from "../api/client";

const statusMeta = {
  pending: { label: "待推进", tone: "bg-amber-100 text-amber-700", step: 1 },
  paid: { label: "已付款", tone: "bg-emerald-100 text-emerald-700", step: 2 },
  completed: { label: "已完成", tone: "bg-sky/10 text-sky", step: 3 },
  cancelled: { label: "已取消", tone: "bg-rose-100 text-rose-700", step: 0 },
};

const paymentMeta = {
  manual_pending: { label: "待提交回执", tone: "bg-stone-100 text-stone-700" },
  submitted: { label: "待人工确认", tone: "bg-amber-100 text-amber-700" },
  confirmed: { label: "已确认", tone: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "已驳回", tone: "bg-rose-100 text-rose-700" },
};

const orderStages = ["创建订单", "支付确认", "交付完成"];

export default function OrderCard({ order, children }) {
  const status = statusMeta[order.status] || { label: order.status, tone: "bg-white text-ink", step: 0 };
  const payment = paymentMeta[order.paymentStatus] || { label: order.paymentStatus, tone: "bg-white text-ink" };
  const activeStep = order.status === "cancelled" ? 0 : status.step;

  return (
    <div className="mesh-panel p-6">
      <div className="relative z-10 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="eyebrow">Order #{order.id}</div>
            <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{order.title}</h3>
            <p className="mt-3 text-sm leading-7 text-ink/66">{order.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>订单 {status.label}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.tone}`}>支付 {payment.label}</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={<CircleDollarSign size={16} />} label="预算" value={`¥${(order.budget / 100).toLocaleString("zh-CN")}`} />
          <MetricCard icon={<Building2 size={16} />} label="企业" value={order.buyerOrg || order.buyerName || "--"} />
          <MetricCard icon={<GraduationCap size={16} />} label="学校" value={order.schoolOrg || order.schoolName || "待匹配"} />
          <MetricCard icon={<PackageSearch size={16} />} label="关联智能体" value={order.agentName || "定制订单"} />
          <MetricCard icon={<CalendarClock size={16} />} label="更新时间" value={new Date(order.updatedAt || order.createdAt).toLocaleDateString("zh-CN")} />
        </div>

        <div className="rounded-[1.45rem] border border-white/80 bg-white/84 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-ink">订单进度</div>
            <div className="text-xs uppercase tracking-[0.22em] text-ink/42">{payment.label}</div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {orderStages.map((item, index) => {
              const stepIndex = index + 1;
              const done = activeStep >= stepIndex;
              return (
                <div
                  key={item}
                  className={`rounded-[1.2rem] border px-4 py-3 transition ${
                    done ? "border-emerald-200 bg-emerald-50/90" : "border-white/80 bg-white/82"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        done ? "bg-emerald-600 text-white" : "bg-ink/10 text-ink/55"
                      }`}
                    >
                      {done ? <CheckCircle2 size={13} /> : stepIndex}
                    </span>
                    {item}
                  </div>
                </div>
              );
            })}
          </div>
          {order.deliveryDeadline ? <div className="mt-4 text-sm text-ink/58">交付时间：{new Date(order.deliveryDeadline).toLocaleDateString("zh-CN")}</div> : null}
          {order.note ? <div className="mt-3 text-sm leading-7 text-ink/62">备注：{order.note}</div> : null}
          {order.attachmentUrl ? (
            <a href={resolveAssetUrl(order.attachmentUrl)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky">
              <Paperclip size={15} />
              查看附件
            </a>
          ) : null}
        </div>

        {children ? <div className="soft-divider pt-5">{children}</div> : null}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="rounded-[1.3rem] border border-white/80 bg-white/84 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink/40">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}
