import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "../api/client";

// What we expose to the app (no password)
export interface AuthUser {
  username: string;
  displayName: string;
  displayNameAr: string;
  role: "admin" | "viewer";
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "rashid-demo-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login: AuthContextValue["login"] = async (username, password) => {
    try {
      const result = await api.login(username, password);
      if (!result.ok) return { ok: false, error: result.error || "Invalid credentials" };
      setUser(result.user as AuthUser);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Login failed" };
    }
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// Hint chip(s) on the login screen — only the public demo credential is shown.
// The admin / rashid users still exist in the backend seed for internal use.
export const DEMO_CREDENTIALS = [
  { username: "demo", password: "demo", role: "viewer" as const },
];
