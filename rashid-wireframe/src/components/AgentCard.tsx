interface AgentCardProps {
  lang: "en" | "ar";
}

export default function AgentCard({ lang }: AgentCardProps) {
  const isEn = lang === "en";

  const maturityScores = [
    { en: "Operational Readiness", ar: "جاهزية العمليات", score: 3, max: 5 },
    { en: "Risk Alignment", ar: "توافق المخاطر", score: 2, max: 5 },
    { en: "Data Quality", ar: "جودة البيانات", score: 3, max: 5 },
    { en: "Impact Achievement", ar: "تحقيق الأثر", score: 2, max: 5 },
    { en: "Dynamic Improvement", ar: "التحسين الديناميكي", score: 2, max: 5 },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #EAEAEA", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          backgroundImage: "linear-gradient(to right, #066058, #26634B)",
          padding: "18px 20px",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4, letterSpacing: 0.5 }}>
          {isEn ? "DIGITAL WORKER IDENTITY" : "هوية الوكيل الرقمي"} | DW-GIS-2026-001
        </div>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            overflow: "hidden",
            margin: "10px auto",
            border: "2px solid rgba(255,255,255,0.3)",
          }}
        >
          <img src="/assets/rashid-avatar.png" alt="Rashid" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{isEn ? "Rashid" : "راشد"}</div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          {isEn ? "Geospatial AI Agent" : "وكيل الذكاء الاصطناعي الجيومكاني"}
        </div>
      </div>

      {/* Info rows */}
      <div style={{ padding: "14px 18px" }}>
        {[
          { label: isEn ? "Department" : "الإدارة", value: isEn ? "GIS Management" : "إدارة نظم المعلومات الجغرافية" },
          { label: isEn ? "Agency" : "الوكالة", value: isEn ? "Urban Planning & Lands" : "وكالة التخطيط الحضري والأراضي" },
          { label: isEn ? "Current Level" : "المستوى الحالي", value: "L1" },
          { label: isEn ? "Review Cycle" : "دورة المراجعة", value: isEn ? "Every 90 days" : "كل 90 يوماً" },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "7px 0",
              borderBottom: "1px solid #EAEAEA",
              fontSize: 13,
            }}
          >
            <span style={{ color: "#595959" }}>{row.label}</span>
            <span style={{ color: "#160F3E", fontWeight: 600 }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Performance metrics */}
      <div style={{ padding: "0 18px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#160F3E", marginBottom: 10 }}>
          {isEn ? "Performance (90 days)" : "الأداء (90 يوم)"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: isEn ? "Success Rate" : "معدل النجاح", value: "98.2%", color: "#006604" },
            { label: isEn ? "Tasks Done" : "المهام المنجزة", value: "347", color: "#26634B" },
            { label: isEn ? "Error Rate" : "معدل الخطأ", value: "<2%", color: "#FD7E14" },
            { label: isEn ? "Critical Errors" : "أخطاء حرجة", value: "0", color: "#006604" },
          ].map((m, i) => (
            <div key={i} style={{ background: "#f8f9fa", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 11, color: "#595959" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Maturity scorecard */}
      <div style={{ padding: "0 18px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#160F3E", marginBottom: 10 }}>
          {isEn ? "Maturity Score: 12/25" : "بطاقة النضج: 12/25"}
        </div>
        {maturityScores.map((item, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: "#595959" }}>{isEn ? item.en : item.ar}</span>
              <span style={{ color: "#160F3E", fontWeight: 600 }}>{item.score}/{item.max}</span>
            </div>
            <div style={{ height: 4, background: "#EAEAEA", borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(item.score / item.max) * 100}%`,
                  background: item.score >= 3 ? "#26634B" : "#FFC107",
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
