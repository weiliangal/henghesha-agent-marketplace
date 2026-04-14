import { CheckCircle2, Search, Shield, Sparkles, UsersRound, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "../api/client";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import { useAuth } from "../context/AuthContext";

const agentFilters = ["全部", "待审核", "已通过", "已驳回"];
const orderFilters = ["全部", "待推进", "已付款", "已完成"];

export default function AdminPage() {
  const { token } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("全部");
  const [orderFilter, setOrderFilter] = useState("全部");
  const [orderSearch, setOrderSearch] = useState("");

  async function loadAll() {
    const [statsData, usersData, agentsData, ordersData, logsData] = await Promise.all([
      apiRequest("/admin/stats", { token }),
      apiRequest("/admin/users", { token }),
      apiRequest("/admin/agents", { token }),
      apiRequest("/admin/orders", { token }),
      apiRequest("/admin/audit-logs", { token }),
    ]);
    setDashboardStats(statsData.stats || null);
    setUsers(usersData.users || []);
    setAgents(agentsData.agents || []);
    setOrders(ordersData.orders || []);
    setLogs(logsData.logs || []);
  }

  useEffect(() => {
    loadAll();
  }, [token]);

  async function updateAgent(id, status, featured = false) {
    try {
      await apiRequest(`/admin/agents/${id}`, {
        method: "PATCH",
        token,
        body: { status, featured },
      });
      setMessage(`项目 #${id} 已更新为${status === "approved" ? "审核通过" : "已驳回"}。`);
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateOrder(id, payload, successText) {
    try {
      await apiRequest(`/admin/orders/${id}`, {
        method: "PATCH",
        token,
        body: payload,
      });
      setMessage(successText);
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateUserStatus(id, status) {
    try {
      await apiRequest(`/admin/users/${id}/status`, {
        method: "PATCH",
        token,
        body: { status },
      });
      setMessage(`用户 #${id} 已更新为${status === "active" ? "正常" : "禁用"}状态。`);
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteUser(id) {
    try {
      await apiRequest(`/admin/users/${id}`, {
        method: "DELETE",
        token,
      });
      setMessage(`用户 #${id} 已删除。`);
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const metrics = [
    { icon: <UsersRound size={18} />, label: "用户总数", value: dashboardStats?.users ?? users.length, note: "平台账户总量" },
    {
      icon: <Shield size={18} />,
      label: "待审核项目",
      value: dashboardStats?.pendingAgents ?? agents.filter((item) => item.status === "pending").length,
      note: "等待管理员确认上线",
    },
    {
      icon: <WalletCards size={18} />,
      label: "待确认支付",
      value: dashboardStats?.submittedPayments ?? orders.filter((item) => item.paymentStatus === "submitted").length,
      note: "需要人工确认回执",
    },
    {
      icon: <CheckCircle2 size={18} />,
      label: "已完成订单",
      value: dashboardStats?.completedOrders ?? orders.filter((item) => item.status === "completed").length,
      note: "已进入交付完成状态",
    },
  ];

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return users.filter((user) => {
      if (!term) {
        return true;
      }
      return [user.email, user.fullName, user.organizationName, user.role].filter(Boolean).join(" ").toLowerCase().includes(term);
    });
  }, [userSearch, users]);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      if (agentFilter === "全部") return true;
      if (agentFilter === "待审核") return agent.status === "pending";
      if (agentFilter === "已通过") return agent.status === "approved";
      return agent.status === "rejected";
    });
  }, [agentFilter, agents]);

  const filteredOrders = useMemo(() => {
    const term = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const orderStatusLabel = statusLabel(order.status);
      const filterPass = orderFilter === "全部" || orderStatusLabel === orderFilter;
      const searchPass =
        !term ||
        [order.title, order.description, order.buyerOrg, order.schoolOrg, order.agentName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      return filterPass && searchPass;
    });
  }, [orderFilter, orderSearch, orders]);

  return (
    <section className="section-shell">
      <div className="hero-panel p-7 sm:p-8 lg:p-10">
        <SectionHeader
          eyebrow="管理后台"
          title="审核项目、订单与支付状态的统一运营工作台"
          description="后台需要足够清晰、可追溯，也要和前台保持一致的品牌语言。管理员在这里完成平台最关键的审核动作。"
          action={<div className="data-chip">最近操作 {logs.length} 条</div>}
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => (
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

      <div className="mt-10 grid gap-8">
        <section className="surface-panel p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="section-label">用户管理</div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">查看并维护平台用户状态</h2>
              <p className="mt-3 text-sm leading-7 text-ink/62">这里集中查看高校、企业与管理员账户，并处理禁用、恢复和删除动作。</p>
            </div>
            <span className="data-chip">{filteredUsers.length} 位用户</span>
          </div>

          <div className="mt-6 relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/32" size={18} />
            <input
              className="input-base pl-11"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="搜索邮箱、姓名、组织或角色"
            />
          </div>

          <div className="mt-6 overflow-x-auto rounded-[22px] border border-slate-200 bg-white">
            <table className="premium-table">
              <thead>
                <tr>
                  <th className="px-5 py-4">邮箱</th>
                  <th className="px-5 py-4">角色</th>
                  <th className="px-5 py-4">姓名</th>
                  <th className="px-5 py-4">组织</th>
                  <th className="px-5 py-4">状态</th>
                  <th className="px-5 py-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-ink/70">{roleLabel(user.role)}</span>
                    </td>
                    <td className="px-5 py-4">{user.fullName}</td>
                    <td className="px-5 py-4">{user.organizationName || "--"}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          user.status === "disabled" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {user.status === "disabled" ? "已禁用" : "正常"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.role !== "admin" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => updateUserStatus(user.id, user.status === "disabled" ? "active" : "disabled")}
                              className="button-secondary"
                            >
                              {user.status === "disabled" ? "恢复" : "禁用"}
                            </button>
                            <button type="button" onClick={() => deleteUser(user.id)} className="button-secondary text-rose-700">
                              删除
                            </button>
                          </>
                        ) : (
                          <span className="text-sm text-ink/45">管理员账户保留</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface-panel p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="section-label">项目审核</div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">审核项目上线与推荐展示</h2>
              <p className="mt-3 text-sm leading-7 text-ink/62">优先查看待审核项目，再决定是否上线以及是否进入首页推荐区。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {agentFilters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAgentFilter(item)}
                  className={`pill-filter ${
                    agentFilter === item ? "border-ink bg-ink text-white" : "border-slate-200 bg-white text-ink/66 hover:text-ink"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredAgents.length ? (
              filteredAgents.map((agent) => (
                <div key={agent.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <h3 className="font-display text-2xl font-semibold text-ink">{agent.name}</h3>
                      <div className="mt-3 text-sm leading-7 text-ink/64">{agent.summary}</div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="section-label">{agent.category}</span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink/60">{statusLabel(agent.status)}</span>
                        {agent.featured ? <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">首页推荐</span> : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => updateAgent(agent.id, "approved", true)} className="button-primary">
                        通过并推荐
                      </button>
                      <button type="button" onClick={() => updateAgent(agent.id, "approved", false)} className="button-secondary">
                        仅通过
                      </button>
                      <button type="button" onClick={() => updateAgent(agent.id, "rejected", false)} className="button-secondary">
                        驳回
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="没有匹配的项目" description="切换筛选条件后，这里会显示对应状态的审核项目。" />
            )}
          </div>
        </section>

        <section className="surface-panel p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="section-label">订单与支付</div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">审核订单状态和线下支付回执</h2>
              <p className="mt-3 text-sm leading-7 text-ink/62">优先处理待人工确认的支付回执，再推进订单进入付款与完成状态。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {orderFilters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setOrderFilter(item)}
                  className={`pill-filter ${
                    orderFilter === item ? "border-ink bg-ink text-white" : "border-slate-200 bg-white text-ink/66 hover:text-ink"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/32" size={18} />
            <input
              className="input-base pl-11"
              value={orderSearch}
              onChange={(event) => setOrderSearch(event.target.value)}
              placeholder="搜索订单标题、企业、高校或关联项目"
            />
          </div>

          <div className="mt-6 space-y-4">
            {filteredOrders.length ? (
              filteredOrders.map((order) => (
                <div key={order.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <h3 className="font-display text-2xl font-semibold text-ink">{order.title}</h3>
                      <div className="mt-3 text-sm leading-7 text-ink/64">{order.description}</div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink/60">订单 {statusLabel(order.status)}</span>
                        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm text-amber-700">支付 {paymentLabel(order.paymentStatus)}</span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink/60">
                          预算 {formatCurrency(order.budget)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateOrder(
                            order.id,
                            {
                              status: "paid",
                              paymentStatus: "confirmed",
                              payMethod: "manual_transfer",
                              remark: "管理员已确认线下到账。",
                            },
                            `订单 #${order.id} 已确认付款。`,
                          )
                        }
                        className="button-primary"
                      >
                        确认支付
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateOrder(
                            order.id,
                            {
                              status: "pending",
                              paymentStatus: "rejected",
                              payMethod: "manual_transfer",
                              remark: "支付回执信息不完整，请重新提交。",
                            },
                            `订单 #${order.id} 的支付回执已驳回。`,
                          )
                        }
                        className="button-secondary"
                      >
                        驳回回执
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateOrder(
                            order.id,
                            {
                              status: "completed",
                              paymentStatus: order.paymentStatus,
                              payMethod: "manual_transfer",
                              remark: "管理员确认订单已完成交付。",
                            },
                            `订单 #${order.id} 已标记为完成。`,
                          )
                        }
                        className="button-secondary"
                      >
                        标记完成
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="没有匹配的订单" description="切换筛选条件或搜索词后，这里会显示符合条件的订单。" />
            )}
          </div>
        </section>

        <section className="surface-panel p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="section-label">审核记录</div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">最近审核动作留痕</h2>
              <p className="mt-3 text-sm leading-7 text-ink/62">帮助管理员快速回顾最近处理过的项目、订单和支付操作。</p>
            </div>
            <span className="data-chip">
              <Sparkles size={15} />
              Audit Trail
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {logs.length ? (
              logs.map((log) => (
                <div key={log.id} className="rounded-[20px] border border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-ink">
                        {log.action}
                        <span className="ml-2 text-ink/45">
                          {log.targetTable} #{log.targetId}
                        </span>
                      </div>
                      <div className="mt-2 text-sm leading-7 text-ink/62">
                        操作人：{log.adminName || log.adminEmail || `管理员 #${log.adminId}`}
                        {log.notes ? ` · ${log.notes}` : ""}
                      </div>
                    </div>
                    <div className="text-sm text-ink/48">{new Date(log.timestamp).toLocaleString("zh-CN")}</div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="暂时还没有审核记录" description="管理员完成审核动作后，这里会自动显示最新留痕。" />
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function roleLabel(role) {
  return {
    admin: "平台管理",
    school: "高校团队",
    enterprise: "企业客户",
  }[role] || role;
}

function statusLabel(status) {
  return {
    pending: "待推进",
    approved: "已通过",
    rejected: "已驳回",
    paid: "已付款",
    completed: "已完成",
  }[status] || status;
}

function paymentLabel(status) {
  return {
    manual_pending: "待提交回执",
    submitted: "待人工确认",
    confirmed: "已确认",
    rejected: "已驳回",
  }[status] || status;
}

function formatCurrency(value) {
  if (!value) {
    return "待评估";
  }
  return `¥${(value / 100).toLocaleString("zh-CN")}`;
}
