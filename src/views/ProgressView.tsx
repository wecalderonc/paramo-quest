import { useMemo } from "react";
import { Flame, Trophy, CheckCircle2 } from "lucide-react";
import { plan, tasksByWeek, weeksByPhase, PLAN_START, PLAN_END } from "../plan/plan";
import { addDaysISO } from "../lib/dates";
import { useToday } from "../hooks/useToday";
import type { AppState } from "../hooks/useAppState";
import { cn } from "../lib/utils";
import { parseISO, getDay } from "date-fns";

/** Heatmap tipo GitHub: columnas = semanas, filas = lun..dom. */
function Heatmap({ state, today }: { state: AppState; today: string }) {
  const weeks = useMemo(() => {
    const cols: { date: string; count: number }[][] = [];
    let cursor = PLAN_START; // siempre lunes
    while (cursor <= PLAN_END) {
      const col: { date: string; count: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const d = addDaysISO(cursor, i);
        col.push({ date: d, count: state.doneByDay.get(d) ?? 0 });
      }
      cols.push(col);
      cursor = addDaysISO(cursor, 7);
    }
    return cols;
  }, [state.doneByDay]);

  const cellColor = (c: { date: string; count: number }) => {
    if (c.count >= 3) return "bg-musgo-400";
    if (c.count === 2) return "bg-musgo-600";
    if (c.count === 1) return "bg-musgo-800";
    const dow = getDay(parseISO(c.date));
    if (dow === 0 || dow === 6) return "bg-surface-2"; // finde
    return c.date < today ? "bg-surface-3" : "bg-surface-2";
  };

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-[3px]" style={{ minWidth: weeks.length * 13 }}>
        {weeks.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((c) => (
              <div
                key={c.date}
                title={`${c.date}: ${c.count} tareas`}
                className={cn(
                  "h-[10px] w-[10px] rounded-[3px]",
                  cellColor(c),
                  c.date === today && "ring-1 ring-frailejon-400",
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressView({ state }: { state: AppState }) {
  const today = useToday();

  const globalDone = state.doneIds.size;
  const globalTotal = plan.tasks.length;
  const globalPct = Math.round((globalDone / globalTotal) * 100);

  const phaseStats = plan.phases.map((p) => {
    const weeks = weeksByPhase.get(p.id) ?? [];
    const tasks = weeks.flatMap((w) => tasksByWeek.get(w.id) ?? []);
    const done = tasks.filter((t) => state.doneIds.has(t.id)).length;
    return {
      phase: p,
      done,
      total: tasks.length,
      pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    };
  });

  const postsDone = plan.tasks.filter(
    (t) => t.type === "post" && state.doneIds.has(t.id),
  ).length;
  const postsTotal = plan.tasks.filter((t) => t.type === "post").length;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Progreso</h1>

      <section className="rounded-2xl border border-surface-3 bg-surface-2 p-4">
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold">Plan completo</h3>
          <span className="text-sm text-niebla-300">
            {globalDone}/{globalTotal} · {globalPct}%
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-musgo-600 via-musgo-400 to-frailejon-400"
            style={{ width: `${globalPct}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-surface-1 p-2">
            <Flame className="mx-auto h-4 w-4 text-frailejon-400" />
            <p className="mt-1 text-lg font-bold">{state.streak.longest}</p>
            <p className="text-[10px] text-niebla-300">mejor racha</p>
          </div>
          <div className="rounded-xl bg-surface-1 p-2">
            <Trophy className="mx-auto h-4 w-4 text-frailejon-400" />
            <p className="mt-1 text-lg font-bold">
              {postsDone}/{postsTotal}
            </p>
            <p className="text-[10px] text-niebla-300">posts publicados</p>
          </div>
          <div className="rounded-xl bg-surface-1 p-2">
            <CheckCircle2 className="mx-auto h-4 w-4 text-musgo-400" />
            <p className="mt-1 text-lg font-bold">
              {state.xp.completedWeeks.length}
            </p>
            <p className="text-[10px] text-niebla-300">semanas cerradas</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-semibold">Actividad</h3>
        <Heatmap state={state} today={today} />
        <p className="mt-1 text-[11px] text-niebla-700">
          Cada columna es una semana del plan (jul 2026 → may 2027).
        </p>
      </section>

      <section className="flex flex-col gap-2.5">
        <h3 className="font-semibold">Mi camino</h3>
        {phaseStats.map(({ phase, done, total, pct }) => {
          const weeks = weeksByPhase.get(phase.id) ?? [];
          const started = weeks.some((w) => w.startDate <= today);
          const complete = pct === 100;
          return (
            <div
              key={phase.id}
              className={cn(
                "rounded-2xl border p-3.5",
                complete
                  ? "border-musgo-600 bg-musgo-900/30"
                  : started
                    ? "border-surface-3 bg-surface-2"
                    : "border-surface-3 bg-surface-1 opacity-60",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{phase.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {phase.name}
                </span>
                <span className="shrink-0 text-xs text-niebla-300">
                  {done}/{total}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div
                  className={cn(
                    "h-full rounded-full",
                    complete ? "bg-frailejon-400" : "bg-musgo-500",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {phase.deliverable && (
                <p className="mt-1.5 text-[11px] leading-snug text-niebla-300">
                  🎯 {phase.deliverable}
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
