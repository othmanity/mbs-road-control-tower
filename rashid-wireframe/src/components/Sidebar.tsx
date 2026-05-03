import type { AuthUser } from "../auth/AuthContext";

export type Section = "dashboard" | "gis" | "ask-rashid" | "reporting";

interface SidebarProps {
  lang: "en" | "ar";
  active: Section;
  onChange: (s: Section) => void;
  user: AuthUser;
}

interface Item {
  id: Section;
  labelEn: string;
  labelAr: string;
  icon: string;
}

const ITEMS: Item[] = [
  { id: "dashboard", labelEn: "Dashboard", labelAr: "لوحة المعلومات", icon: "📊" },
  { id: "gis", labelEn: "GIS", labelAr: "النظم الجغرافية", icon: "🗺️" },
  { id: "ask-rashid", labelEn: "Ask Rashid", labelAr: "اسأل راشد", icon: "💬" },
  { id: "reporting", labelEn: "Reporting", labelAr: "التقارير", icon: "📑" },
];

export default function Sidebar({ lang, active, onChange, user }: SidebarProps) {
  const t = (en: string, ar: string) => (lang === "en" ? en : ar);
  return (
    <aside
      style={{
        width: 240,
        background: "#0F2A24",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
      }}
    >
      {/* Brand block */}
      <div
        style={{
          padding: "20px 18px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            overflow: "hidden",
            border: "1.5px solid rgba(255,255,255,0.2)",
            flexShrink: 0,
          }}
        >
          <img
            src="/assets/rashid-avatar.png"
            alt="Rashid"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}>
            {t("Rashid", "راشد")}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.3 }}>
            {t("Digital GIS Employee", "موظف النظم الجغرافية الرقمي")}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 8px", flex: 1 }}>
        {ITEMS.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "11px 14px",
                marginBottom: 4,
                borderRadius: 8,
                border: "none",
                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                fontFamily: "'Noto Naskh Arabic', sans-serif",
                textAlign: lang === "ar" ? "right" : "left",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              <span>{t(item.labelEn, item.labelAr)}</span>
              {isActive && (
                <span
                  style={{
                    marginLeft: lang === "ar" ? 0 : "auto",
                    marginRight: lang === "ar" ? "auto" : 0,
                    width: 4,
                    height: 18,
                    background: "#0AEBD7",
                    borderRadius: 2,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User + version footer */}
      <div
        style={{
          padding: "14px 18px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          fontSize: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {user.username[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {lang === "en" ? user.displayName : user.displayNameAr}
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase" }}>
              {user.role}
            </div>
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>
          {t("MOMAH GIS · v0.2", "وزارة البلديات والإسكان · إصدار 0.2")}
        </div>
      </div>
    </aside>
  );
}
