import { useRef, useState } from "react";
import Sidebar, { type Section } from "./components/Sidebar";
import Login from "./components/Login";
import Dashboard from "./components/pages/Dashboard";
import GIS from "./components/pages/GIS";
import AskRashid from "./components/pages/AskRashid";
import Reporting from "./components/pages/Reporting";
import { useAuth } from "./auth/AuthContext";

function App() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [section, setSection] = useState<Section>("dashboard");
  const { user, logout } = useAuth();
  // Used to pass an insight title from Dashboard → AskRashid input
  const askRashidPrefill = useRef<string | null>(null);

  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));

  if (!user) {
    return <Login lang={lang} onToggleLang={toggleLang} />;
  }

  const handleAskRashid = (prefill?: string) => {
    if (prefill) askRashidPrefill.current = prefill;
    setSection("ask-rashid");
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8f9fa",
        fontFamily: "'Noto Naskh Arabic', sans-serif",
      }}
    >
      <Sidebar lang={lang} active={section} onChange={setSection} user={user} />

      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 24px",
            background: "#fff",
            borderBottom: "1px solid #EAEAEA",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 13, color: "#595959" }}>
            {lang === "en"
              ? "Geospatial AI Agent · Ministry of Municipalities & Housing"
              : "وكيل الذكاء الاصطناعي الجيومكاني · وزارة البلديات والإسكان"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={toggleLang}
              style={{
                background: "#fff",
                border: "1px solid #EAEAEA",
                borderRadius: 48,
                padding: "6px 16px",
                color: "#160F3E",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "'Noto Naskh Arabic', sans-serif",
                fontWeight: 600,
              }}
            >
              {lang === "en" ? "عربي" : "EN"}
            </button>
            <button
              onClick={logout}
              style={{
                background: "#fff",
                border: "1px solid #EAEAEA",
                borderRadius: 48,
                padding: "6px 16px",
                color: "#595959",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "'Noto Naskh Arabic', sans-serif",
              }}
            >
              {lang === "en" ? "Logout" : "خروج"}
            </button>
          </div>
        </div>

        {/* Active page */}
        <div style={{ flex: 1, minHeight: 0 }}>
          {section === "dashboard" && <Dashboard lang={lang} onAskRashid={handleAskRashid} />}
          {section === "gis" && <GIS lang={lang} />}
          {section === "ask-rashid" && <AskRashid lang={lang} user={user} prefillRef={askRashidPrefill} />}
          {section === "reporting" && <Reporting lang={lang} />}
        </div>
      </main>
    </div>
  );
}

export default App;
