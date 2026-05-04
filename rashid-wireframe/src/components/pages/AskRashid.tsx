import { useEffect, useMemo, useRef, useState } from "react";
import { api, type District, type QaItem } from "../../api/client";
import type { AuthUser } from "../../auth/AuthContext";
import RashidMarkdown from "../RashidMarkdown";
import ChatBackgroundMap from "../ChatBackgroundMap";
import { useMediaQuery, MOBILE } from "../../hooks/useMediaQuery";

// Maps any keyword/synonym in a message to a district id so the background
// map can fly to it on each turn.
const DISTRICT_KEYWORDS: Record<string, string[]> = {
  "ash-shati-ash-sharqi": ["ash shati", "shati ash sharqi", "shati", "الشاطئ", "الشاطئ الشرقي"],
  "riyadh":  ["riyadh", "الرياض"],
  "jeddah":  ["jeddah", "جدة"],
  "dammam":  ["dammam", "الدمام"],
  "makkah":  ["makkah", "mecca", "مكة", "مكة المكرمة"],
  "madinah": ["madinah", "medina", "المدينة", "المدينة المنورة"],
  "al-ahsa": ["al-ahsa", "al ahsa", "ahsa", "الأحساء"],
  "al-seh":  ["al-seh", "al seh", "السيح"],
};

function detectDistrict(text: string): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  // Longest-keyword-first wins so "ash shati ash sharqi" doesn't get hijacked by "shati" alone.
  const flat = Object.entries(DISTRICT_KEYWORDS).flatMap(([id, terms]) =>
    terms.map((term) => ({ id, term: term.toLowerCase() })),
  );
  flat.sort((a, b) => b.term.length - a.term.length);
  return flat.find((entry) => lower.includes(entry.term))?.id ?? null;
}

interface AskRashidProps {
  lang: "en" | "ar";
  user: AuthUser;
  prefillRef: { current: string | null };
}

interface Msg {
  role: "user" | "assistant";
  content: string;
  source?: string;
  keyword?: string | null;
  pending?: boolean;
}

export default function AskRashid({ lang, user, prefillRef }: AskRashidProps) {
  const t = (en: string, ar: string) => (lang === "en" ? en : ar);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  // Q&A bank — used only as the rotating demo hint, never rendered as a tab.
  const [questionPool, setQuestionPool] = useState<QaItem[]>([]);
  const [apiKeyOk, setApiKeyOk] = useState<boolean | null>(null);
  const [sending, setSending] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  // Background map focus — null = Saudi-wide; flies to a district when one is named.
  const [focusedDistrict, setFocusedDistrict] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isMobile = useMediaQuery(MOBILE);

  // Browser Web Speech API for voice input. Works in Chrome / Edge / Safari
  // (with permission prompt). Populates the input field as the user speaks.
  const sttSupported =
    typeof window !== "undefined" &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const startListening = () => {
    if (!sttSupported) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = lang === "ar" ? "ar-SA" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // Init: create chat session, load keywords + qa, check api status
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sess, qaData, status, dists] = await Promise.all([
          api.chat.createSession(user.username, "ash-shati-ash-sharqi"),
          api.knowledge.qa(),
          api.chat.status(),
          api.districts.list(),
        ]);
        if (cancelled) return;
        setSessionId(sess.session_id);
        setQuestionPool(Object.values(qaData.categories).flat());
        setApiKeyOk(status.api_key_configured);
        // Filter to the same district set the GIS page uses
        const wanted = ["ash-shati-ash-sharqi", "riyadh", "jeddah", "dammam", "makkah", "madinah", "al-ahsa", "al-seh"];
        setDistricts(dists.districts.filter((d) => wanted.includes(d.id)));
        setMessages([
          {
            role: "assistant",
            content: t(
              "Hello, I'm Rashid — your Digital GIS Employee. Ask me anything about Ash Shati Ash Sharqi, the multi-city expansion analysis, or the Al-Seh sub-area assessment. I'll always answer with the underlying numbers.",
              "مرحباً، أنا راشد — موظفك الرقمي للنظم الجغرافية. اسألني أي شيء عن حي الشاطئ الشرقي، أو تحليل توسع المدن، أو تقييم منطقة السيح. سأجيب دائماً بالأرقام الأساسية.",
            ),
          },
        ]);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, [user.username, lang]);

  // Pick one random demo question per page-mount (refresh = new question).
  const demoHint = useMemo(() => {
    if (questionPool.length === 0) return null;
    return questionPool[Math.floor(Math.random() * questionPool.length)];
  }, [questionPool]);

  // Apply pending prefill (sent from Dashboard "Ask Rashid →" buttons)
  useEffect(() => {
    if (prefillRef.current) {
      setInput(prefillRef.current);
      prefillRef.current = null;
    }
  });

  // Auto-scroll on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!sessionId || !text.trim() || sending) return;
    setSending(true);
    setMessages((m) => [
      ...m,
      { role: "user", content: text },
      { role: "assistant", content: "...", pending: true },
    ]);
    setInput("");

    // Move the background map as soon as the user mentions a district.
    // The user's intent is authoritative — we don't override based on the
    // reply if the user clearly named a district (otherwise comparative
    // mentions like "vs Ash Shati" would steal the focus).
    const fromUser = detectDistrict(text);
    if (fromUser) setFocusedDistrict(fromUser);

    try {
      const res = await api.chat.sendMessage(sessionId, text, lang);
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = { role: "assistant", content: res.reply, source: res.source, keyword: res.keyword };
        return next;
      });
      // Only fall back to the reply when the user's message was scope-ambiguous
      if (!fromUser) {
        const fromReply = detectDistrict(res.reply);
        if (fromReply) setFocusedDistrict(fromReply);
      }
    } catch (e) {
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = {
          role: "assistant",
          content: t(
            `Failed to reach the backend: ${(e as Error).message}`,
            `فشل الاتصال بالخادم: ${(e as Error).message}`,
          ),
        };
        return next;
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: isMobile ? 14 : 24, background: "#f8f9fa", minHeight: "100vh" }}>
      <style>{`@keyframes rashidPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.55); } 50% { box-shadow: 0 0 0 6px rgba(220,38,38,0); } }`}</style>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#160F3E", margin: "0 0 4px" }}>
          {t("Ask Rashid", "اسأل راشد")}
        </h1>
        <p style={{ fontSize: 13, color: "#595959", margin: 0 }}>
          {t(
            "Conversational interface backed by 19 GIS layers and the cached Ash Shati knowledge base.",
            "واجهة محادثة مدعومة بـ19 طبقة جغرافية وقاعدة معرفة الشاطئ الشرقي المُخزَّنة.",
          )}
        </p>
      </div>

      {/* API key warning */}
      {apiKeyOk === false && (
        <div
          style={{
            padding: "10px 14px",
            background: "#FEF3C7",
            border: "1px solid #F59E0B",
            borderRadius: 8,
            color: "#92400E",
            fontSize: 12,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            {t(
              "Anthropic API key not configured. Edit backend/.env to enable chat.",
              "مفتاح Anthropic API غير مُعدّ. عدّل backend/.env لتفعيل المحادثة.",
            )}
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.1fr) minmax(0, 1fr)",
          gap: isMobile ? 12 : 16,
        }}
      >
        {/* LEFT — chat panel */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #EAEAEA",
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            height: isMobile ? "calc(100dvh - 220px)" : "calc(100vh - 200px)",
            minHeight: isMobile ? 420 : 500,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Header — chat title + connection status */}
          <div style={{ borderBottom: "1px solid #EAEAEA", display: "flex", alignItems: "center", padding: "10px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#160F3E" }}>
              {t("Chat", "محادثة")}
            </div>
            <div style={{ marginLeft: "auto", fontSize: 11, color: "#595959", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: apiKeyOk ? "#16A34A" : "#888" }} />
              {t(apiKeyOk ? "Connected" : "Offline", apiKeyOk ? "متصل" : "غير متصل")}
            </div>
          </div>

          {/* Avatar — pinned to chat panel, IN FRONT of message bubbles. Hidden on mobile. */}
          {!isMobile && (
            <img
              src="/assets/rashid-cutout.png"
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: 110,
                right: lang === "ar" ? "auto" : 16,
                left: lang === "ar" ? 16 : "auto",
                width: 170,
                height: "auto",
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 5,
              }}
            />
          )}

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 2 }}>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      maxWidth: m.role === "assistant" ? "92%" : "85%",
                      alignSelf: m.role === "user" ? (lang === "ar" ? "flex-start" : "flex-end") : (lang === "ar" ? "flex-end" : "flex-start"),
                      background: m.role === "user" ? "#26634B" : "#fff",
                      color: m.role === "user" ? "#fff" : "#160F3E",
                      padding: m.role === "assistant" ? "12px 16px" : "10px 14px",
                      borderRadius: 12,
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      whiteSpace: m.role === "user" ? "pre-wrap" : "normal",
                      border: m.role === "assistant" ? "1px solid #C5DAD2" : "none",
                      boxShadow: m.role === "assistant" ? "0 1px 2px rgba(15, 42, 36, 0.04)" : "none",
                      opacity: m.pending ? 0.5 : 1,
                    }}
                  >
                    {m.role === "assistant" && !m.pending ? (
                      <RashidMarkdown text={m.content} />
                    ) : (
                      m.content
                    )}
                    {m.source && m.role === "assistant" && !m.pending && (
                      <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid #F1F5F4", fontSize: 10, color: "#888", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#26634B" }} />
                        {m.source === "anthropic"
                          ? m.keyword
                            ? t(`Rashid · referenced "${m.keyword}"`, `راشد · رجع إلى "${m.keyword}"`)
                            : t("Rashid · cached knowledge base", "راشد · قاعدة المعرفة المُخزَّنة")
                          : m.source === "no-api-key"
                            ? t("API key not configured", "مفتاح API غير مُعدّ")
                            : m.source}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input + rotating demo hint */}
              <div style={{ borderTop: "1px solid #EAEAEA", padding: "10px 14px 14px", background: "rgba(255,255,255,0.95)", position: "relative", zIndex: 2 }}>
                {/* Rotating demo hint — different question per page-load */}
                {demoHint && (
                  <button
                    onClick={() => setInput(lang === "en" ? demoHint.question_en : demoHint.question_ar)}
                    style={{
                      width: "100%",
                      padding: "6px 12px",
                      marginBottom: 8,
                      background: "transparent",
                      border: "1px dashed #C5DAD2",
                      borderRadius: 6,
                      color: "#888",
                      fontSize: 11.5,
                      fontStyle: "italic",
                      cursor: "pointer",
                      textAlign: lang === "ar" ? "right" : "left",
                      fontFamily: "'Noto Naskh Arabic', sans-serif",
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#26634B";
                      e.currentTarget.style.borderColor = "#26634B";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#888";
                      e.currentTarget.style.borderColor = "#C5DAD2";
                    }}
                  >
                    💡 {t("Try: ", "جرّب: ")}
                    {lang === "en" ? demoHint.question_en : demoHint.question_ar}
                  </button>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send(input)}
                    placeholder={t("Ask about parcels, schools, healthcare, contractors…", "اسأل عن القطع، المدارس، الرعاية الصحية، المقاولين…")}
                    disabled={sending}
                    style={{
                      flex: "1 1 200px",
                      minWidth: 0,
                      padding: "10px 14px",
                      border: "1px solid #EAEAEA",
                      borderRadius: 8,
                      fontSize: 13,
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                  {sttSupported && (
                    <button
                      onClick={listening ? stopListening : startListening}
                      disabled={sending}
                      title={t("Talk to Rashid", "تحدّث إلى راشد")}
                      style={{
                        padding: "10px 16px",
                        background: listening ? "#DC2626" : "#fff",
                        color: listening ? "#fff" : "#26634B",
                        border: `1.5px solid ${listening ? "#DC2626" : "#26634B"}`,
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: sending ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        animation: listening ? "rashidPulse 1.2s ease-in-out infinite" : "none",
                      }}
                    >
                      <span style={{ fontSize: 15 }}>{listening ? "🔴" : "🎤"}</span>
                      {t(listening ? "Listening…" : "Talk to Rashid", listening ? "أستمع…" : "تحدّث إلى راشد")}
                    </button>
                  )}
                  <button
                    onClick={() => send(input)}
                    disabled={sending || !input.trim()}
                    style={{
                      padding: "10px 22px",
                      background: sending || !input.trim() ? "#9DB5AC" : "#26634B",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: sending || !input.trim() ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {sending ? "…" : t("Send", "إرسال")}
                  </button>
                </div>
              </div>
        </div>

        {/* RIGHT — responsive map, flies to whichever district was named */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #EAEAEA",
            borderRadius: 10,
            height: isMobile ? 360 : "calc(100vh - 200px)",
            minHeight: isMobile ? 320 : 500,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Map header — shows which district is in focus */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 1000,
              background: "rgba(255,255,255,0.96)",
              border: "1px solid #EAEAEA",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              maxWidth: 280,
            }}
          >
            <div style={{ fontSize: 10, color: "#595959", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>
              {t("Map focus", "تركيز الخريطة")}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#160F3E", marginTop: 2 }}>
              {focusedDistrict
                ? (lang === "en"
                    ? districts.find((d) => d.id === focusedDistrict)?.name ?? "—"
                    : districts.find((d) => d.id === focusedDistrict)?.name_ar ?? "—")
                : t("Saudi-wide overview", "نظرة عامة على المملكة")}
            </div>
            {focusedDistrict && (
              <button
                onClick={() => setFocusedDistrict(null)}
                style={{
                  marginTop: 6,
                  padding: "3px 10px",
                  background: "transparent",
                  border: "1px solid #C5DAD2",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#26634B",
                  cursor: "pointer",
                  fontFamily: "'Noto Naskh Arabic', sans-serif",
                }}
              >
                {t("Reset to Saudi-wide", "العودة إلى المملكة")}
              </button>
            )}
          </div>
          {districts.length > 0 && (
            <ChatBackgroundMap districts={districts} focusedDistrict={focusedDistrict} />
          )}
        </div>
      </div>
    </div>
  );
}
