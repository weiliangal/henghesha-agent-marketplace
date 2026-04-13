import { ArrowRight, Building2, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
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
    title: "学校",
    text: "上传智能体、维护案例资料、查看订单请求，并持续完善交付内容。",
  },
  {
    icon: <Building2 size={18} />,
    title: "企业",
    text: "浏览智能体、发起定制、提交支付回执并跟踪交易状态。",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "管理员",
    text: "审核智能体上线、确认订单支付状态，并管理平台整体流转。",
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
      <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2.2rem] bg-[linear-gradient(145deg,#07111f_0%,#0d5c9c_46%,#0f766e_100%)] p-8 text-white shadow-luxe md:p-10">
          <div className="max-w-2xl">
            <div className="data-chip border-white/12 bg-white/12 text-white">
              <Sparkles size={15} />
              Unified Access
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight md:text-5xl">登录平台工作台</h1>
            <p className="mt-5 text-sm leading-8 text-white/80">
              访客可以先浏览智能体和案例；登录后，学校、企业和管理员将进入各自的工作界面，
              但共享同一套品牌视觉和交易流程。
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            {roleCards.map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/14">{item.icon}</div>
                  {item.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-white/76">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.7rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.28em] text-white/62">Demo Accounts</div>
            <div className="mt-4 space-y-2 text-sm text-white/84">
              <div>admin@henghesha.com / password123</div>
              <div>school@example.com / password123</div>
              <div>enterprise@example.com / password123</div>
            </div>
          </div>
        </div>

        <div className="hero-panel p-6 sm:p-8 md:p-10">
          <div className="relative z-10">
            <div className="flex flex-wrap gap-3">
              {[
                ["login", "登录"],
                ["register", "注册"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`pill-filter ${mode === value ? "bg-ink text-white" : "border border-white/80 bg-white/82 text-ink/68 hover:text-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {mode === "register" ? (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="姓名 / 联系人">
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
                        <option value="enterprise">企业</option>
                        <option value="school">学校</option>
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

                  <Field label="个人简介">
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

              {message ? (
                <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {message}
                </div>
              ) : null}

              <button type="submit" disabled={submitting} className="button-primary w-full">
                {submitting ? "提交中..." : mode === "login" ? "登录并进入平台" : "注册并进入平台"}
                {!submitting ? <ArrowRight size={16} className="ml-2" /> : null}
              </button>
            </form>
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
