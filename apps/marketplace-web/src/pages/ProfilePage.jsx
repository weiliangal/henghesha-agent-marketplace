import { Bell, KeyRound, Mail, Phone, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../api/client";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import { useAuth } from "../context/AuthContext";

const notificationFilters = ["全部", "未读", "已读"];

export default function ProfilePage() {
  const { token, user, refreshMe } = useAuth();
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    organizationName: user?.organizationName || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [notificationFilter, setNotificationFilter] = useState("全部");
  const [notificationSearch, setNotificationSearch] = useState("");

  async function loadNotifications() {
    const data = await apiRequest("/notifications", { token });
    setNotifications(data.notifications || []);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    try {
      await apiRequest("/users/me", {
        method: "PATCH",
        token,
        body: profile,
      });
      await refreshMe();
      setMessage("个人资料已更新。");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updatePassword(event) {
    event.preventDefault();
    try {
      await apiRequest("/users/me/password", {
        method: "PATCH",
        token,
        body: passwordForm,
      });
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setMessage("密码已更新。");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function markRead(id) {
    await apiRequest(`/notifications/${id}/read`, {
      method: "PATCH",
      token,
    });
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
  }

  async function markAllRead() {
    await apiRequest("/notifications/read-all", {
      method: "PATCH",
      token,
    });
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  }

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const filteredNotifications = useMemo(() => {
    const term = notificationSearch.trim().toLowerCase();
    return notifications.filter((item) => {
      const filterPass =
        notificationFilter === "全部" ||
        (notificationFilter === "未读" && !item.isRead) ||
        (notificationFilter === "已读" && item.isRead);
      const searchPass = !term || [item.title, item.message].join(" ").toLowerCase().includes(term);
      return filterPass && searchPass;
    });
  }, [notificationFilter, notificationSearch, notifications]);

  const quickActions = roleQuickActions(user.role);

  return (
    <section className="section-shell">
      <div className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="relative z-10">
          <SectionHeader
            eyebrow="用户中心"
            title="资料、安全与通知集中在同一个清晰的个人工作台里"
            description="这里承载你的账户信息、密码安全和平台通知。角色不同，后续动作不同，但体验保持统一。"
            action={<div className="data-chip">{user.email}</div>}
          />
        </div>
      </div>

      {message ? <div className="mt-6 rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-3 text-sm text-ink/78">{message}</div> : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="角色" value={roleName(user.role)} icon={<UserRound size={18} />} />
        <Metric title="组织" value={profile.organizationName || "未填写"} icon={<Mail size={18} />} />
        <Metric title="手机号" value={profile.phone || "未填写"} icon={<Phone size={18} />} />
        <Metric title="未读通知" value={String(unreadCount)} icon={<Bell size={18} />} />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_0.96fr]">
        <div className="space-y-8">
          <div className="mesh-panel p-8">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink">快捷入口</h2>
                  <p className="mt-2 text-sm leading-7 text-ink/62">根据当前角色，直接进入最常用的操作区域。</p>
                </div>
                <span className="data-chip">{roleName(user.role)}</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {quickActions.map((item) => (
                  <Link key={item.to} to={item.to} className="glass-card card-hover p-5">
                    <div className="text-sm font-semibold text-ink">{item.label}</div>
                    <p className="mt-3 text-sm leading-7 text-ink/62">{item.text}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={saveProfile} className="mesh-panel p-8">
            <div className="relative z-10 space-y-5">
              <h2 className="font-display text-2xl font-semibold text-ink">个人资料</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="姓名">
                  <input className="input-base" value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} />
                </Field>
                <Field label="组织名称">
                  <input className="input-base" value={profile.organizationName} onChange={(event) => setProfile({ ...profile, organizationName: event.target.value })} />
                </Field>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="手机号">
                  <input className="input-base" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
                </Field>
                <Field label="头像 URL">
                  <input className="input-base" value={profile.avatarUrl} onChange={(event) => setProfile({ ...profile, avatarUrl: event.target.value })} />
                </Field>
              </div>
              <Field label="简介">
                <textarea rows="4" className="input-base" value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} />
              </Field>
              <button type="submit" className="button-primary">
                保存资料
              </button>
            </div>
          </form>

          <form onSubmit={updatePassword} className="mesh-panel p-8">
            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-sky">
                  <KeyRound size={18} />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink">修改密码</h2>
                  <p className="mt-1 text-sm text-ink/62">建议定期更新密码，保持账户安全。</p>
                </div>
              </div>

              <Field label="当前密码">
                <input
                  type="password"
                  className="input-base"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                />
              </Field>
              <Field label="新密码">
                <input
                  type="password"
                  className="input-base"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                />
              </Field>
              <button type="submit" className="button-primary">
                更新密码
              </button>
            </div>
          </form>
        </div>

        <div className="mesh-panel p-8">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">通知中心</h2>
                <p className="mt-2 text-sm leading-7 text-ink/62">订单、审核和支付状态更新后，消息会集中同步到这里。</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="data-chip">{notifications.length} 条</span>
                {unreadCount ? (
                  <button type="button" onClick={markAllRead} className="button-secondary">
                    全部已读
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/32" size={18} />
                <input
                  className="input-base pl-11"
                  value={notificationSearch}
                  onChange={(event) => setNotificationSearch(event.target.value)}
                  placeholder="搜索通知标题或内容"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {notificationFilters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setNotificationFilter(item)}
                    className={`pill-filter ${notificationFilter === item ? "bg-ink text-white" : "border border-white/80 bg-white/82 text-ink/68 hover:text-ink"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {filteredNotifications.length ? (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-[1.5rem] border p-5 ${
                      item.isRead ? "border-white/80 bg-white/84" : "border-amber-200 bg-amber-50/90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-ink">{item.title}</div>
                        <div className="mt-2 text-sm leading-7 text-ink/66">{item.message}</div>
                        <div className="mt-3 text-xs text-ink/42">{new Date(item.createdAt).toLocaleString("zh-CN")}</div>
                      </div>
                      {!item.isRead ? (
                        <button type="button" onClick={() => markRead(item.id)} className="button-secondary">
                          已读
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="暂时没有匹配通知" description="调整筛选条件后，这里会显示符合条件的消息内容。" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function Metric({ title, value, icon }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 text-sm text-ink/56">
        {icon}
        {title}
      </div>
      <div className="mt-4 font-display text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}

function roleName(role) {
  return {
    school: "学校",
    enterprise: "企业",
    admin: "管理员",
  }[role] || role;
}

function roleQuickActions(role) {
  if (role === "school") {
    return [
      { to: "/school/upload", label: "学校工作台", text: "继续上传智能体、维护案例图和交付资料。" },
      { to: "/orders", label: "查看订单", text: "处理学校侧收到的订单请求与交付进度。" },
    ];
  }

  if (role === "enterprise") {
    return [
      { to: "/templates", label: "模板中心", text: "先挑选标准模板，再决定采购还是定制开发。" },
      { to: "/orders", label: "订单中心", text: "查看支付状态、交付进度和平台反馈。" },
    ];
  }

  return [
    { to: "/admin", label: "管理后台", text: "审核智能体、订单和支付回执。" },
    { to: "/orders", label: "订单总览", text: "快速跳到订单页面查看整体流转状态。" },
  ];
}
