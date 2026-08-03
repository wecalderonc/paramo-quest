import { useState } from "react";
import { Header } from "./components/Header";
import { BottomNav, type View } from "./components/BottomNav";
import { TodayView } from "./views/TodayView";
import { WeekView } from "./views/WeekView";
import { ReviewView } from "./views/ReviewView";
import { ProgressView } from "./views/ProgressView";
import { SettingsView } from "./views/SettingsView";
import { useAppState } from "./hooks/useAppState";
import { getSimulatedDate } from "./lib/simulatedDate";
import { useSimulatedDateKey } from "./hooks/useToday";

export default function App() {
  const [view, setView] = useState<View>("today");
  const state = useAppState();
  useSimulatedDateKey(); // fuerza re-render al cambiar simulación
  const sim = getSimulatedDate();

  return (
    <div className="min-h-dvh">
      {sim && (
        <div className="flex items-center justify-center gap-2 bg-frailejon-600/15 px-4 py-1.5 text-center text-xs font-medium text-frailejon-300">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-frailejon-400" />
          Modo prueba · hoy simulado: {sim}
          <button
            type="button"
            className="rounded-md px-1.5 py-0.5 underline decoration-frailejon-500/50 hover:bg-frailejon-600/20"
            onClick={() => setView("settings")}
          >
            Ajustes
          </button>
        </div>
      )}
      <Header state={state} />
      <main className="mx-auto max-w-xl px-4 pb-28 pt-5">
        {view === "today" && <TodayView state={state} />}
        {view === "week" && <WeekView state={state} />}
        {view === "review" && <ReviewView state={state} />}
        {view === "progress" && <ProgressView state={state} />}
        {view === "settings" && <SettingsView state={state} />}
      </main>
      <BottomNav view={view} onChange={setView} />
    </div>
  );
}
