import { LockKeyhole, Sparkles } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role, roles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section className="section-shell">
        <div className="hero-panel animate-rise-in p-8 md:p-10">
          <div className="relative z-10 max-w-2xl">
            <div className="data-chip">
              <Sparkles size={15} />
              Loading Session
            </div>
            <div className="mt-5 flex items-center gap-3 text-ink">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mist text-sky">
                <LockKeyhole size={18} />
              </div>
              <div>
                <div className="font-display text-2xl font-semibold">正在验证账户身份</div>
                <div className="mt-1 text-sm text-ink/62">确认当前登录状态和页面访问权限。</div>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="h-28 rounded-[1.5rem] bg-white/80 skeleton-shimmer" />
              <div className="h-28 rounded-[1.5rem] bg-white/80 skeleton-shimmer" />
              <div className="h-28 rounded-[1.5rem] bg-white/80 skeleton-shimmer" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  const allowedRoles = roles || (role ? [role] : []);
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
