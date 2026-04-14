import { CheckCircle2, CreditCard, Inbox, Search, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../api/client";
import EmptyState from "../components/EmptyState";
import OrderCard from "../components/OrderCard";
import SectionHeader from "../components/SectionHeader";
import { useAuth } from "../context/AuthContext";

const statusFilters = ["全部", "待推进", "已付款", "已完成", "已取消"];
const paymentFilters = ["全部", "待提交回执", "待人工确认", "已确认", "已驳回"];

const statusLabelMap = {
  pending: "待推进",
  paid: "已付款",
  completed: "已完成",
  cancelled: "已取消",
};

const paymentLabelMap = {
  manual_pending: "待提交回执",
  submitted: "待人工确认",
  confirmed: "已确认",
  rejected: "已驳回",
};

export default function OrdersPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [paymentFilter, setPaymentFilter] = useState("全部");
  const [search, setSearch] = useState("");

  async function loadOrders() {
    const data = await apiRequest("/orders", { token });
    setOrders(data.orders || []);
  }

  useEffect(() => {
    loadOrders();
  }, [token]);

  async function submitPayment(orderId) {
    try {
      await apiRequest(`/orders/${orderId}`, {
        method: "PATCH",
        token,
        body: {
          paymentStatus: "submitted",
          paymentRemark: "企业已完成线下转账，并向平台提交人工确认申请。",
        },
      });
      setMessage("支付回执已提交，等待平台人工确认。");
      await loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function markCompleted(orderId) {
    try {
      await apiRequest(`/orders/${orderId}`, {
        method: "PATCH",
        token,
        body: { status: "completed" },
      });
      setMessage("订单已标记为完成。");
      await loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const statusPass = statusFilter === "全部" || statusLabelMap[order.status] === statusFilter;
      const paymentPass = paymentFilter === "全部" || paymentLabelMap[order.paymentStatus] === paymentFilter;
      const searchPass =
        !term ||
        [order.title, order.description, order.agentName, order.buyerOrg, order.schoolOrg]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      return statusPass && paymentPass && searchPass;
    });
  }, [orders, paymentFilter, search, statusFilter]);

  const stats = [
    { icon: <Inbox size={18} />, label: "全部订单", value: orders.length, note: "当前角色可见的订单总数" },
    { icon: <TimerReset size={18} />, label: "处理中", value: orders.filter((item) => item.status === "pending").length, note: "仍在审核或沟通推进阶段" },
    { icon: <CreditCard size={18} />, label: "待确认支付", value: orders.filter((item) => item.paymentStatus === "submitted").length, note: "已提交线下付款回执" },
    { icon: <CheckCircle2 size={18} />, label: "已完成", value: orders.filter((item) => item.status === "completed").length, note: "已完成交付与状态收口" },
  ];

  return (
    <section className="section-shell">
      <div className="hero-panel p-7 sm:p-8 lg:p-10">
        <SectionHeader
          eyebrow="订单中心"
          title="把状态、支付与交付进度集中到一个统一的协作视图里"
          description="不同角色看到的动作不同，但页面结构和信息层级保持一致。企业可提交付款回执，高校可确认交付完成，管理员则在后台完成审核闭环。"
          action={<div className="data-chip">当前角色：{roleName(user.role)}</div>}
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="metric-card">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="text-sky">{item.icon}</span>
                {item.label}
              </div>
              <div className="mt-3 font-display text-3xl font-semibold text-ink">{item.value}</div>
              <div className="mt-2 text-sm leading-6 text-ink/56">{item.note}</div>
            </div>
          ))}
        </div>
      </div>

      {message ? <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink/72">{message}</div> : null}

      <div className="mt-8 section-tint p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/32" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索订单标题、描述、企业、高校或项目名称"
              className="input-base pl-11"
            />
          </div>

          <select className="input-base" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statusFilters.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select className="input-base" value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
            {paymentFilters.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {filteredOrders.length ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm leading-7 text-ink/58">
                  {user.role === "enterprise" ? "企业可在订单推进后提交线下支付回执。" : null}
                  {user.role === "school" ? "高校在确认交付完成后，可将订单状态推进到完成。" : null}
                  {user.role === "admin" ? "管理员请前往后台统一审核订单与支付状态。" : null}
                </div>

                <div className="flex flex-wrap gap-3">
                  {user.role === "enterprise" && ["manual_pending", "rejected"].includes(order.paymentStatus) ? (
                    <button type="button" onClick={() => submitPayment(order.id)} className="button-primary">
                      提交支付回执
                    </button>
                  ) : null}

                  {user.role === "school" && order.status === "paid" ? (
                    <button type="button" onClick={() => markCompleted(order.id)} className="button-primary">
                      标记已完成
                    </button>
                  ) : null}

                  {user.role === "admin" ? (
                    <Link to="/admin" className="button-secondary">
                      去管理后台审核
                    </Link>
                  ) : null}
                </div>
              </div>
            </OrderCard>
          ))
        ) : (
          <EmptyState
            title="当前没有匹配的订单"
            description="可以调整筛选条件，或先去模板中心和项目广场发起新的采购需求。"
            action={
              <Link to="/templates" className="button-primary">
                去模板中心
              </Link>
            }
          />
        )}
      </div>
    </section>
  );
}

function roleName(role) {
  return {
    enterprise: "企业客户",
    school: "高校团队",
    admin: "平台管理",
  }[role] || role;
}
