import { useEffect, useRef } from "react";
import { conversationFlow, subAgentMeta, type AgentMessage, type SubAgent } from "../data/mockData";
import type { AgentState } from "../hooks/useAgentSimulation";

interface WorkflowTrackerProps {
  lang: "en" | "ar";
  agentState: AgentState;
  request: string;
  onChoice: (labelEn: string, labelAr: string) => void;
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%", background: "#26634B", opacity: 0.5,
            animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-6px);opacity:1} }`}</style>
    </div>
  );
}

function AgentBadge({ agent, lang }: { agent: SubAgent; lang: "en" | "ar" }) {
  const meta = subAgentMeta[agent];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: `${meta.color}12`, border: `1.5px solid ${meta.color}40`,
        borderRadius: 48, padding: "3px 12px", fontSize: 11, fontWeight: 600,
        color: meta.color,
      }}
    >
      {meta.icon} {lang === "en" ? meta.labelEn : meta.labelAr}
    </span>
  );
}

function ActiveAgentsPanel({ visibleMessages, lang }: { visibleMessages: AgentMessage[]; lang: "en" | "ar" }) {
  // Derive which agents have been invoked
  const invokedAgents = new Set<SubAgent>();
  const completedAgents = new Set<SubAgent>();
  let currentAgent: SubAgent | null = null;

  for (const msg of visibleMessages) {
    if (msg.type === "agent-handoff" && msg.subAgent) {
      invokedAgents.add(msg.subAgent);
      currentAgent = msg.subAgent;
    }
    if (msg.type === "system" && currentAgent) {
      completedAgents.add(currentAgent);
    }
  }
  invokedAgents.add("orchestrator");

  const allAgents: SubAgent[] = ["orchestrator", "retrieval", "data-quality", "spatial", "reporting", "citation"];

  return (
    <div
      style={{
        background: "#fff", borderRadius: 8, border: "1px solid #EAEAEA",
        padding: "14px 16px", marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: "#160F3E", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {lang === "en" ? "Active Agents" : "الوكلاء النشطون"}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {allAgents.map((agent) => {
          const meta = subAgentMeta[agent];
          const invoked = invokedAgents.has(agent);
          const done = completedAgents.has(agent);
          return (
            <div
              key={agent}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 8, fontSize: 12,
                background: invoked ? `${meta.color}10` : "#f8f9fa",
                border: `1.5px solid ${invoked ? meta.color + "50" : "#EAEAEA"}`,
                opacity: invoked ? 1 : 0.4,
                transition: "all 0.3s ease",
              }}
            >
              <span style={{ fontSize: 14 }}>{meta.icon}</span>
              <span style={{ fontWeight: 600, color: invoked ? meta.color : "#595959" }}>
                {lang === "en" ? meta.labelEn : meta.labelAr}
              </span>
              {done && <span style={{ color: "#006604", fontSize: 12, marginLeft: 2 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WorkflowTracker({ lang, agentState, request, onChoice }: WorkflowTrackerProps) {
  const { visibleMessages, isThinking, phase, pendingChoice } = agentState;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [visibleMessages, isThinking, pendingChoice]);

  const totalSteps = conversationFlow.filter((m) => m.type === "rashid").length;
  const completedSteps = visibleMessages.filter((m) => m.type === "rashid").length;

  return (
    <div style={{ minHeight: "calc(100vh - 75px)", padding: 24, maxWidth: 760, margin: "0 auto" }}>
      {/* Request banner */}
      <div
        style={{
          backgroundImage: "linear-gradient(to right, #066058, #26634B)",
          borderRadius: 8, padding: "16px 22px", marginBottom: 16, color: "#fff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 3 }}>
            {lang === "en" ? "Analysis Request" : "طلب التحليل"}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{request}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{lang === "en" ? "Progress" : "التقدم"}</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{completedSteps}/{totalSteps}</div>
        </div>
      </div>

      {/* Active agents panel */}
      <ActiveAgentsPanel visibleMessages={visibleMessages} lang={lang} />

      {/* Progress bar */}
      <div style={{ height: 3, background: "#EAEAEA", borderRadius: 2, marginBottom: 16 }}>
        <div
          style={{
            height: "100%", background: phase === "complete" ? "#006604" : "#26634B",
            borderRadius: 2, width: `${(completedSteps / totalSteps) * 100}%`, transition: "width 0.6s ease",
          }}
        />
      </div>

      {/* Chat conversation */}
      <div
        ref={scrollRef}
        style={{
          maxHeight: "calc(100vh - 380px)", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 12, paddingBottom: 16,
        }}
      >
        {visibleMessages.map((msg) => {

          // --- Rashid message (with sub-agent badge) ---
          if (msg.type === "rashid") {
            const agent = msg.subAgent || "orchestrator";
            const meta = subAgentMeta[agent];
            return (
              <div key={msg.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", animation: "fadeInUp 0.4s ease-out" }}>
                <div
                  style={{
                    width: 38, height: 38, borderRadius: "50%", overflow: "hidden",
                    border: `2px solid ${meta.color}`, flexShrink: 0, marginTop: 2,
                  }}
                >
                  <img src="/assets/rashid-avatar.png" alt="Rashid" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#595959", fontWeight: 600 }}>
                      {lang === "en" ? "Rashid" : "راشد"}
                    </span>
                    <AgentBadge agent={agent} lang={lang} />
                  </div>
                  <div
                    style={{
                      background: "#fff", border: "1px solid #EAEAEA",
                      borderRadius: "2px 8px 8px 8px", padding: "12px 16px",
                      fontSize: 14, lineHeight: 1.6, color: "#323232",
                    }}
                  >
                    {lang === "en" ? msg.textEn : msg.textAr}
                  </div>
                </div>
              </div>
            );
          }

          // --- Agent handoff ---
          if (msg.type === "agent-handoff" && msg.subAgent) {
            const meta = subAgentMeta[msg.subAgent];
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: "center", animation: "fadeInUp 0.3s ease-out" }}>
                <div
                  style={{
                    border: `1.5px dashed ${meta.color}60`, borderRadius: 48,
                    padding: "6px 18px", fontSize: 12, fontWeight: 600,
                    color: meta.color, display: "flex", alignItems: "center", gap: 6,
                    background: `${meta.color}08`,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{meta.icon}</span>
                  {lang === "en" ? msg.textEn : msg.textAr}
                </div>
              </div>
            );
          }

          // --- Tool call ---
          if (msg.type === "tool-call") {
            return (
              <div key={msg.id} style={{ marginLeft: 50, animation: "fadeInUp 0.3s ease-out" }}>
                <div
                  style={{
                    background: "#160F3E", color: "#0AEBD7", borderRadius: 8,
                    padding: "10px 16px", fontSize: 12, fontFamily: "monospace",
                    lineHeight: 1.5, position: "relative",
                  }}
                >
                  <span style={{ position: "absolute", top: 6, right: 10, fontSize: 10, color: "#595959", fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                    {msg.subAgent && subAgentMeta[msg.subAgent] ? `${subAgentMeta[msg.subAgent].icon} tool` : "tool"}
                  </span>
                  {lang === "en" ? msg.textEn : msg.textAr}
                </div>
              </div>
            );
          }

          // --- Planning ---
          if (msg.type === "planning") {
            return (
              <div key={msg.id} style={{ marginLeft: 50, animation: "fadeInUp 0.3s ease-out" }}>
                <div
                  style={{
                    background: "rgba(38,99,75,0.06)", border: "1.5px solid rgba(38,99,75,0.2)",
                    borderRadius: 8, padding: "12px 16px", fontSize: 13, lineHeight: 1.6,
                    color: "#144D3F",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, color: "#26634B", display: "flex", alignItems: "center", gap: 4 }}>
                    📋 {lang === "en" ? "PLAN" : "الخطة"}
                  </div>
                  {lang === "en" ? msg.textEn : msg.textAr}
                </div>
              </div>
            );
          }

          // --- Memory ---
          if (msg.type === "memory") {
            return (
              <div key={msg.id} style={{ marginLeft: 50, animation: "fadeInUp 0.3s ease-out" }}>
                <div
                  style={{
                    background: "rgba(85,5,205,0.05)", border: "1.5px solid rgba(85,5,205,0.2)",
                    borderRadius: 8, padding: "12px 16px", fontSize: 13, lineHeight: 1.6,
                    color: "#3C2B7D",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, color: "#5505CD", display: "flex", alignItems: "center", gap: 4 }}>
                    🧠 {lang === "en" ? "MEMORY" : "الذاكرة"}
                  </div>
                  {lang === "en" ? msg.textEn : msg.textAr}
                </div>
              </div>
            );
          }

          // --- Feedback ---
          if (msg.type === "feedback") {
            return (
              <div key={msg.id} style={{ marginLeft: 50, animation: "fadeInUp 0.3s ease-out" }}>
                <div
                  style={{
                    background: "rgba(255,193,7,0.08)", border: "1.5px solid rgba(255,193,7,0.3)",
                    borderRadius: 8, padding: "12px 16px", fontSize: 13, lineHeight: 1.6,
                    color: "#594300",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, color: "#b38600", display: "flex", alignItems: "center", gap: 4 }}>
                    🔄 {lang === "en" ? "FEEDBACK LOOP" : "حلقة التغذية الراجعة"}
                  </div>
                  {lang === "en" ? msg.textEn : msg.textAr}
                </div>
              </div>
            );
          }

          // --- System notification ---
          if (msg.type === "system") {
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: "center", animation: "fadeInUp 0.3s ease-out" }}>
                <div
                  style={{
                    background: "#ACDDC7", color: "#144D3F", borderRadius: 48,
                    padding: "6px 18px", fontSize: 12, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span style={{ fontSize: 14 }}>✓</span>
                  {lang === "en" ? msg.textEn : msg.textAr}
                </div>
              </div>
            );
          }

          // --- User prompt ---
          if (msg.type === "user-prompt") {
            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, animation: "fadeInUp 0.3s ease-out" }}>
                <span style={{ fontSize: 11, color: "#595959", fontWeight: 600, marginRight: 6 }}>
                  {lang === "en" ? "You" : "أنت"}
                </span>
                <div
                  style={{
                    background: "#160F3E", color: "#fff",
                    borderRadius: "8px 2px 8px 8px", padding: "10px 18px",
                    fontSize: 14, maxWidth: "70%",
                    boxShadow: "0 2px 8px rgba(22,15,62,0.18)",
                  }}
                >
                  {lang === "en" ? msg.textEn : msg.textAr}
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* Inline choice prompt (auto-advances) */}
        {pendingChoice && pendingChoice.options && (
          <div
            key={`choice-${pendingChoice.id}`}
            style={{
              marginLeft: 50,
              animation: "fadeInUp 0.3s ease-out",
              background: "#fff",
              border: "1.5px solid #26634B50",
              borderRadius: 8,
              padding: "14px 16px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, color: "#26634B", display: "flex", alignItems: "center", gap: 4 }}>
              🖐 {lang === "en" ? "Approve to continue" : "وافق للمتابعة"}
            </div>
            <div style={{ fontSize: 14, color: "#323232", marginBottom: 12, lineHeight: 1.5 }}>
              {lang === "en" ? pendingChoice.textEn : pendingChoice.textAr}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {pendingChoice.options.map((opt) => (
                <button
                  key={opt.labelEn}
                  onClick={() => onChoice(opt.labelEn, opt.labelAr)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 48,
                    border: opt.recommended ? "none" : "1.5px solid #26634B",
                    background: opt.recommended ? "#26634B" : "#fff",
                    color: opt.recommended ? "#fff" : "#26634B",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Noto Naskh Arabic', sans-serif",
                  }}
                >
                  {lang === "en" ? opt.labelEn : opt.labelAr}
                  {opt.recommended && (
                    <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.85 }}>
                      {lang === "en" ? "• recommended" : "• موصى به"}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: "#595959", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{lang === "en" ? "Auto-selecting recommended…" : "سيتم اختيار الموصى به تلقائياً…"}</span>
            </div>
            <div
              key={`bar-${pendingChoice.id}`}
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                height: 3,
                width: "100%",
                background: "#26634B",
                transformOrigin: "left center",
                animation: "choiceCountdown 4.5s linear forwards",
              }}
            />
            <style>{`@keyframes choiceCountdown { from { transform: scaleX(1); } to { transform: scaleX(0); } }`}</style>
          </div>
        )}

        {/* Thinking indicator */}
        {isThinking && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", animation: "fadeInUp 0.3s ease-out" }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: "50%", overflow: "hidden",
                border: "2px solid #26634B", flexShrink: 0, marginTop: 2,
              }}
            >
              <img src="/assets/rashid-avatar.png" alt="Rashid" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#595959", marginBottom: 4, fontWeight: 600 }}>
                {lang === "en" ? "Rashid" : "راشد"}
              </div>
              <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "2px 8px 8px 8px", padding: "12px 16px", display: "inline-block" }}>
                <TypingIndicator />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "#fff", borderRadius: 8, padding: "10px 18px",
          border: "1px solid #EAEAEA", marginTop: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: phase === "complete" ? "#006604" : phase === "waiting" ? "#005A96" : "#FFC107",
              animation: phase === "running" || phase === "waiting" ? "progressPulse 1.5s infinite" : "none",
            }}
          />
          <span style={{ fontSize: 13, color: "#595959" }}>
            {phase === "running" && (lang === "en" ? "Rashid is orchestrating..." : "راشد ينسق العمل...")}
            {phase === "waiting" && (lang === "en" ? "Awaiting your input" : "بانتظار إدخالك")}
            {phase === "complete" && (lang === "en" ? "All agents completed" : "اكتمل عمل جميع الوكلاء")}
            {phase === "idle" && (lang === "en" ? "Idle" : "في وضع الانتظار")}
          </span>
        </div>
        <span style={{ fontSize: 12, color: "#595959" }}>
          {lang === "en" ? "Multi-Agent Protocol Active" : "بروتوكول الوكلاء المتعدد نشط"}
        </span>
      </div>
    </div>
  );
}
