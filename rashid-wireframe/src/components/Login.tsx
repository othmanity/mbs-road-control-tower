import { useState } from "react";
import { useAuth, DEMO_CREDENTIALS } from "../auth/AuthContext";

interface LoginProps {
  lang: "en" | "ar";
  onToggleLang: () => void;
}

export default function Login({ lang, onToggleLang }: LoginProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const t = (en: string, ar: string) => (lang === "en" ? en : ar);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(username, password);
    if (!result.ok) {
      setError(result.error || t("Invalid username or password", "اسم المستخدم أو كلمة المرور غير صحيحة"));
      setSubmitting(false);
    }
    // On success, AuthProvider updates and App re-renders to the main app
  };

  const fillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #066058 0%, #26634B 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'Noto Naskh Arabic', sans-serif",
        position: "relative",
      }}
    >
      {/* Lang toggle in the corner */}
      <button
        onClick={onToggleLang}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 48,
          padding: "6px 18px",
          color: "#fff",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'Noto Naskh Arabic', sans-serif",
        }}
      >
        {lang === "en" ? "عربي" : "EN"}
      </button>

      {/* Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 36,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Avatar + title */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              overflow: "hidden",
              margin: "0 auto 14px",
              border: "2px solid #EAEAEA",
            }}
          >
            <img
              src="/assets/rashid-avatar.png"
              alt="Rashid"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#160F3E", marginBottom: 4 }}>
            {t("Sign in to Rashid", "تسجيل الدخول إلى راشد")}
          </h1>
          <p style={{ fontSize: 13, color: "#595959" }}>
            {t(
              "Geospatial AI Agent | Ministry of Municipalities & Housing",
              "وكيل الذكاء الاصطناعي الجيومكاني | وزارة البلديات والإسكان"
            )}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#160F3E", marginBottom: 6 }}>
              {t("Username", "اسم المستخدم")}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #EAEAEA",
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#160F3E", marginBottom: 6 }}>
              {t("Password", "كلمة المرور")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #EAEAEA",
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "#FEE",
                border: "1px solid #FCC",
                borderRadius: 8,
                color: "#A00",
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !username || !password}
            style={{
              width: "100%",
              padding: "11px 24px",
              background: submitting || !username || !password ? "#9DB5AC" : "#26634B",
              color: "#fff",
              border: "none",
              borderRadius: 48,
              fontSize: 15,
              fontWeight: 600,
              cursor: submitting || !username || !password ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s",
            }}
          >
            {submitting ? t("Signing in…", "جارٍ تسجيل الدخول…") : t("Sign in", "تسجيل الدخول")}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div
          style={{
            marginTop: 24,
            padding: 14,
            background: "#f8f9fa",
            borderRadius: 8,
            border: "1px dashed #D0D0D0",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#595959", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {t("Demo credentials — click to fill", "بيانات تجريبية — انقر للتعبئة")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {DEMO_CREDENTIALS.map((c) => (
              <button
                key={c.username}
                type="button"
                onClick={() => fillDemo(c.username, c.password)}
                style={{
                  textAlign: lang === "ar" ? "right" : "left",
                  padding: "6px 10px",
                  background: "#fff",
                  border: "1px solid #EAEAEA",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#160F3E",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                <strong>{c.username}</strong> / {c.password}
                <span style={{ float: lang === "ar" ? "left" : "right", color: "#26634B", fontSize: 10, fontWeight: 600 }}>
                  {c.role.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
