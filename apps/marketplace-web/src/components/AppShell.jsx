import {
  ArrowRight,
  Blocks,
  Building2,
  LogOut,
  Menu,
  Package2,
  ShieldCheck,
  UserCircle2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const primaryNav = [
  { to: "/", label: "首页" },
  { to: "/agents", label: "项目广场" },
  { to: "/templates", label: "模板中心" },
  { to: "/cases", label: "成功案例" },
];

const metaByPath = [
  { match: /^\/$/, title: "恒河沙智能体交易网", description: "连接高校团队与企业客户的智能体成果展示、采购、定制与交付协作平台。" },
  { match: /^\/agents$/, title: "项目广场 | 恒河沙智能体交易网", description: "浏览平台已审核上线的智能体项目，按行业、价格与应用场景进行筛选。" },
  { match: /^\/templates$/, title: "模板中心 | 恒河沙智能体交易网", description: "通过标准模板快速发起企业采购或定制需求，降低立项与评估成本。" },
  { match: /^\/cases$/, title: "成功案例 | 恒河沙智能体交易网", description: "通过真实场景案例了解智能体项目的落地方式、交付边界与合作模式。" },
  { match: /^\/agents\/\d+$/, title: "项目详情 | 恒河沙智能体交易网", description: "查看项目能力、适用场景、案例素材、报价与采购入口。" },
  { match: /^\/auth$/, title: "登录 / 注册 | 恒河沙智能体交易网", description: "高校团队、企业客户与平台管理员统一登录入口。" },
  { match: /^\/enterprise\/orders\/new$/, title: "提交企业需求 | 恒河沙智能体交易网", description: "发布企业采购或定制需求，明确预算、交付周期与业务目标。" },
  { match: /^\/school\/upload$/, title: "高校团队入驻 | 恒河沙智能体交易网", description: "上传智能体成果、补充案例资料并进入平台审核流程。" },
  { match: /^\/orders$/, title: "订单中心 | 恒河沙智能体交易网", description: "统一查看订单状态、支付进度、交付节点与协作记录。" },
  { match: /^\/profile$/, title: "用户中心 | 恒河沙智能体交易网", description: "管理个人资料、账号安全和平台通知。" },
  { match: /^\/admin$/, title: "管理后台 | 恒河沙智能体交易网", description: "审核项目、订单与支付状态，维护平台内容质量与交易秩序。" },
];

function roleLabel(role) {
  return {
    admin: "平台管理",
    school: "高校团队",
    enterprise: "企业客户",
  }[role] || "访客";
}

function roleActions(user, isAuthenticated) {
  return [
    user?.role === "enterprise" ? { to: "/enterprise/orders/new", label: "发布需求" } : null,
    user?.role === "school" ? { to: "/school/upload", label: "团队入驻" } : null,
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
      <div className="border-b border-slate-200 bg-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 text-xs text-ink/58 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="section-label">高校成果转化平台</span>
            <span className="hidden md:inline">面向教育科技与企业服务的智能体展示、采购与交付协作平台</span>
          </div>
          <div className="hidden items-center gap-5 md:flex">
            <span>项目审核机制</span>
            <span>企业需求协同</span>
            <span>模板化采购入口</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="切换菜单"
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-ink md:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <NavLink to="/" className="group flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                <img src="/favicon.svg" alt="恒河沙智能体交易网" className="h-9 w-9" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/40">Henghesha Marketplace</div>
                <div className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">恒河沙智能体交易网</div>
              </div>
            </NavLink>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
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
                <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 md:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sky shadow-sm">
                    <UserCircle2 size={18} />
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-ink">{user.fullName}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-ink/42">{roleLabel(user.role)}</div>
                  </div>
                </div>
                <NavLink
                  to="/profile"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-ink transition hover:text-sky"
                  aria-label="用户中心"
                >
                  <UserCircle2 size={18} />
                </NavLink>
                <button
                  type="button"
                  onClick={logout}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-ink transition hover:text-ember"
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
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="grid gap-2">
              {[...primaryNav, ...secondaryNav].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive ? "bg-ink text-white" : "border border-slate-200 bg-slate-50 text-ink/72"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <div key={location.pathname} className="animate-rise-in">
          <Outlet />
        </div>
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="section-shell py-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="section-label">平台说明</div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
                让高校智能体成果以更可靠的方式进入企业场景
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-ink/66">
                平台围绕项目展示、采购决策、需求提交、审核上线与订单协作建立统一入口，帮助高校团队更规范地对外呈现成果，
                也帮助企业客户更高效地完成筛选、采购与沟通。
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <NavLink to="/agents" className="button-primary">
                  浏览项目广场
                </NavLink>
                <NavLink to="/enterprise/orders/new" className="button-secondary">
                  提交企业需求
                  <ArrowRight size={16} className="ml-2" />
                </NavLink>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FooterStat icon={<Package2 size={18} />} title="项目展示" text="围绕案例、适用场景、交付方式与报价体系组织内容。" />
              <FooterStat icon={<Blocks size={18} />} title="模板采购" text="企业可从标准模板切入，再延展为定制化项目。" />
              <FooterStat icon={<Building2 size={18} />} title="企业服务" text="支持需求提交、订单流转、支付确认与交付跟踪。" />
              <FooterStat icon={<ShieldCheck size={18} />} title="平台审核" text="建立统一审核机制，提升上线内容质量与可信度。" />
            </div>
          </div>

          <div className="soft-divider mt-10 pt-8">
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <div className="font-display text-lg font-semibold text-ink">恒河沙智能体交易网</div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">
                  面向高校团队、企业客户与平台管理者的智能体成果展示与服务协作平台。当前版本支持项目广场、
                  模板中心、企业需求提交、高校团队入驻与订单管理等核心链路。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FooterMiniLink to="/agents" label="项目广场" description="浏览已上线项目" />
                <FooterMiniLink to="/templates" label="模板中心" description="按模板快速采购" />
                <FooterMiniLink to="/cases" label="成功案例" description="了解落地场景" />
                <FooterMiniLink to="/school/upload" label="高校入驻" description="提交团队与项目" />
              </div>
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
        `rounded-full px-4 py-2.5 text-sm font-medium transition ${
          isActive ? "bg-slate-100 text-ink" : "text-ink/64 hover:text-ink"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function FooterStat({ icon, title, text }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="text-sky">{icon}</span>
        {title}
      </div>
      <p className="mt-3 text-sm leading-7 text-ink/60">{text}</p>
    </div>
  );
}

function FooterMiniLink({ to, label, description }) {
  return (
    <NavLink to={to} className="rounded-[20px] border border-slate-200 bg-white px-4 py-4 transition hover:-translate-y-0.5">
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="mt-1 text-sm text-ink/56">{description}</div>
    </NavLink>
  );
}
