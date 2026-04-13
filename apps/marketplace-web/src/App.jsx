import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import AgentDetailPage from "./pages/AgentDetailPage";
import AgentsPage from "./pages/AgentsPage";
import AuthPage from "./pages/AuthPage";
import CasesPage from "./pages/CasesPage";
import EnterpriseOrderPage from "./pages/EnterpriseOrderPage";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import SchoolUploadPage from "./pages/SchoolUploadPage";
import TemplatesPage from "./pages/TemplatesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/agents/:id" element={<AgentDetailPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/enterprise/orders/new"
          element={
            <ProtectedRoute role="enterprise">
              <EnterpriseOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/upload"
          element={
            <ProtectedRoute role="school">
              <SchoolUploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={["school", "enterprise", "admin"]}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["school", "enterprise", "admin"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
