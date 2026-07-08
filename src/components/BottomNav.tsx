import { Sun, CalendarDays, TrendingUp, Settings } from "lucide-react";
import { cn } from "../lib/utils";

export type View = "today" | "week" | "progress" | "settings";

const ITEMS: { id: View; label: string; icon: typeof Sun }[] = [
  { id: "today", label: "Hoy", icon: Sun },
  { id: "week", label: "Semana", icon: CalendarDays },
  { id: "progress", label: "Progreso", icon: TrendingUp },
  { id: "settings", label: "Ajustes", icon: Settings },
];

export function BottomNav({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-surface-3 bg-surface-1/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-xl">
        {ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
              view === id ? "text-frailejon-400" : "text-niebla-300",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
