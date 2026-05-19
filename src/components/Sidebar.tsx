import type { Lang } from "../types";
import type { ComponentType, SVGProps } from "react";
import {
  OverviewIcon,
  MapIcon,
  ZoneIcon,
  ActivitiesIcon,
  ReportsIcon,
  ChatIcon,
} from "./Icons";

export type View = "overview" | "map" | "zone" | "activities" | "reports" | "chat";

interface NavItem {
  key: View;
  en: string;
  ar: string;
  Icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
}

const items: NavItem[] = [
  { key: "overview",   en: "Control Tower",            ar: "غرفة العمليات",            Icon: OverviewIcon },
  { key: "map",        en: "Corridor Map",             ar: "خريطة المحور",             Icon: MapIcon },
  { key: "zone",       en: "Zone Detail",              ar: "تفاصيل النطاق",            Icon: ZoneIcon },
  { key: "activities", en: "Activities",               ar: "الأنشطة",                  Icon: ActivitiesIcon },
  { key: "reports",    en: "Reports",                  ar: "التقارير",                 Icon: ReportsIcon },
  { key: "chat",       en: "Ask Control Tower Agent",  ar: "اسأل وكيل غرفة العمليات",  Icon: ChatIcon },
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
        const Icon = it.Icon;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
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
              transition: "background 120ms ease, color 120ms ease",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = "#F4F6F8";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = "transparent";
            }}
          >
            <span
              style={{
                display: "inline-flex",
                width: 22, height: 22,
                alignItems: "center",
                justifyContent: "center",
                color: active ? "#066058" : "#9DB5AC",
                flexShrink: 0,
              }}
            >
              <Icon size={18} />
            </span>
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
