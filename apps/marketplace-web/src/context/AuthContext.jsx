import { createContext, useContext, useEffect, useState } from "react";

import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("marketplace_token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    apiRequest("/auth/profile", { token })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("marketplace_token");
        setToken("");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  async function login(payload) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: payload,
    });
    localStorage.setItem("marketplace_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: payload,
    });
    localStorage.setItem("marketplace_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("marketplace_token");
    setToken("");
    setUser(null);
  }

  async function refreshMe() {
    if (!token) {
      return null;
    }
    const data = await apiRequest("/auth/profile", { token });
    setUser(data.user);
    return data.user;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必须在 AuthProvider 内使用。");
  }
  return context;
}
