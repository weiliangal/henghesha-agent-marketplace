import {
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  GraduationCap,
  PackageSearch,
  Paperclip,
} from "lucide-react";

import { resolveAssetUrl } from "../api/client";

const statusMeta = {
  pending: { label: "待推进", tone: "bg-amber-50 text-amber-700 border-amber-200", step: 1 },
  paid: { label: "已付款", tone: "bg-emerald-50 text-emerald-700 border-emerald-200", step: 2 },
  completed: { label: "已完成", tone: "bg-sky/10 text-sky border-sky/20", step: 3 },
  cancelled: { label: "已取消", tone: "bg-rose-50 text-rose-700 border-rose-200", step: 0 },
};

const paymentMeta = {
  manual_pending: { label: "待提交回执", tone: "bg-stone-100 text-stone-700 border-stone-200" },
  submitted: { label: "待人工确认", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "已确认", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "已驳回", tone: "bg-rose-50 text-rose-700 border-rose-200" },
};

const orderStages = ["创建订单", "付款确认", "交付完成"];

export default function OrderCard({ order, children }) {
  const status = statusMeta[order.status] || { label: order.status, tone: "bg-white text-ink border-slate-200", step: 0 };
  const payment = paymentMeta[order.paymentStatus] || { label: order.paymentStatus, tone: "bg-white text-ink border-slate-200" };
  const activeStep = order.status === "cancelled" ? 0 : status.step;

  return (
    <div className="surface-panel p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="eyebrow">Order #{order.id}</div>
            <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{order.title}</h3>
            <p className="mt-3 text-sm leading-7 text-ink/64">{order.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${status.tone}`}>订单 {status.label}</span>
            <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${payment.tone}`}>支付 {payment.label}</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={<CircleDollarSign size={16} />} label="预算" value={formatCurrency(order.budget)} />
          <MetricCard icon={<Building2 size={16} />} label="企业" value={order.buyerOrg || order.buyerName || "--"} />
          <MetricCard icon={<GraduationCap size={16} />} label="高校团队" value={order.schoolOrg || order.schoolName || "待匹配"} />
          <MetricCard icon={<PackageSearch size={16} />} label="关联项目" value={order.agentName || "定制需求单"} />
          <MetricCard
            icon={<CalendarClock size={16} />}
            label="更新时间"
            value={new Date(order.updatedAt || order.createdAt).toLocaleDateString("zh-CN")}
          />
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-ink">订单进度</div>
            <div className="text-xs uppercase tracking-[0.2em] text-ink/42">{payment.label}</div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {orderStages.map((item, index) => {
              const stepIndex = index + 1;
              const done = activeStep >= stepIndex;
              return (
                <div
                  key={item}
                  className={`rounded-[18px] border px-4 py-3 ${
                    done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        done ? "bg-emerald-600 text-white" : "bg-slate-200 text-ink/60"
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

          {order.deliveryDeadline ? (
            <div className="mt-4 text-sm text-ink/58">期望交付时间：{new Date(order.deliveryDeadline).toLocaleDateString("zh-CN")}</div>
          ) : null}

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
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/42">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function formatCurrency(value) {
  if (!value) {
    return "待评估";
  }
  return `¥${(value / 100).toLocaleString("zh-CN")}`;
}
