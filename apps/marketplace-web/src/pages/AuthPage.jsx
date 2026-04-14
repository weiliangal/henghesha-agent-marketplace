import { ArrowRight, Building2, GraduationCap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const initialRegister = {
  email: "",
  password: "",
  role: "enterprise",
  fullName: "",
  organizationName: "",
  phone: "",
  bio: "",
};

const roleCards = [
  {
    icon: <GraduationCap size={18} />,
    title: "高校团队",
    text: "上传智能体项目、维护案例资料、查看订单请求，并持续完善交付内容。",
  },
  {
    icon: <Building2 size={18} />,
    title: "企业客户",
    text: "浏览项目、发起定制需求、提交支付回执，并跟踪项目状态与交付进度。",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "平台管理",
    text: "审核项目上线、确认订单支付状态，并维护平台整体内容质量与流程秩序。",
  },
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (mode === "login") {
        const user = await login(loginForm);
        navigate(nextPath(user.role, location.state?.from));
      } else {
        const user = await register(registerForm);
        navigate(nextPath(user.role, location.state?.from));
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section-shell">
      <div className="grid gap-8 xl:grid-cols-[0.96fr_1.04fr]">
        <div className="hero-panel bg-[linear-gradient(180deg,#153a62,#1f5f95)] p-8 text-white shadow-[0_24px_60px_rgba(17,36,61,0.18)] md:p-10">
          <div className="section-label border-white/20 bg-white/10 text-white/88">统一登录入口</div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight md:text-5xl">进入平台工作台</h1>
          <p className="mt-5 text-sm leading-8 text-white/78">
            访客可以先浏览项目和案例；登录后，高校团队、企业客户和管理员将进入各自的工作台，但共享同一套项目展示、订单协作与审核流程。
          </p>

          <div className="mt-8 grid gap-4">
            {roleCards.map((item) => (
              <div key={item.title} className="rounded-[22px] border border-white/12 bg-white/10 p-5">
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12">{item.icon}</div>
                  {item.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-white/76">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[22px] border border-white/12 bg-white/10 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-white/60">演示账号</div>
            <div className="mt-4 space-y-2 text-sm text-white/82">
              <div>admin@henghesha.com / password123</div>
              <div>school@example.com / password123</div>
              <div>enterprise@example.com / password123</div>
            </div>
          </div>
        </div>

        <div className="hero-panel p-6 sm:p-8 md:p-10">
          <div className="flex flex-wrap gap-3">
            {[
              ["login", "登录"],
              ["register", "注册"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`pill-filter ${
                  mode === value ? "border-ink bg-ink text-white" : "border-slate-200 bg-white text-ink/68 hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {mode === "register" ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="姓名 / 联系方式">
                    <input
                      className="input-base"
                      value={registerForm.fullName}
                      onChange={(event) => setRegisterForm({ ...registerForm, fullName: event.target.value })}
                      required
                    />
                  </Field>
                  <Field label="角色">
                    <select
                      className="input-base"
                      value={registerForm.role}
                      onChange={(event) => setRegisterForm({ ...registerForm, role: event.target.value })}
                    >
                      <option value="enterprise">企业客户</option>
                      <option value="school">高校团队</option>
                    </select>
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="组织名称">
                    <input
                      className="input-base"
                      value={registerForm.organizationName}
                      onChange={(event) => setRegisterForm({ ...registerForm, organizationName: event.target.value })}
                    />
                  </Field>
                  <Field label="联系电话">
                    <input
                      className="input-base"
                      value={registerForm.phone}
                      onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })}
                    />
                  </Field>
                </div>

                <Field label="组织简介">
                  <textarea
                    rows="3"
                    className="input-base"
                    value={registerForm.bio}
                    onChange={(event) => setRegisterForm({ ...registerForm, bio: event.target.value })}
                  />
                </Field>
              </>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="邮箱">
                <input
                  type="email"
                  className="input-base"
                  value={mode === "login" ? loginForm.email : registerForm.email}
                  onChange={(event) =>
                    mode === "login"
                      ? setLoginForm({ ...loginForm, email: event.target.value })
                      : setRegisterForm({ ...registerForm, email: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="密码">
                <input
                  type="password"
                  className="input-base"
                  value={mode === "login" ? loginForm.password : registerForm.password}
                  onChange={(event) =>
                    mode === "login"
                      ? setLoginForm({ ...loginForm, password: event.target.value })
                      : setRegisterForm({ ...registerForm, password: event.target.value })
                  }
                  required
                />
              </Field>
            </div>

            {message ? <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div> : null}

            <button type="submit" disabled={submitting} className="button-primary w-full">
              {submitting ? "提交中..." : mode === "login" ? "登录并进入平台" : "注册并进入平台"}
              {!submitting ? <ArrowRight size={16} className="ml-2" /> : null}
            </button>
          </form>
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

function nextPath(role, fallback) {
  if (fallback) {
    return fallback;
  }
  if (role === "school") {
    return "/school/upload";
  }
  if (role === "enterprise") {
    return "/enterprise/orders/new";
  }
  if (role === "admin") {
    return "/admin";
  }
  return "/";
}
