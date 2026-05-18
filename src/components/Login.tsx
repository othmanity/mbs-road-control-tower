import { useState } from "react";
import type { Lang } from "../types";
import { useAuth } from "../auth/AuthContext";
import ControlTowerIcon from "./ControlTowerIcon";

interface LoginProps {
  lang: Lang;
  onToggleLang: () => void;
}

export default function Login({ lang, onToggleLang }: LoginProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = login(username, passcode);
    if (!r.ok) {
      setError(lang === "en" ? r.error : "اسم المستخدم أو كلمة السر غير صحيحة");
    }
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "#f4f6f8",
      }}
    >
      {/* Left — branded panel */}
      <div
        style={{
          background: "linear-gradient(135deg, #066058 0%, #144D3F 100%)",
          color: "#fff",
          padding: "60px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.20)",
              padding: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              marginBottom: 22,
            }}
          >
            <ControlTowerIcon size={48} variant="mono" />
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#ACDDC7",
              marginBottom: 14,
            }}
          >
            {lang === "en"
              ? "Ministry of Municipalities & Housing"
              : "وزارة البلديات والإسكان"}
          </div>
          <h1
            style={{
              fontSize: 40,
              lineHeight: 1.1,
              fontWeight: 800,
              margin: 0,
            }}
          >
            {lang === "en" ? "MBS Road" : "محور طريق"}
            <br />
            {lang === "en" ? "Control Tower" : "الأمير محمد بن سلمان"}
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#d8efe5",
              lineHeight: 1.55,
              marginTop: 18,
              maxWidth: 460,
            }}
          >
            {lang === "en"
              ? "Leadership monitoring of the Prince Mohammed bin Salman Road corridor — Jeddah Islamic Port to Al-Masjid Al-Haram."
              : "غرفة عمليات قيادية لمتابعة محور طريق الأمير محمد بن سلمان — من ميناء جدة الإسلامي إلى المسجد الحرام."}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "#d8efe5",
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <span>
            {lang === "en" ? "75 km · 5 phases · 75 zones" : "75 كم · 5 مراحل · 75 نطاقاً"}
          </span>
          <span>
            {lang === "en" ? "Synthetic PoC data" : "بيانات تجريبية"}
          </span>
        </div>
      </div>

      {/* Right — login card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 32px",
          position: "relative",
        }}
      >
        <button
          onClick={onToggleLang}
          style={{
            position: "absolute",
            top: 24,
            insetInlineEnd: 24,
            background: "transparent",
            border: "1px solid #CDCCD5",
            borderRadius: 48,
            padding: "6px 16px",
            color: "#066058",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {lang === "en" ? "عربي" : "EN"}
        </button>

        <form
          onSubmit={submit}
          style={{
            width: "100%",
            maxWidth: 380,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ marginBottom: 6 }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#160F3E",
                margin: 0,
              }}
            >
              {lang === "en" ? "Sign in" : "تسجيل الدخول"}
            </h2>
            <p style={{ fontSize: 13, color: "#595959", marginTop: 4 }}>
              {lang === "en"
                ? "Authorized leadership access only."
                : "الدخول للقيادة المخوّلة فقط."}
            </p>
          </div>

          <Field
            label={lang === "en" ? "Username" : "اسم المستخدم"}
            value={username}
            onChange={setUsername}
            autoComplete="username"
            autoFocus
          />
          <Field
            label={lang === "en" ? "Passcode" : "كلمة السر"}
            value={passcode}
            onChange={setPasscode}
            type="password"
            autoComplete="current-password"
          />

          {error && (
            <div
              style={{
                background: "#FBE0E3",
                color: "#AF0818",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: 4,
              background: "#066058",
              color: "#fff",
              border: "none",
              borderRadius: 48,
              padding: "12px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {lang === "en" ? "Sign in" : "دخول"}
          </button>

          <div
            style={{
              marginTop: 6,
              padding: "10px 12px",
              background: "#F4F6F8",
              border: "1px dashed #CDCCD5",
              borderRadius: 8,
              fontSize: 11,
              color: "#595959",
              lineHeight: 1.6,
            }}
          >
            {lang === "en" ? "Demo credentials" : "بيانات الدخول التجريبية"}:&nbsp;
            <code style={{ background: "transparent", color: "#066058", fontWeight: 600 }}>
              admin / admin
            </code>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoFocus,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoFocus?: boolean;
  autoComplete?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#595959",
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        style={{
          padding: "11px 14px",
          borderRadius: 8,
          border: "1px solid #EAEAEA",
          fontSize: 14,
          outline: "none",
          fontFamily: "inherit",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#066058")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#EAEAEA")}
      />
    </label>
  );
}
