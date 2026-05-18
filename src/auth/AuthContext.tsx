import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ---- Hardcoded demo credential. No DB, no users API. ----
// Anyone reading this file in DevTools can see them — this is intentional
// for a leadership demo build. Do NOT use for anything beyond the PoC.
const ADMIN_USERNAME = "admin";
const ADMIN_PASSCODE = "admin";

export interface AuthUser {
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, passcode: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "mbs-ct-auth";

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

  const login: AuthContextValue["login"] = (username, passcode) => {
    const u = username.trim().toLowerCase();
    if (u === ADMIN_USERNAME && passcode === ADMIN_PASSCODE) {
      setUser({ username: ADMIN_USERNAME });
      return { ok: true };
    }
    return { ok: false, error: "Invalid username or passcode" };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
