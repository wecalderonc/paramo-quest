import { Flame, Shield, Mountain } from "lucide-react";
import type { AppState } from "../hooks/useAppState";

export function Header({ state }: { state: AppState }) {
  const { level, streak, xp } = state;
  return (
    <header className="sticky top-0 z-20 border-b border-surface-3 bg-surface-0/95 px-4 pb-3 pt-4 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <Mountain className="h-6 w-6 shrink-0 text-musgo-400" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-bold">
              Nv. {level.current.n} · {level.current.name}
            </span>
            <span className="shrink-0 text-xs text-niebla-300">
              {xp.total.toLocaleString()} XP
              {level.next && ` / ${level.next.minXp.toLocaleString()}`}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-musgo-500 to-frailejon-400 transition-all duration-500"
              style={{ width: `${level.pct}%` }}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 pl-1">
          <span
            className="flex items-center gap-1 font-bold"
            title="Racha (días hábiles)"
          >
            <Flame
              className={
                streak.doneToday
                  ? "h-5 w-5 text-frailejon-400"
                  : "h-5 w-5 text-niebla-700"
              }
            />
            {streak.current}
          </span>
          <span
            className="flex items-center gap-1 text-sm text-niebla-300"
            title="Escudos de racha este mes"
          >
            <Shield className="h-4 w-4" />
            {streak.freezesLeft}
          </span>
        </div>
      </div>
    </header>
  );
}
