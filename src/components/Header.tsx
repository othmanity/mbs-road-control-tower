interface HeaderProps {
  lang: "en" | "ar";
  onToggleLang: () => void;
}

export default function Header({ lang, onToggleLang }: HeaderProps) {
  return (
    <header
      className="govsa-header"
      style={{
        backgroundImage: "linear-gradient(to right, #066058, #26634B)",
        minHeight: 75,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 24px",
      }}
    >
      {/* Left: Logo + Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 6,
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.25)",
            flexShrink: 0,
          }}
        >
          <img
            src="/assets/rashid-avatar.jpg"
            alt="Rashid"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
            {lang === "en" ? "Rashid" : "راشد"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
            {lang === "en"
              ? "Geospatial AI Agent | Ministry of Municipalities & Housing"
              : "وكيل الذكاء الاصطناعي الجيومكاني | وزارة البلديات والإسكان"}
          </div>
        </div>
      </div>

      {/* Right: Level badge + Lang toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onToggleLang}
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 48,
            padding: "6px 18px",
            color: "#fff",
            cursor: "pointer",
            fontSize: 14,
            fontFamily: "'Noto Naskh Arabic', sans-serif",
            fontWeight: 600,
          }}
        >
          {lang === "en" ? "عربي" : "EN"}
        </button>
      </div>
    </header>
  );
}
