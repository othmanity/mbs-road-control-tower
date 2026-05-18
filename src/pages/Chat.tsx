import { useEffect, useRef, useState } from "react";
import type { ChatMessage, Lang } from "../types";
import MarkdownMessage from "../components/MarkdownMessage";
import ControlTowerIcon from "../components/ControlTowerIcon";

interface ChatProps {
  lang: Lang;
}

// Suggested questions — same ones we seed the KB with
const SUGGESTED: { en: string; ar: string }[] = [
  {
    en: "How many open findings does Zone 70 (pilgrim approach) have right now?",
    ar: "كم عدد الملاحظات المفتوحة حالياً في النطاق 70 (مدخل الحجاج)؟",
  },
  {
    en: "Which agency owns the most blocked items?",
    ar: "أي جهة لديها أكبر عدد من الملاحظات المتعثرة؟",
  },
  {
    en: "What is our progress against the 90% damaged-barrier-repair target?",
    ar: "ما تقدّمنا تجاه مستهدف إصلاح الحواجز المتهالكة 90%؟",
  },
  {
    en: "Which findings in the PoC zones are at high severity and still open?",
    ar: "ما الملاحظات عالية الخطورة وما زالت مفتوحة في نطاقات التجربة؟",
  },
  {
    en: "How much development budget is committed in Zone 35 (slum + ad cluster)?",
    ar: "كم حجم ميزانية التطوير الملتزم بها في النطاق 35 (العشوائيات واللوحات)؟",
  },
];

// In dev: empty base, Vite proxies /api → :3001
// In prod: set VITE_API_BASE_URL=https://<railway-url>
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export default function Chat({ lang }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "m0",
      role: "agent",
      timestamp: new Date().toISOString(),
      text:
        lang === "en"
          ? "Hello. I'm the MBS Road Control Tower agent. Ask me anything about the corridor, findings, KPIs, or Hajj readiness."
          : "مرحباً. أنا وكيل غرفة عمليات طريق الأمير محمد بن سلمان. اسألني عن المحور، الملاحظات، المستهدفات، أو جاهزية الحج.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Cleanly close any active stream on unmount
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    setError(null);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    const agentId = `a-${Date.now() + 1}`;
    const agentMsg: ChatMessage = {
      id: agentId,
      role: "agent",
      text: "",
      timestamp: new Date().toISOString(),
    };
    const historyForApi = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, userMsg, agentMsg]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          lang,
          history: historyForApi,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {
          /* ignore parse error */
        }
        throw new Error(msg);
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE: events separated by blank lines, fields by \n
        let sep;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const raw = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          const event = parseSSE(raw);
          if (!event) continue;
          if (event.event === "text" && typeof event.data?.delta === "string") {
            appendToAgent(setMessages, agentId, event.data.delta);
          } else if (event.event === "error" && event.data?.message) {
            throw new Error(String(event.data.message));
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === "The user aborted a request." || controller.signal.aborted) {
        // user cancelled — silent
      } else {
        setError(msg);
        appendToAgent(
          setMessages,
          agentId,
          lang === "en"
            ? `\n\n[Error: ${msg}]`
            : `\n\n[خطأ: ${msg}]`
        );
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: 16,
        height: "calc(100vh - 130px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #EAEAEA",
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #EAEAEA" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#160F3E" }}>
            {lang === "en" ? "Ask Control Tower Agent" : "اسأل وكيل غرفة العمليات"}
          </div>
          <div style={{ fontSize: 11, color: "#9DB5AC" }}>
            {lang === "en"
              ? "Powered by Claude — grounded on the synthetic facts + KB"
              : "يعتمد على Claude — مبني على الحقائق التجريبية وقاعدة المعرفة"}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "18px 20px" }}>
          {messages.map((m, idx) => {
            const isAgent = m.role === "agent";
            const isLast = idx === messages.length - 1;
            const streaming = busy && isAgent && isLast;
            const showWaiting = streaming && m.text.length === 0;
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: isAgent ? "row" : "row-reverse",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 14,
                  animation: "fadeInUp 0.25s ease-out",
                }}
              >
                <Avatar role={m.role} />
                <div
                  style={{
                    maxWidth: "82%",
                    minWidth: showWaiting ? 60 : undefined,
                    background: isAgent ? "#fff" : "#066058",
                    color: isAgent ? "#1a2129" : "#fff",
                    padding: isAgent ? "12px 16px" : "10px 14px",
                    borderRadius: isAgent ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                    border: isAgent ? "1px solid #E5EBE8" : "none",
                    boxShadow: isAgent ? "0 1px 2px rgba(16,30,40,0.04)" : "none",
                    fontSize: 13.5,
                    lineHeight: 1.55,
                  }}
                >
                  {isAgent ? (
                    showWaiting ? (
                      <TypingDots />
                    ) : (
                      <MarkdownMessage text={m.text} streaming={streaming} />
                    )
                  ) : (
                    <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div style={{ padding: 12, borderTop: "1px solid #EAEAEA", display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
            disabled={busy}
            placeholder={
              lang === "en"
                ? "e.g., How many open findings in Zone 70?"
                : "مثلاً: كم عدد الملاحظات المفتوحة في النطاق 70؟"
            }
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 48,
              border: "1px solid #EAEAEA",
              fontSize: 13,
              outline: "none",
            }}
          />
          {busy ? (
            <button
              className="btn"
              onClick={() => abortRef.current?.abort()}
              style={{ borderColor: "#AF0818", color: "#AF0818" }}
            >
              {lang === "en" ? "Stop" : "إيقاف"}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => send(input)}>
              {lang === "en" ? "Send" : "إرسال"}
            </button>
          )}
        </div>
        {error && (
          <div
            style={{
              padding: "6px 12px",
              fontSize: 11,
              color: "#AF0818",
              background: "#FBE0E3",
              borderTop: "1px solid #EAEAEA",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Suggested questions panel */}
      <aside
        style={{
          background: "#fff",
          border: "1px solid #EAEAEA",
          borderRadius: 12,
          padding: 16,
          overflow: "auto",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "#160F3E", marginBottom: 4 }}>
          {lang === "en" ? "Suggested questions" : "أسئلة مقترحة"}
        </div>
        <div style={{ fontSize: 11, color: "#9DB5AC", marginBottom: 12 }}>
          {lang === "en"
            ? "Tap any to ask the agent."
            : "انقر أي سؤال لطرحه على الوكيل."}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SUGGESTED.map((s, i) => (
            <button
              key={i}
              onClick={() => send(lang === "en" ? s.en : s.ar)}
              disabled={busy}
              style={{
                textAlign: lang === "ar" ? "right" : "left",
                fontFamily: "inherit",
                padding: "8px 10px",
                borderRadius: 8,
                background: "#F4F6F8",
                border: "1px solid transparent",
                cursor: busy ? "not-allowed" : "pointer",
                opacity: busy ? 0.5 : 1,
                fontSize: 12,
                color: "#323232",
                lineHeight: 1.4,
              }}
              onMouseEnter={(e) => { if (!busy) e.currentTarget.style.borderColor = "#066058"; }}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
            >
              {lang === "en" ? s.en : s.ar}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

// ---- helpers ----

function Avatar({ role }: { role: "user" | "agent" }) {
  if (role === "agent") {
    return (
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: "linear-gradient(135deg, #066058 0%, #144D3F 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: 4,
          color: "#fff",
          boxShadow: "0 1px 3px rgba(6,96,88,0.25)",
        }}
        aria-label="Control Tower Agent"
      >
        <ControlTowerIcon size={26} variant="mono" />
      </div>
    );
  }
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        background: "#F0F4F2",
        color: "#066058",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
        border: "1px solid #E5EBE8",
      }}
      aria-label="You"
    >
      ✸
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 4px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#066058",
            opacity: 0.4,
            animation: `typing-bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function appendToAgent(
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  agentId: string,
  delta: string
) {
  setMessages((prev) =>
    prev.map((m) => (m.id === agentId ? { ...m, text: m.text + delta } : m))
  );
}

function parseSSE(raw: string): { event: string; data: { [k: string]: unknown } | null } | null {
  let event = "message";
  let dataStr = "";
  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
  }
  if (!dataStr) return { event, data: null };
  try {
    return { event, data: JSON.parse(dataStr) };
  } catch {
    return { event, data: null };
  }
}
