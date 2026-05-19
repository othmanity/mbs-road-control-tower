import type { Lang } from "../types";
import KpiTile from "../components/KpiTile";
import CorridorStrip from "../components/CorridorStrip";
import { kpis, daysUntilHajj, NEXT_HAJJ_DATE_ISO } from "../data/kpis";
import { findings } from "../data/findings";
import { getZone, POC_ZONE_IDS } from "../data/corridor";
import { getContractor } from "../data/contractors";

interface OverviewProps {
  lang: Lang;
  onOpenMap: () => void;
  onOpenZone: (zoneId: number) => void;
}

export default function Overview({ lang, onOpenMap, onOpenZone }: OverviewProps) {
  const days = daysUntilHajj();
  const blockers = findings
    .filter((f) => f.status === "blocked" || f.severity === "high")
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    .slice(0, 5);

  const open = findings.filter((f) => f.status !== "done").length;
  const done = findings.filter((f) => f.status === "done").length;
  const total = findings.length;
  const closureRate = Math.round((done / total) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hero band */}
      <div
        style={{
          background: "linear-gradient(135deg, #066058 0%, #144D3F 100%)",
          color: "#fff",
          borderRadius: 12,
          padding: "22px 28px",
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.75, letterSpacing: 1, textTransform: "uppercase" }}>
            {lang === "en" ? "MBS Road · Makkah Region" : "محور الأمير محمد بن سلمان · منطقة مكة"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
            {lang === "en"
              ? "75 km · 75 zones · 5 phases"
              : "75 كم · 75 نطاق · 5 مراحل"}
          </div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6, maxWidth: 480 }}>
            {lang === "en"
              ? "Jeddah Islamic Port → Al-Masjid Al-Haram · 170,000+ vehicles daily"
              : "ميناء جدة الإسلامي → المسجد الحرام · أكثر من 170,000 مركبة يومياً"}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{lang === "en" ? "Days to Hajj 2027" : "أيام حتى حج 1448"}</div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{days}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{NEXT_HAJJ_DATE_ISO}</div>
        </div>

        <div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{lang === "en" ? "Open findings" : "ملاحظات مفتوحة"}</div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{open}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{lang === "en" ? `${done} closed of ${total}` : `${done} مغلق من ${total}`}</div>
        </div>

        <div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{lang === "en" ? "Closure rate" : "معدل الإغلاق"}</div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{closureRate}%</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{lang === "en" ? "PoC zones only" : "ضمن نطاقات التجربة"}</div>
        </div>
      </div>

      {/* KPI tiles */}
      <div>
        <SectionHeader
          en="2027 Targets"
          ar="مستهدفات 2027"
          lang={lang}
          subEn="From the report — Ministry of Municipalities & Housing"
          subAr="من تقرير وزارة البلديات والإسكان"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {kpis.map((k) => <KpiTile key={k.id} lang={lang} kpi={k} />)}
        </div>
      </div>

      {/* Corridor strip */}
      <div
        style={{
          background: "#fff", borderRadius: 12, border: "1px solid #EAEAEA",
          padding: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#160F3E" }}>
              {lang === "en" ? "Corridor distortion density" : "كثافة التشوه على المحور"}
            </div>
            <div style={{ fontSize: 12, color: "#595959" }}>
              {lang === "en"
                ? "Each cell = 1 km zone · click a highlighted PoC cell to drill in"
                : "كل خلية = نطاق 1 كم · انقر على خلايا التجربة المظللة للدخول"}
            </div>
          </div>
          <button className="btn btn-outline" onClick={onOpenMap}>
            {lang === "en" ? "Open map" : "فتح الخريطة"}
          </button>
        </div>
        <CorridorStrip
          lang={lang}
          highlightedZoneIds={[...POC_ZONE_IDS]}
          onSelectZone={(id) => {
            if ((POC_ZONE_IDS as readonly number[]).includes(id)) onOpenZone(id);
            else onOpenMap();
          }}
          height={42}
        />
      </div>

      {/* Top blockers / aged items */}
      <div
        style={{
          background: "#fff", borderRadius: 12, border: "1px solid #EAEAEA",
          padding: 18,
        }}
      >
        <SectionHeader
          en="High-priority items needing leadership attention"
          ar="بنود ذات أولوية عالية تحتاج تدخل القيادة"
          lang={lang}
          inline
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {blockers.map((f) => {
            const z = getZone(f.zoneId)!;
            const a = getContractor(f.contractorId)!;
            return (
              <button
                key={f.id}
                onClick={() => onOpenZone(f.zoneId)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto auto",
                  gap: 14, alignItems: "center",
                  padding: "10px 12px",
                  border: "1px solid #EAEAEA",
                  borderRadius: 8,
                  background: "#fff",
                  cursor: "pointer",
                  textAlign: lang === "ar" ? "right" : "left",
                  fontFamily: "inherit",
                }}
              >
                <SeverityChip severity={f.severity} lang={lang} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#160F3E" }}>
                    {lang === "en" ? f.title.en : f.title.ar}
                  </div>
                  <div style={{ fontSize: 11, color: "#595959" }}>
                    {lang === "en" ? z.name.en : z.name.ar} · {a.acronym} · {f.activityType}
                  </div>
                </div>
                <StatusChip status={f.status} lang={lang} />
                <div style={{ fontSize: 11, color: "#595959", whiteSpace: "nowrap" }}>
                  {lang === "en" ? "Due " : "موعد: "}{f.targetDate}
                </div>
                <span style={{ color: "#066058", fontSize: 14 }}>{lang === "ar" ? "→" : "→"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  en, ar, lang, subEn, subAr, inline,
}: { en: string; ar: string; lang: Lang; subEn?: string; subAr?: string; inline?: boolean }) {
  return (
    <div style={{ marginBottom: inline ? 0 : 10 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#160F3E" }}>
        {lang === "en" ? en : ar}
      </div>
      {(subEn || subAr) && (
        <div style={{ fontSize: 12, color: "#595959" }}>
          {lang === "en" ? subEn : subAr}
        </div>
      )}
    </div>
  );
}

export function StatusChip({ status, lang }: { status: string; lang: Lang }) {
  const map: Record<string, { bg: string; fg: string; en: string; ar: string }> = {
    open:        { bg: "#EAEAEA", fg: "#323232", en: "Open",        ar: "مفتوحة" },
    in_progress: { bg: "#FFF4D6", fg: "#8A6A00", en: "In progress", ar: "قيد التنفيذ" },
    done:        { bg: "#D9F2E2", fg: "#006604", en: "Done",        ar: "منجزة" },
    blocked:     { bg: "#FBE0E3", fg: "#AF0818", en: "Blocked",     ar: "متعثرة" },
  };
  const v = map[status] ?? map.open;
  return (
    <span className="pill" style={{ background: v.bg, color: v.fg }}>
      {lang === "en" ? v.en : v.ar}
    </span>
  );
}

export function SeverityChip({ severity, lang }: { severity: string; lang: Lang }) {
  const map: Record<string, { bg: string; fg: string; en: string; ar: string }> = {
    low:    { bg: "#E6F3EC", fg: "#066058", en: "Low",    ar: "منخفضة" },
    medium: { bg: "#FFF4D6", fg: "#8A6A00", en: "Medium", ar: "متوسطة" },
    high:   { bg: "#FBE0E3", fg: "#AF0818", en: "High",   ar: "عالية" },
  };
  const v = map[severity] ?? map.low;
  return (
    <span className="pill" style={{ background: v.bg, color: v.fg, minWidth: 56, justifyContent: "center" }}>
      {lang === "en" ? v.en : v.ar}
    </span>
  );
}
