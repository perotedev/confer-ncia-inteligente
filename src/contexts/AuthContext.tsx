import React, { createContext, useContext, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { User, UserRole } from "@/types/api";

export type { UserRole };
export type { User };

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadSession(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem("checkflow_token");
    const userJson = localStorage.getItem("checkflow_user");
    if (token && userJson) return { token, user: JSON.parse(userJson) as User };
  } catch {
    // dados corrompidos
  }
  return { user: null, token: null };
}

function saveSession(user: User, token: string) {
  localStorage.setItem("checkflow_token", token);
  localStorage.setItem("checkflow_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("checkflow_token");
  localStorage.removeItem("checkflow_user");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = loadSession();
  const [user, setUser] = useState<User | null>(session.user);
  const [token, setToken] = useState<string | null>(session.token);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post<{ data: { token: string; user: User } }>("/auth/login", { email, password });
      saveSession(data.data.user, data.data.token);
      setUser(data.data.user);
      setToken(data.data.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { data } = await api.post<{ data: { token: string; user: User } }>("/auth/register", { name, email, password, role });
      saveSession(data.data.user, data.data.token);
      setUser(data.data.user);
      setToken(data.data.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
