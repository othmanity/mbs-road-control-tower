import { useState } from "react";
import Header from "./components/Header";
import Sidebar, { type View } from "./components/Sidebar";
import Login from "./components/Login";
import Overview from "./pages/Overview";
import CorridorMap from "./pages/CorridorMap";
import ZoneDetail from "./pages/ZoneDetail";
import Activities from "./pages/Activities";
import Reports from "./pages/Reports";
import Chat from "./pages/Chat";
import type { Lang } from "./types";
import { POC_ZONE_IDS } from "./data/corridor";
import { useAuth } from "./auth/AuthContext";

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<View>("overview");
  const [selectedZoneId, setSelectedZoneId] = useState<number>(POC_ZONE_IDS[0]);
  const { user, logout } = useAuth();

  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));

  if (!user) {
    return <Login lang={lang} onToggleLang={toggleLang} />;
  }

  const goToZone = (zoneId: number) => {
    setSelectedZoneId(zoneId);
    setView("zone");
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f4f6f8" }}
    >
      <Header lang={lang} onToggleLang={toggleLang} username={user.username} onLogout={logout} />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Sidebar lang={lang} view={view} onChange={setView} />

        <main style={{ flex: 1, overflow: "auto", padding: 20 }}>
          {view === "overview" && (
            <Overview lang={lang} onOpenMap={() => setView("map")} onOpenZone={goToZone} />
          )}
          {view === "map" && (
            <CorridorMap lang={lang} onOpenZone={goToZone} />
          )}
          {view === "zone" && (
            <ZoneDetail
              lang={lang}
              zoneId={selectedZoneId}
              onChangeZone={setSelectedZoneId}
              onBackToMap={() => setView("map")}
            />
          )}
          {view === "activities" && (
            <Activities lang={lang} onOpenZone={goToZone} />
          )}
          {view === "reports" && (
            <Reports lang={lang} />
          )}
          {view === "chat" && (
            <Chat lang={lang} />
          )}
        </main>
      </div>
    </div>
  );
}
