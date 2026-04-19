import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cityStats } from "../data/mockData";

interface GrowthChartProps {
  lang: "en" | "ar";
  selectedCity: string | null;
  onSelectCity: (name: string | null) => void;
}

export default function GrowthChart({ lang, selectedCity, onSelectCity }: GrowthChartProps) {
  const data = [...cityStats]
    .sort((a, b) => b.growthPct - a.growthPct)
    .map((c) => ({
      name: lang === "en" ? c.name : c.nameAr,
      rawName: c.name,
      growth: c.growthPct,
      expansion: c.expansion,
    }));

  // DGA palette colors
  const colors = ["#FD7E14", "#066058", "#26634B", "#27AA8C", "#005A96"];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        padding: "18px 14px",
        border: "1px solid #EAEAEA",
      }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#160F3E", marginBottom: 2, paddingLeft: 6 }}>
        {lang === "en" ? "Growth Rate by City" : "معدل النمو حسب المدينة"}
      </h3>
      <p style={{ fontSize: 12, color: "#595959", marginBottom: 14, paddingLeft: 6 }}>
        {lang === "en" ? "Year-over-year expansion percentage" : "نسبة التوسع السنوي"}
      </p>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EAEAEA" />
          <XAxis
            type="number"
            domain={[0, 5]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: "#595959" }}
            axisLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={70}
            tick={{ fontSize: 13, fill: "#323232" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #EAEAEA",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "'Noto Naskh Arabic', sans-serif",
            }}
            formatter={(value: any, _name: any, props: any) => [
              `${value}% (+${props.payload.expansion} km²)`,
              lang === "en" ? "Growth" : "النمو",
            ]}
          />
          <Bar
            dataKey="growth"
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            onClick={(data: any) => onSelectCity(data.rawName)}
          >
            {data.map((entry, idx) => (
              <Cell
                key={entry.rawName}
                fill={selectedCity === entry.rawName ? "#FD7E14" : colors[idx]}
                opacity={selectedCity && selectedCity !== entry.rawName ? 0.35 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
