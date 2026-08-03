import { Sun, CalendarDays, Brain, TrendingUp, Settings } from "lucide-react";
import { cn } from "../lib/utils";

export type View = "today" | "week" | "review" | "progress" | "settings";

const ITEMS: { id: View; label: string; icon: typeof Sun }[] = [
  { id: "today", label: "Hoy", icon: Sun },
  { id: "week", label: "Semana", icon: CalendarDays },
  { id: "review", label: "Repaso", icon: Brain },
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
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-surface-3/80 bg-surface-0/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-xl px-2 py-1.5">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "tap flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium",
                active ? "text-frailejon-300" : "text-niebla-500 hover:text-niebla-300",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                  active && "bg-frailejon-600/15",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
