import { useMemo, useState } from "react";
import type { Lang, ActivityType, ActivityStatus } from "../types";
import { findings } from "../data/findings";
import { getZone, POC_ZONE_IDS } from "../data/corridor";
import { getContractor, contractors } from "../data/contractors";
import { StatusChip, SeverityChip } from "./Overview";

interface ActivitiesProps {
  lang: Lang;
  onOpenZone: (zoneId: number) => void;
}

export default function Activities({ lang, onOpenZone }: ActivitiesProps) {
  const [activity, setActivity] = useState<ActivityType | "all">("all");
  const [status, setStatus] = useState<ActivityStatus | "all">("all");
  const [zone, setZone] = useState<number | "all">("all");
  const [contractor, setContractor] = useState<string | "all">("all");

  const rows = useMemo(() => findings.filter((f) => {
    if (activity !== "all" && f.activityType !== activity) return false;
    if (status !== "all" && f.status !== status) return false;
    if (zone !== "all" && f.zoneId !== zone) return false;
    if (contractor !== "all" && f.contractorId !== contractor) return false;
    return true;
  }), [activity, status, zone, contractor]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#160F3E" }}>
          {lang === "en" ? "Activities & findings" : "الأنشطة والملاحظات"}
        </h2>
        <p style={{ fontSize: 13, color: "#595959", marginTop: 2 }}>
          {lang === "en"
            ? "All development & operational items across the PoC zones."
            : "جميع الأنشطة التطويرية والتشغيلية ضمن نطاقات التجربة."}
        </p>
      </div>

      {/* Filter row */}
      <div
        style={{
          background: "#fff", border: "1px solid #EAEAEA", borderRadius: 10,
          padding: 12,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 10,
          alignItems: "end",
        }}
      >
        <Select
          label={lang === "en" ? "Activity type" : "نوع النشاط"}
          value={activity}
          onChange={(v) => setActivity(v as typeof activity)}
          options={[
            { value: "all", label: lang === "en" ? "All" : "الكل" },
            { value: "development", label: lang === "en" ? "Development" : "تطويرية" },
            { value: "operational", label: lang === "en" ? "Operational" : "تشغيلية" },
          ]}
        />
        <Select
          label={lang === "en" ? "Status" : "الحالة"}
          value={status}
          onChange={(v) => setStatus(v as typeof status)}
          options={[
            { value: "all", label: lang === "en" ? "All" : "الكل" },
            { value: "open", label: lang === "en" ? "Open" : "مفتوحة" },
            { value: "in_progress", label: lang === "en" ? "In progress" : "قيد التنفيذ" },
            { value: "done", label: lang === "en" ? "Done" : "منجزة" },
            { value: "blocked", label: lang === "en" ? "Blocked" : "متعثرة" },
          ]}
        />
        <Select
          label={lang === "en" ? "Zone" : "النطاق"}
          value={String(zone)}
          onChange={(v) => setZone(v === "all" ? "all" : Number(v))}
          options={[
            { value: "all", label: lang === "en" ? "All PoC zones" : "كل نطاقات التجربة" },
            ...POC_ZONE_IDS.map((id) => ({
              value: String(id),
              label: lang === "en" ? `Zone ${id}` : `نطاق ${id}`,
            })),
          ]}
        />
        <Select
          label={lang === "en" ? "Contractor" : "المقاول"}
          value={contractor}
          onChange={(v) => setContractor(v)}
          options={[
            { value: "all", label: lang === "en" ? "All contractors" : "كل المقاولين" },
            ...contractors.map((c) => ({ value: c.id, label: c.acronym })),
          ]}
        />
        <div style={{ alignSelf: "end", textAlign: lang === "ar" ? "left" : "right", fontSize: 12, color: "#595959" }}>
          {lang === "en" ? `${rows.length} matching` : `${rows.length} نتيجة`}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff", border: "1px solid #EAEAEA", borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F4F6F8" }}>
              <Th>{lang === "en" ? "ID" : "المعرّف"}</Th>
              <Th>{lang === "en" ? "Title" : "العنوان"}</Th>
              <Th>{lang === "en" ? "Zone" : "النطاق"}</Th>
              <Th>{lang === "en" ? "Type" : "النوع"}</Th>
              <Th>{lang === "en" ? "Contractor" : "المقاول"}</Th>
              <Th>{lang === "en" ? "Status" : "الحالة"}</Th>
              <Th>{lang === "en" ? "Severity" : "الخطورة"}</Th>
              <Th>{lang === "en" ? "Target" : "الموعد"}</Th>
              <Th>{lang === "en" ? "Budget (SAR)" : "الميزانية"}</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => {
              const z = getZone(f.zoneId)!;
              const a = getContractor(f.contractorId)!;
              return (
                <tr
                  key={f.id}
                  onClick={() => onOpenZone(f.zoneId)}
                  style={{ borderTop: "1px solid #EAEAEA", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6F8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <Td style={{ color: "#9DB5AC", fontWeight: 700 }}>{f.id}</Td>
                  <Td>
                    <div style={{ fontWeight: 600, color: "#160F3E" }}>
                      {lang === "en" ? f.title.en : f.title.ar}
                    </div>
                  </Td>
                  <Td>{lang === "en" ? z.name.en : z.name.ar}</Td>
                  <Td>
                    <span
                      className="pill"
                      style={{
                        background: f.activityType === "development" ? "#E6F0FF" : "#FFF4D6",
                        color: f.activityType === "development" ? "#005A96" : "#8A6A00",
                      }}
                    >
                      {f.activityType === "development"
                        ? (lang === "en" ? "Dev" : "تطوير")
                        : (lang === "en" ? "Ops" : "تشغيل")}
                    </span>
                  </Td>
                  <Td>{a.acronym}</Td>
                  <Td><StatusChip status={f.status} lang={lang} /></Td>
                  <Td><SeverityChip severity={f.severity} lang={lang} /></Td>
                  <Td style={{ whiteSpace: "nowrap" }}>{f.targetDate}</Td>
                  <Td style={{ whiteSpace: "nowrap" }}>
                    {f.budgetSAR ? f.budgetSAR.toLocaleString() : "—"}
                  </Td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 28, textAlign: "center", color: "#9DB5AC" }}>
                  {lang === "en" ? "No items match the filter." : "لا توجد نتائج مطابقة."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: "10px 12px",
      textAlign: "start",
      fontSize: 11, fontWeight: 700, color: "#595959",
      letterSpacing: 0.3, textTransform: "uppercase",
    }}>{children}</th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "10px 12px", verticalAlign: "middle", ...style }}>{children}</td>;
}

function Select<T extends string>({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: T) => void;
  options: { value: T | string; label: string }[];
}) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#595959", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 6,
          border: "1px solid #EAEAEA",
          fontSize: 13,
          background: "#fff",
        }}
      >
        {options.map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
    </div>
  );
}
