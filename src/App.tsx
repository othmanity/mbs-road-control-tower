import { useState, useEffect } from "react";
import Header from "./components/Header";
import ChatInput from "./components/ChatInput";
import WorkflowTracker from "./components/WorkflowTracker";
import ResultsDashboard from "./components/ResultsDashboard";
import Login from "./components/Login";
import { useAgentSimulation } from "./hooks/useAgentSimulation";
import { useAuth } from "./auth/AuthContext";

type Screen = "chat" | "workflow" | "results";

function App() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [screen, setScreen] = useState<Screen>("chat");
  const [request, setRequest] = useState("");
  const { state: agentState, startSimulation, submitChoice, reset: resetAgent } = useAgentSimulation();
  const { user, logout } = useAuth();

  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));

  // Transition from workflow to results when agent completes
  useEffect(() => {
    if (agentState.phase === "complete") {
      const timer = setTimeout(() => setScreen("results"), 1200);
      return () => clearTimeout(timer);
    }
  }, [agentState.phase]);

  const handleSubmit = (message: string) => {
    setRequest(message);
    setScreen("workflow");
    startSimulation();
  };

  const handleReset = () => {
    resetAgent();
    setRequest("");
    setScreen("chat");
  };

  const handleLogout = () => {
    resetAgent();
    setRequest("");
    setScreen("chat");
    logout();
  };

  // ---- AUTH GATE ----
  if (!user) {
    return <Login lang={lang} onToggleLang={toggleLang} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <Header
        lang={lang}
        onToggleLang={toggleLang}
        user={user}
        onLogout={handleLogout}
      />

      {screen === "chat" && <ChatInput lang={lang} onSubmit={handleSubmit} />}

      {screen === "workflow" && (
        <WorkflowTracker lang={lang} agentState={agentState} request={request} onChoice={submitChoice} />
      )}

      {screen === "results" && (
        <ResultsDashboard lang={lang} request={request} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;
