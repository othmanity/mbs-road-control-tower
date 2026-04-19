import { useState } from "react";
import MapView from "./MapView";
import StatsTable from "./StatsTable";
import GrowthChart from "./GrowthChart";
import AgentCard from "./AgentCard";

interface ResultsDashboardProps {
  lang: "en" | "ar";
  request: string;
  onReset: () => void;
}

export default function ResultsDashboard({ lang, request, onReset }: ResultsDashboardProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showAgentCard, setShowAgentCard] = useState(false);

  return (
    <div style={{ minHeight: "calc(100vh - 75px)", padding: 20, background: "#f8f9fa" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#160F3E", marginBottom: 2 }}>
            {lang === "en" ? "Urban Expansion Analysis" : "تحليل التوسع العمراني"}
          </h2>
          <p style={{ fontSize: 13, color: "#595959" }}>{request}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* DGA pill buttons (border-radius: 3rem) */}
          <button
            onClick={() => setShowAgentCard(!showAgentCard)}
            style={{
              padding: "8px 20px",
              borderRadius: 48,
              border: showAgentCard ? "2px solid #26634B" : "2px solid #EAEAEA",
              background: showAgentCard ? "rgba(38,99,75,0.08)" : "#fff",
              color: showAgentCard ? "#26634B" : "#595959",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Noto Naskh Arabic', sans-serif",
            }}
          >
            {lang === "en" ? "Rashid Profile" : "ملف راشد"}
          </button>
          <button
            style={{
              padding: "8px 20px",
              borderRadius: 48,
              border: "none",
              background: "#26634B",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Noto Naskh Arabic', sans-serif",
            }}
          >
            {lang === "en" ? "Export PDF" : "تصدير PDF"}
          </button>
          <button
            onClick={onReset}
            style={{
              padding: "8px 20px",
              borderRadius: 48,
              border: "2px solid #EAEAEA",
              background: "#fff",
              color: "#595959",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Noto Naskh Arabic', sans-serif",
            }}
          >
            {lang === "en" ? "New Analysis" : "تحليل جديد"}
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: showAgentCard ? "1fr 370px 280px" : "1fr 370px",
          gap: 16,
          transition: "all 0.3s ease",
        }}
      >
        {/* Map */}
        <div style={{ height: 500, borderRadius: 8, overflow: "hidden", border: "1px solid #EAEAEA" }}>
          <MapView lang={lang} selectedCity={selectedCity} onSelectCity={setSelectedCity} />
        </div>

        {/* Stats column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <StatsTable lang={lang} selectedCity={selectedCity} onSelectCity={setSelectedCity} />
          <GrowthChart lang={lang} selectedCity={selectedCity} onSelectCity={setSelectedCity} />
        </div>

        {/* Agent card */}
        {showAgentCard && (
          <div style={{ animation: "fadeInUp 0.3s ease-out" }}>
            <AgentCard lang={lang} />
          </div>
        )}
      </div>

      {/* Footer status - DGA style */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          background: "#fff",
          borderRadius: 8,
          border: "1px solid #EAEAEA",
          fontSize: 13,
          color: "#595959",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#006604", display: "inline-block" }} />
          {lang === "en" ? "Analysis complete — ready for human review" : "اكتمل التحليل — جاهز للمراجعة البشرية"}
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <span>L1 {lang === "en" ? "Operator Mode" : "وضع المشغل"}</span>
          <span>{lang === "en" ? "Confidence" : "الثقة"}: 94%</span>
          <span>{lang === "en" ? "Data freshness" : "حداثة البيانات"}: 2025-Q4</span>
        </div>
      </div>
    </div>
  );
}
