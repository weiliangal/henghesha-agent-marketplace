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
  }, []);

  async function updateAgent(id, status, featured = false) {
    try {
      await apiRequest(`/admin/agents/${id}`, {
        method: "PATCH",
        token,
        body: { status, featured },
      });
      setMessage(`智能体 #${id} 已更新为 ${status === "approved" ? "审核通过" : "已驳回"}。`);
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
    { icon: <UsersRound size={18} />, label: "用户总数", value: dashboardStats?.users ?? users.length },
    { icon: <Shield size={18} />, label: "待审智能体", value: dashboardStats?.pendingAgents ?? agents.filter((item) => item.status === "pending").length },
    { icon: <WalletCards size={18} />, label: "待确认支付", value: dashboardStats?.submittedPayments ?? orders.filter((item) => item.paymentStatus === "submitted").length },
    { icon: <CheckCircle2 size={18} />, label: "已完成订单", value: dashboardStats?.completedOrders ?? orders.filter((item) => item.status === "completed").length },
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
      if (agentFilter === "全部") {
        return true;
      }
      if (agentFilter === "待审核") {
        return agent.status === "pending";
      }
      if (agentFilter === "已通过") {
        return agent.status === "approved";
      }
      return agent.status === "rejected";
    });
  }, [agentFilter, agents]);

  const filteredOrders = useMemo(() => {
    const term = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const orderStatusLabel =
        order.status === "pending" ? "待推进" : order.status === "paid" ? "已付款" : order.status === "completed" ? "已完成" : order.status;
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
      <div className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="relative z-10">
          <SectionHeader
            eyebrow="管理后台"
            title="审核智能体、订单与支付状态的统一工作台"
            description="后台需要足够清晰、足够可信，也要和前台保持同一套品牌语言。管理员在这里完成平台最关键的审核动作。"
            action={<div className="data-chip">最近操作 {logs.length} 条</div>}
          />
        </div>
      </div>

      {message ? <div className="mt-6 rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-3 text-sm text-ink/78">{message}</div> : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <div key={item.label} className="glass-card p-5">
            <div className="flex items-center gap-2 text-sm text-ink/56">
              {item.icon}
              {item.label}
            </div>
            <div className="mt-4 font-display text-3xl font-semibold text-ink">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8">
        <section className="mesh-panel p-8">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">用户管理</h2>
                <p className="mt-2 text-sm leading-7 text-ink/62">查看平台中的学校、企业与管理员账户信息，并管理账号状态。</p>
              </div>
              <span className="data-chip">{filteredUsers.length} 位用户</span>
            </div>

            <div className="mt-6 relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/32" size={18} />
              <input className="input-base pl-11" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="搜索邮箱、姓名、组织或角色" />
            </div>

            <div className="mt-6 overflow-x-auto rounded-[1.7rem] border border-white/80 bg-white/86">
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
                        <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink/70">{roleLabel(user.role)}</span>
                      </td>
                      <td className="px-5 py-4">{user.fullName}</td>
                      <td className="px-5 py-4">{user.organizationName || "--"}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.status === "disabled" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {user.status === "disabled" ? "已禁用" : "正常"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {user.role !== "admin" ? (
                            <>
                              <button type="button" onClick={() => updateUserStatus(user.id, user.status === "disabled" ? "active" : "disabled")} className="button-secondary">
                                {user.status === "disabled" ? "恢复" : "禁用"}
                              </button>
                              <button type="button" onClick={() => deleteUser(user.id)} className="button-secondary text-rose-700">
                                删除
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-ink/45">管理员账号保留</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mesh-panel p-8">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">智能体审核</h2>
                <p className="mt-2 text-sm leading-7 text-ink/62">优先查看待审核智能体，决定是否上线和是否推荐展示。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {agentFilters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAgentFilter(item)}
                    className={`pill-filter ${agentFilter === item ? "bg-ink text-white" : "border border-white/80 bg-white/82 text-ink/68 hover:text-ink"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {filteredAgents.length ? (
                filteredAgents.map((agent) => (
                  <div key={agent.id} className="rounded-[1.7rem] border border-white/80 bg-white/84 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-2xl">
                        <div className="font-display text-2xl font-semibold text-ink">{agent.name}</div>
                        <div className="mt-3 text-sm leading-7 text-ink/66">{agent.summary}</div>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-sand px-3 py-1 text-ink/70">{agent.category}</span>
                          <span className="rounded-full bg-ink px-3 py-1 text-white">{statusLabel(agent.status)}</span>
                          {agent.featured ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">推荐展示</span> : null}
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
                <EmptyState title="没有匹配的智能体" description="切换筛选条件后，这里会显示对应状态的审核项目。" />
              )}
            </div>
          </div>
        </section>

        <section className="mesh-panel p-8">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">订单审核与支付确认</h2>
                <p className="mt-2 text-sm leading-7 text-ink/62">优先处理待人工确认的支付回执，再推进交付和完成状态。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {orderFilters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setOrderFilter(item)}
                    className={`pill-filter ${orderFilter === item ? "bg-ink text-white" : "border border-white/80 bg-white/82 text-ink/68 hover:text-ink"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/32" size={18} />
              <input className="input-base pl-11" value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="搜索订单标题、企业、学校或关联智能体" />
            </div>

            <div className="mt-6 space-y-4">
              {filteredOrders.length ? (
                filteredOrders.map((order) => (
                  <div key={order.id} className="rounded-[1.7rem] border border-white/80 bg-white/84 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-2xl">
                        <div className="font-display text-2xl font-semibold text-ink">{order.title}</div>
                        <div className="mt-3 text-sm leading-7 text-ink/66">{order.description}</div>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-sand px-3 py-1 text-ink/70">订单 {statusLabel(order.status)}</span>
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">支付 {paymentLabel(order.paymentStatus)}</span>
                          <span className="rounded-full bg-white px-3 py-1 text-ink/62">预算 ¥{(order.budget / 100).toLocaleString("zh-CN")}</span>
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
          </div>
        </section>

        <section className="mesh-panel p-8">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">最近审核记录</h2>
                <p className="mt-2 text-sm leading-7 text-ink/62">帮助管理员快速回顾最近做过的审核与支付处理动作。</p>
              </div>
              <span className="data-chip">
                <Sparkles size={15} />
                Audit Trail
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {logs.length ? (
                logs.map((log) => (
                  <div key={log.id} className="rounded-[1.4rem] border border-white/80 bg-white/82 px-5 py-4">
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
                <EmptyState title="暂时还没有审核记录" description="管理员完成审核动作后，这里会自动同步显示最新记录。" />
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function roleLabel(role) {
  return {
    admin: "管理员",
    school: "学校",
    enterprise: "企业",
  }[role] || role;
}

function statusLabel(status) {
  return {
    pending: "待审核 / 待推进",
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
