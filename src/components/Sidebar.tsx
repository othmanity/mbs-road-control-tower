import type { Lang } from "../types";

export type View = "overview" | "map" | "zone" | "activities" | "reports" | "chat";

interface NavItem {
  key: View;
  en: string;
  ar: string;
  icon: string;
}

const items: NavItem[] = [
  { key: "overview",   en: "Control Tower", ar: "غرفة العمليات",  icon: "▦" },
  { key: "map",        en: "Corridor Map",  ar: "خريطة المحور",   icon: "◉" },
  { key: "zone",       en: "Zone Detail",   ar: "تفاصيل النطاق",  icon: "❐" },
  { key: "activities", en: "Activities",    ar: "الأنشطة",       icon: "≡" },
  { key: "reports",    en: "Reports",       ar: "التقارير",      icon: "▤" },
  { key: "chat",       en: "Ask Control Tower Agent", ar: "اسأل وكيل غرفة العمليات", icon: "✦" },
];

interface SidebarProps {
  lang: Lang;
  view: View;
  onChange: (v: View) => void;
}

export default function Sidebar({ lang, view, onChange }: SidebarProps) {
  return (
    <nav
      style={{
        width: 220,
        background: "#fff",
        borderRight: "1px solid #EAEAEA",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: 11, fontWeight: 700, color: "#595959",
          letterSpacing: 1, textTransform: "uppercase",
          padding: "8px 12px 12px",
        }}
      >
        {lang === "en" ? "Navigation" : "التنقل"}
      </div>

      {items.map((it) => {
        const active = it.key === view;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              background: active ? "rgba(38,99,75,0.10)" : "transparent",
              color: active ? "#066058" : "#323232",
              fontSize: 14,
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
              textAlign: lang === "ar" ? "right" : "left",
              fontFamily: "inherit",
            }}
          >
            <span style={{ width: 18, color: active ? "#066058" : "#9DB5AC", fontSize: 14 }}>{it.icon}</span>
            <span>{lang === "en" ? it.en : it.ar}</span>
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      <div
        style={{
          fontSize: 11,
          color: "#9DB5AC",
          padding: "12px",
          borderTop: "1px solid #EAEAEA",
          marginTop: 12,
          lineHeight: 1.5,
        }}
      >
        {lang === "en"
          ? "v0.1 PoC · synthetic data for 3 zones (Z8, Z35, Z70)"
          : "إصدار 0.1 تجريبي · بيانات تجريبية لـ 3 نطاقات (Z8, Z35, Z70)"}
      </div>
    </nav>
  );
}
