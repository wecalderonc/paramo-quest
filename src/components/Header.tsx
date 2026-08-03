import { Flame, Shield, Mountain } from "lucide-react";
import type { AppState } from "../hooks/useAppState";

export function Header({ state }: { state: AppState }) {
  const { level, streak, xp } = state;
  return (
    <header className="sticky top-0 z-20 border-b border-surface-3/80 bg-surface-0/80 px-4 pb-3 pt-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-musgo-600 to-musgo-800 shadow-glow">
          <Mountain className="h-5 w-5 text-frailejon-300" />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface-0 bg-frailejon-500 text-[10px] font-black text-surface-0">
            {level.current.n}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-bold text-niebla-100">
              {level.current.name}
            </span>
            <span className="shrink-0 text-xs font-medium text-niebla-300">
              <span className="text-frailejon-300">{xp.total.toLocaleString()}</span>
              {level.next && ` / ${level.next.minXp.toLocaleString()}`} XP
            </span>
          </div>
          <div className="bar-shine mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-musgo-500 to-frailejon-400 transition-all duration-500"
              style={{ width: `${Math.max(level.pct, 3)}%` }}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold ${
              streak.doneToday
                ? "bg-frailejon-600/20 text-frailejon-300"
                : "bg-surface-2 text-niebla-500"
            }`}
            title="Racha (días hábiles)"
          >
            <Flame className="h-4 w-4" />
            {streak.current}
          </span>
          <span
            className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 text-sm font-semibold text-niebla-300"
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
