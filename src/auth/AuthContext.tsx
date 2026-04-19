import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// ---- Fake users for demo only. Anyone can read this file in DevTools. ----
// Do NOT use this for anything real. It exists so stakeholders can log in.
interface DemoUser {
  username: string;
  password: string;
  displayName: string;
  displayNameAr: string;
  role: "admin" | "viewer";
}

const DEMO_USERS: DemoUser[] = [
  { username: "admin",  password: "admin123",   displayName: "Admin User",   displayNameAr: "المسؤول",  role: "admin"  },
  { username: "demo",   password: "demo",       displayName: "Demo User",    displayNameAr: "مستخدم تجريبي", role: "viewer" },
  { username: "rashid", password: "rashid2025", displayName: "Rashid Reviewer", displayNameAr: "مراجع راشد", role: "viewer" },
];

// ---- What we expose to the app (no password!) ----
export interface AuthUser {
  username: string;
  displayName: string;
  displayNameAr: string;
  role: "admin" | "viewer";
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "rashid-demo-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Restore session on page load (refresh-safe)
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  // Keep storage in sync
  useEffect(() => {
    if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login: AuthContextValue["login"] = (username, password) => {
    const match = DEMO_USERS.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (!match) return { ok: false, error: "Invalid username or password" };
    const { password: _pw, ...safe } = match;
    setUser(safe);
    return { ok: true };
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// Exported so the Login screen can show hint chips
export const DEMO_CREDENTIALS = DEMO_USERS.map(({ username, password, role }) => ({
  username,
  password,
  role,
}));
