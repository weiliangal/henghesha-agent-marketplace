import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  Building2,
  LogOut,
  Menu,
  Package2,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const primaryNav = [
  { to: "/", label: "首页" },
  { to: "/agents", label: "智能体库" },
  { to: "/templates", label: "模板中心" },
  { to: "/cases", label: "成功案例" },
];

const metaByPath = [
  { match: /^\/$/, title: "恒河沙智能体交易网", description: "连接高校与企业的智能体成果展示、交易、定制与交付平台。" },
  { match: /^\/agents$/, title: "智能体库 | 恒河沙智能体交易网", description: "浏览已审核上线的智能体，按分类、价格区间和关键词快速筛选。" },
  { match: /^\/templates$/, title: "模板中心 | 恒河沙智能体交易网", description: "从标准模板快速启动企业采购或定制开发项目。" },
  { match: /^\/agents\/\d+$/, title: "智能体详情 | 恒河沙智能体交易网", description: "查看智能体能力、价格、案例素材和下单入口。" },
  { match: /^\/cases$/, title: "成功案例 | 恒河沙智能体交易网", description: "通过 Demo 与行业案例了解智能体适用场景与交付方式。" },
  { match: /^\/auth$/, title: "登录 / 注册 | 恒河沙智能体交易网", description: "学校、企业与管理员统一登录入口。" },
  { match: /^\/enterprise\/orders\/new$/, title: "发布订单 | 恒河沙智能体交易网", description: "企业提交采购需求、附件与交付要求。" },
  { match: /^\/school\/upload$/, title: "学校工作台 | 恒河沙智能体交易网", description: "上传智能体、编辑资料、查看收到的订单请求。" },
  { match: /^\/orders$/, title: "订单中心 | 恒河沙智能体交易网", description: "统一查看订单状态、支付进度与交付动态。" },
  { match: /^\/profile$/, title: "用户中心 | 恒河沙智能体交易网", description: "管理个人资料、安全设置与系统通知。" },
  { match: /^\/admin$/, title: "管理后台 | 恒河沙智能体交易网", description: "审核智能体、订单与用户状态。" },
];

function roleLabel(role) {
  return {
    admin: "管理员",
    school: "学校",
    enterprise: "企业",
  }[role] || "访客";
}

function roleActions(user, isAuthenticated) {
  return [
    user?.role === "enterprise" ? { to: "/enterprise/orders/new", label: "发布需求" } : null,
    user?.role === "school" ? { to: "/school/upload", label: "学校工作台" } : null,
    isAuthenticated ? { to: "/orders", label: "订单中心" } : null,
    user?.role === "admin" ? { to: "/admin", label: "管理后台" } : null,
  ].filter(Boolean);
}

export default function AppShell() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const secondaryNav = roleActions(user, isAuthenticated);

  useEffect(() => {
    const current = metaByPath.find((item) => item.match.test(location.pathname)) || metaByPath[0];
    document.title = current.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", current.description);
    }
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/40 bg-aurora text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 tracking-[0.24em] text-white/72">
            <Sparkles size={14} />
            HENGHESHA AGENT MARKETPLACE
          </div>
          <div className="hidden items-center gap-6 text-white/68 md:flex">
            <span>高校成果商品化</span>
            <span>企业采购转化</span>
            <span>模板选型与定制交付</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
        <div className="mx-auto max-w-7xl">
          <div className="glass-card flex items-center justify-between gap-4 rounded-[1.8rem] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="切换菜单"
                onClick={() => setMobileOpen((value) => !value)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white/88 text-ink md:hidden"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <NavLink to="/" className="group flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_18px_36px_rgba(9,20,38,0.16)]">
                  <img src="/favicon.svg" alt="恒河沙智能体交易网" className="h-9 w-9" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink/40">Marketplace</div>
                  <div className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">恒河沙智能体交易网</div>
                </div>
              </NavLink>
            </div>

            <nav className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/68 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] md:flex">
              {primaryNav.map((item) => (
                <AppNavLink key={item.to} to={item.to}>
                  {item.label}
                </AppNavLink>
              ))}
              {secondaryNav.map((item) => (
                <AppNavLink key={item.to} to={item.to}>
                  {item.label}
                </AppNavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <>
                  <div className="hidden items-center gap-3 rounded-full border border-white/80 bg-white/82 px-3 py-2 md:flex">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-sky">
                      <UserCircle2 size={18} />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-semibold text-ink">{user.fullName}</div>
                      <div className="text-xs uppercase tracking-[0.22em] text-ink/45">{roleLabel(user.role)}</div>
                    </div>
                  </div>
                  <NavLink
                    to="/profile"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/82 text-ink transition hover:text-sky"
                    aria-label="用户中心"
                  >
                    <UserCircle2 size={18} />
                  </NavLink>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/82 text-ink transition hover:text-ember"
                    aria-label="退出登录"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <NavLink to="/auth" className="button-primary">
                  登录 / 注册
                </NavLink>
              )}
            </div>
          </div>

          {mobileOpen ? (
            <div className="glass-card mt-3 rounded-[1.8rem] p-4 md:hidden">
              <div className="grid gap-2">
                {[...primaryNav, ...secondaryNav].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isActive ? "bg-ink text-white" : "bg-white/86 text-ink/72"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main>
        <div key={location.pathname} className="animate-rise-in">
          <Outlet />
        </div>
      </main>

      <footer className="mt-20 pb-10">
        <div className="section-shell pb-6">
          <div className="hero-panel p-8 md:p-10">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <div className="data-chip">
                  <BadgeCheck size={16} />
                  Ready To Launch
                </div>
                <h2 className="mt-5 max-w-3xl font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                  让高校智能体成果从展示页，真正走向交易与交付
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-ink/68">
                  平台把学校上传、企业采购、模板选型、管理员审核和手动支付确认串成一条完整链路，
                  让展示、信任与成交发生在同一个站点里。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FooterStat icon={<Package2 size={18} />} title="智能体库" text="推荐、筛选、详情、案例与价格体系统一呈现" />
                <FooterStat icon={<Blocks size={18} />} title="模板中心" text="先选择标准模板，再延展成企业定制方案" />
                <FooterStat icon={<Building2 size={18} />} title="企业采购" text="浏览现货、下单定制、提交支付回执与状态追踪" />
                <FooterStat icon={<ShieldCheck size={18} />} title="审核闭环" text="学校上传后进入审核，管理员确认上线与支付状态" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <NavLink to="/agents" className="button-primary">
                浏览智能体
              </NavLink>
              <NavLink to="/templates" className="button-secondary">
                查看模板
              </NavLink>
              <NavLink to="/enterprise/orders/new" className="button-secondary">
                发起定制
                <ArrowRight size={16} className="ml-2" />
              </NavLink>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="font-display text-lg font-semibold text-ink">恒河沙智能体交易网</div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/64">
                面向高校、企业与平台管理员的智能体交易网站。我们把国际 SaaS 的清爽感和 AI
                产品的未来感结合起来，做成一个真正像成品而不是原型的交易平台。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FooterMiniLink to="/agents" label="智能体库" description="查看全部智能体" />
              <FooterMiniLink to="/templates" label="模板中心" description="先选模板再定制" />
              <FooterMiniLink to="/cases" label="成功案例" description="浏览 Demo 与场景说明" />
              <FooterMiniLink to="/orders" label="订单中心" description="查看交易状态与流转" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AppNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2.5 text-sm font-semibold transition ${
          isActive ? "bg-ink text-white shadow-[0_12px_28px_rgba(7,17,31,0.18)]" : "text-ink/70 hover:text-ink"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function FooterStat({ icon, title, text }) {
  return (
    <div className="rounded-[1.6rem] border border-white/80 bg-white/76 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="text-sky">{icon}</span>
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-ink/66">{text}</p>
    </div>
  );
}

function FooterMiniLink({ to, label, description }) {
  return (
    <NavLink to={to} className="rounded-[1.45rem] border border-white/70 bg-white/72 px-4 py-4 transition hover:-translate-y-0.5">
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="mt-1 text-sm text-ink/58">{description}</div>
    </NavLink>
  );
}
