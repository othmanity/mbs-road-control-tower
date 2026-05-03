// Thin fetch wrapper for the rashid-backend.
const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch { /* ignore */ }
    throw new Error(body?.error || `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ---------- Types mirroring the backend rows ----------
export interface District {
  id: string;
  name: string;
  name_ar: string;
  kind: "city" | "district" | "sub-area" | "region";
  parent: string | null;
  municipality: string | null;
  municipality_ar: string | null;
  population: number | null;
  area_km2: number | null;
  perimeter_km: number | null;
  center_lat: number | null;
  center_lng: number | null;
  data_validated_at: string | null;
  summary_en: string | null;
  summary_ar: string | null;
}

export interface Kpi {
  id: number;
  district_id: string;
  key: string;
  label_en: string;
  label_ar: string;
  value: number;
  unit: string | null;
  severity: string | null;
  year: number | null;
}

export interface Insight {
  id: number;
  district_id: string;
  position: number;
  title_en: string;
  title_ar: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "POSITIVE" | "OPPORTUNITY";
  metric: string;
  benchmark: string | null;
  body_en: string;
  body_ar: string;
}

export interface Layer {
  id: number;
  district_id: string;
  layer_key: string;
  name_en: string;
  name_ar: string;
  color: string;
  geometry_type: string;
  feature_count: number;
  description_en: string | null;
  description_ar: string | null;
}

export interface Report {
  id: string;
  district_id: string | null;
  title_en: string;
  title_ar: string;
  kind: "executive" | "analysis" | "external" | "generated";
  description_en: string | null;
  description_ar: string | null;
  file_path: string | null;
  generated_at: string;
  author: string;
}

export interface CityStat {
  name: string;
  name_ar: string;
  area_2024: number;
  area_2025: number;
  expansion: number;
  growth_pct: number;
  center_lat: number;
  center_lng: number;
}

export interface Keyword {
  trigger_word: string;
  response_en: string;
  response_ar: string;
}

export interface QaItem {
  category: string;
  position: number;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
}

// ---------- Endpoints ----------
export const api = {
  health: () => request<{ ok: boolean; time: string }>("/health"),

  login: (username: string, password: string) =>
    request<{ ok: boolean; user?: any; error?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  districts: {
    list: () => request<{ districts: District[] }>("/districts"),
    get: (id: string) =>
      request<{ district: District; kpis: Kpi[]; insights: Insight[]; layers: Layer[] }>(
        `/districts/${id}`,
      ),
    multiCityStats: () => request<{ cities: CityStat[] }>("/districts/multi-cities/stats"),
    subAreas: (parent: string) => request<{ subAreas: any[] }>(`/districts/${parent}/sub-areas`),
  },

  knowledge: {
    keywords: (district = "ash-shati-ash-sharqi") =>
      request<{ keywords: Keyword[] }>(`/knowledge/keywords?district=${district}`),
    matchKeyword: (text: string, district = "ash-shati-ash-sharqi") =>
      request<{ match: Keyword | null }>(`/knowledge/keywords/match`, {
        method: "POST",
        body: JSON.stringify({ text, district }),
      }),
    qa: (district = "ash-shati-ash-sharqi") =>
      request<{ categories: Record<string, QaItem[]>; total: number }>(
        `/knowledge/qa?district=${district}`,
      ),
  },

  reports: {
    list: (district?: string) =>
      request<{ reports: Report[] }>(district ? `/reports?district=${district}` : "/reports"),
    get: (id: string) => request<{ report: Report }>(`/reports/${id}`),
    generate: (district = "ash-shati-ash-sharqi") =>
      request<any>("/reports/generate", { method: "POST", body: JSON.stringify({ district }) }),
    generatePdf: (params: { district?: string; area: string; layer: string }) =>
      request<{ report: Report }>("/reports/generate-pdf", {
        method: "POST",
        body: JSON.stringify(params),
      }),
    delete: (id: string) => request<{ ok: boolean }>(`/reports/${id}`, { method: "DELETE" }),
  },

  chat: {
    status: () => request<{ api_key_configured: boolean; model: string }>("/chat/status"),
    createSession: (username: string, district = "ash-shati-ash-sharqi", title?: string) =>
      request<{ session_id: string }>("/chat/sessions", {
        method: "POST",
        body: JSON.stringify({ username, district, title }),
      }),
    listSessions: (username: string) =>
      request<{ sessions: any[] }>(`/chat/sessions?username=${username}`),
    sessionMessages: (id: string) =>
      request<{ messages: any[] }>(`/chat/sessions/${id}/messages`),
    sendMessage: (
      id: string,
      text: string,
      lang: "en" | "ar",
      skip_keyword = false,
    ) =>
      request<{ reply: string; source: string; keyword?: string; usage?: any }>(
        `/chat/sessions/${id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ text, lang, skip_keyword }),
        },
      ),
  },
};
