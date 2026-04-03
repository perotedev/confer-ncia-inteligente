import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "operator" | "supervisor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: Record<string, User & { password: string }> = {
  "admin@checkflow.com": {
    id: "1",
    name: "Carlos Admin",
    email: "admin@checkflow.com",
    role: "admin",
    password: "admin123",
  },
  "supervisor@checkflow.com": {
    id: "2",
    name: "Ana Supervisora",
    email: "supervisor@checkflow.com",
    role: "supervisor",
    password: "super123",
  },
  "operador@checkflow.com": {
    id: "3",
    name: "João Operador",
    email: "operador@checkflow.com",
    role: "operator",
    password: "oper123",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("checkflow_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const found = MOCK_USERS[email.toLowerCase()];
    if (!found || found.password !== password) {
      setIsLoading(false);
      throw new Error("E-mail ou senha inválidos");
    }
    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem("checkflow_user", JSON.stringify(userData));
    setIsLoading(false);
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string, role: UserRole) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (MOCK_USERS[email.toLowerCase()]) {
      setIsLoading(false);
      throw new Error("Este e-mail já está cadastrado");
    }
    const newUser: User = { id: crypto.randomUUID(), name, email, role };
    setUser(newUser);
    localStorage.setItem("checkflow_user", JSON.stringify(newUser));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("checkflow_user");
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    // Mock — always succeeds
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
