import type { Lang } from "../types";

interface HeaderProps {
  lang: Lang;
  onToggleLang: () => void;
  username?: string;
  onLogout?: () => void;
}

export default function Header({ lang, onToggleLang, username, onLogout }: HeaderProps) {
  return (
    <header
      style={{
        backgroundImage: "linear-gradient(to right, #066058, #26634B)",
        minHeight: 72,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 24px",
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 8,
            background: "rgba(255,255,255,0.12)",
            border: "1.5px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 16, letterSpacing: 0.5,
          }}
        >
          MBS
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.15 }}>
            {lang === "en" ? "MBS Road Control Tower" : "غرفة عمليات طريق الأمير محمد بن سلمان"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
            {lang === "en"
              ? "Ministry of Municipalities & Housing — leadership view"
              : "وزارة البلديات والإسكان — عرض القيادة"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {username && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 48, padding: "4px 12px 4px 4px", fontSize: 12,
            }}
          >
            <span
              style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "rgba(255,255,255,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 12,
              }}
            >
              {username[0].toUpperCase()}
            </span>
            <span style={{ fontWeight: 600 }}>{username}</span>
          </div>
        )}

        <button
          onClick={onToggleLang}
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 48, padding: "6px 18px",
            color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}
        >
          {lang === "en" ? "عربي" : "EN"}
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 48, padding: "6px 16px",
              color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}
          >
            {lang === "en" ? "Logout" : "خروج"}
          </button>
        )}
      </div>
    </header>
  );
}
