import { cityStats } from "../data/mockData";

interface StatsTableProps {
  lang: "en" | "ar";
  selectedCity: string | null;
  onSelectCity: (name: string | null) => void;
}

export default function StatsTable({ lang, selectedCity, onSelectCity }: StatsTableProps) {
  const totalExpansion = cityStats.reduce((s, c) => s + c.expansion, 0);
  const totalPrev = cityStats.reduce((s, c) => s + c.area2024, 0);
  const avgGrowth = ((totalExpansion / totalPrev) * 100).toFixed(2);

  return (
    <div>
      {/* Summary cards - DGA color scheme */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: lang === "en" ? "Total Expansion" : "إجمالي التوسع", value: `${totalExpansion}`, unit: "km²", bg: "#26634B" },
          { label: lang === "en" ? "Avg Growth" : "متوسط النمو", value: `${avgGrowth}%`, unit: lang === "en" ? "year-over-year" : "سنوياً", bg: "#066058" },
          { label: lang === "en" ? "Cities Analyzed" : "المدن المحللة", value: `${cityStats.length}`, unit: lang === "en" ? "municipalities" : "أمانات", bg: "#160F3E" },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              background: card.bg,
              borderRadius: 8,
              padding: "14px 16px",
              color: "#fff",
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.75 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>{card.value}</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>{card.unit}</div>
          </div>
        ))}
      </div>

      {/* Table - DGA styling */}
      <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden", border: "1px solid #EAEAEA" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#26634B", color: "#fff" }}>
              {[
                lang === "en" ? "City" : "المدينة",
                "2024 (km²)",
                "2025 (km²)",
                lang === "en" ? "Expansion" : "التوسع",
                lang === "en" ? "Growth %" : "النمو %",
              ].map((header, i) => (
                <th
                  key={i}
                  style={{
                    padding: "10px 14px",
                    textAlign: i === 0 ? "left" : "right",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cityStats.map((city, i) => {
              const isSelected = selectedCity === city.name;
              return (
                <tr
                  key={city.name}
                  onClick={() => onSelectCity(isSelected ? null : city.name)}
                  style={{
                    borderBottom: "1px solid #EAEAEA",
                    cursor: "pointer",
                    background: isSelected ? "rgba(38,99,75,0.06)" : i % 2 === 0 ? "#FAFAFA" : "#fff",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "rgba(38,99,75,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? "#FAFAFA" : "#fff";
                  }}
                >
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                    {lang === "en" ? city.name : city.nameAr}
                    {isSelected && <span style={{ marginLeft: 6, color: "#26634B", fontSize: 8 }}>●</span>}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#005A96" }}>
                    {city.area2024.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#26634B", fontWeight: 600 }}>
                    {city.area2025.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#FD7E14", fontWeight: 600 }}>
                    +{city.expansion}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <span
                      style={{
                        background: city.growthPct > 3 ? "rgba(253,126,20,0.1)" : "rgba(38,99,75,0.1)",
                        color: city.growthPct > 3 ? "#FD7E14" : "#26634B",
                        padding: "2px 10px",
                        borderRadius: 48,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {city.growthPct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
