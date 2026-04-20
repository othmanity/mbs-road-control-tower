import { useState } from "react";

interface ChatInputProps {
  lang: "en" | "ar";
  onSubmit: (message: string) => void;
}

const quickActions = [
  { en: "Urban Expansion", ar: "التوسع العمراني" },
  { en: "Land Use Change", ar: "تغير استخدام الأراضي" },
  { en: "Infrastructure Gap", ar: "فجوة البنية التحتية" },
];

export default function ChatInput({ lang, onSubmit }: ChatInputProps) {
  const [input, setInput] = useState("");

  const defaultRequest =
    lang === "en"
      ? "Identify urban expansion in the major cities of the Kingdom over one year"
      : "تحديد التوسع العمراني في المدن الرئيسية بالمملكة خلال عام واحد";

  const handleSubmit = () => {
    onSubmit(input.trim() || defaultRequest);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 75px)",
        padding: 32,
        background: "#f8f9fa",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: "50%",
          overflow: "hidden",
          marginBottom: 28,
          border: "3px solid #26634B",
          boxShadow: "0 4px 24px rgba(38,99,75,0.2)",
        }}
      >
        <img
          src="/assets/rashid-avatar.png"
          alt="Rashid"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Welcome */}
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#160F3E", marginBottom: 8 }}>
        {lang === "en" ? "Welcome. I'm Rashid." : "مرحباً. أنا راشد."}
      </h1>
      <p style={{ fontSize: 15, color: "#595959", marginBottom: 36, textAlign: "center", maxWidth: 480 }}>
        {lang === "en"
          ? "Your geospatial analysis agent. Describe the spatial analysis you need."
          : "وكيلك للتحليل الجيومكاني. صف التحليل المكاني الذي تحتاجه."}
      </p>

      {/* Input card */}
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          background: "#fff",
          borderRadius: 8,
          border: "1px solid #EAEAEA",
          padding: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={defaultRequest}
            dir={lang === "ar" ? "rtl" : "ltr"}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 48,
              border: "2px solid #EAEAEA",
              fontSize: 14,
              fontFamily: "'Noto Naskh Arabic', sans-serif",
              outline: "none",
              transition: "border-color 0.15s ease-in-out",
              color: "#323232",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#26634B")}
            onBlur={(e) => (e.target.style.borderColor = "#EAEAEA")}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: "12px 28px",
              borderRadius: 48,
              border: "none",
              background: "#26634B",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Noto Naskh Arabic', sans-serif",
              transition: "background-color 0.15s ease-in-out",
              minWidth: 100,
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "#144D3F")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "#26634B")}
          >
            {lang === "en" ? "Analyze" : "تحليل"}
          </button>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#595959" }}>
            {lang === "en" ? "Quick actions:" : "إجراءات سريعة:"}
          </span>
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => setInput(lang === "en" ? action.en : action.ar)}
              style={{
                padding: "5px 16px",
                borderRadius: 48,
                border: `2px solid ${i === 0 ? "#26634B" : "#EAEAEA"}`,
                background: i === 0 ? "rgba(38,99,75,0.08)" : "#fff",
                color: i === 0 ? "#26634B" : "#595959",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Noto Naskh Arabic', sans-serif",
                fontWeight: i === 0 ? 600 : 400,
                transition: "all 0.15s ease-in-out",
              }}
            >
              {lang === "en" ? action.en : action.ar}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div
        style={{
          marginTop: 40,
          display: "flex",
          gap: 24,
          fontSize: 13,
          color: "#595959",
        }}
      >
        {[
          { icon: "🏢", en: "17 Municipalities", ar: "17 أمانة" },
          { icon: "📊", en: "17 Datasets", ar: "17 مجموعة بيانات" },
          { icon: "🔗", en: "SDI Connected", ar: "متصل بالبنية التحتية" },
        ].map((item, i) => (
          <span
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              border: "1px solid #EAEAEA",
              borderRadius: 48,
              padding: "6px 14px",
            }}
          >
            {item.icon} {lang === "en" ? item.en : item.ar}
          </span>
        ))}
      </div>
    </div>
  );
}
