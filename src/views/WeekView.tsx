import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, CalendarRange, X } from "lucide-react";
import { plan, weekById, phaseById, holidayByDate, weekForDate } from "../plan/plan";
import { useToday } from "../hooks/useToday";
import { addDaysISO, formatHuman } from "../lib/dates";
import type { AppState } from "../hooks/useAppState";
import type { Task, Week } from "../plan/types";
import { TaskCard } from "../components/TaskCard";
import { MoveTaskDialog } from "../components/MoveTaskDialog";
import { shiftPlanFrom } from "../db/repo";
import { cn } from "../lib/utils";

function ShiftPlanDialog({
  today,
  onClose,
}: {
  today: string;
  onClose: () => void;
}) {
  const [days, setDays] = useState(5);
  const [result, setResult] = useState<number | null>(null);

  const apply = async () => {
    const moved = await shiftPlanFrom(today, days);
    setResult(moved);
  };

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-black/60" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-40 mx-auto max-w-sm -translate-y-1/2 rounded-2xl border border-surface-3 bg-surface-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="font-bold">Se me corrió el plan</Dialog.Title>
            <Dialog.Close
              aria-label="Cerrar"
              className="rounded-lg p-1 text-niebla-300 hover:bg-surface-3"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {result === null ? (
            <>
              <Dialog.Description className="mt-1 text-sm text-niebla-300">
                Desplaza todas las tareas pendientes desde hoy, N días hábiles
                hacia adelante (salta findes y festivos). Sin culpa: el
                calendario es guía, no cárcel.
              </Dialog.Description>
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-24 rounded-xl border border-surface-3 bg-surface-2 px-3 py-2 text-center text-lg font-bold"
                />
                <span className="text-sm text-niebla-300">días hábiles</span>
                <button
                  onClick={apply}
                  className="ml-auto rounded-xl bg-musgo-600 px-4 py-2 text-sm font-semibold hover:bg-musgo-500"
                >
                  Desplazar
                </button>
              </div>
            </>
          ) : (
            <div className="mt-3">
              <p className="text-sm">
                Listo: <b>{result}</b> tareas desplazadas {days} días hábiles.
              </p>
              <button
                onClick={onClose}
                className="mt-4 w-full rounded-xl bg-musgo-600 px-4 py-2 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function WeekView({ state }: { state: AppState }) {
  const today = useToday();
  const [weekId, setWeekId] = useState(
    () => weekForDate(today)?.id ?? plan.weeks[0].id,
  );
  const [moving, setMoving] = useState<Task | null>(null);
  const [shifting, setShifting] = useState(false);

  const week = weekById.get(weekId) as Week;
  const phase = phaseById.get(week.phaseId);
  const idx = plan.weeks.findIndex((w) => w.id === weekId);

  // tareas cuya fecha efectiva cae dentro de lun-dom de esta semana
  const weekTasks = useMemo(() => {
    const start = week.startDate;
    const end = addDaysISO(start, 6);
    return plan.tasks
      .filter((t) => {
        const d = state.taskDate(t);
        return d >= start && d <= end;
      })
      .sort((a, b) => {
        const da = state.taskDate(a);
        const db_ = state.taskDate(b);
        if (da !== db_) return da < db_ ? -1 : 1;
        return a.block === b.block ? 0 : a.block === "morning" ? -1 : 1;
      });
  }, [state, week]);

  const byDate = useMemo(() => {
    const m = new Map<string, Task[]>();
    for (const t of weekTasks) {
      const d = state.taskDate(t);
      m.set(d, [...(m.get(d) ?? []), t]);
    }
    return m;
  }, [weekTasks, state]);

  const doneCount = weekTasks.filter((t) => state.doneIds.has(t.id)).length;
  const pct = weekTasks.length
    ? Math.round((doneCount / weekTasks.length) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          disabled={idx === 0}
          onClick={() => setWeekId(plan.weeks[idx - 1].id)}
          aria-label="Semana anterior"
          className="rounded-xl bg-surface-2 p-2 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-lg font-bold">
            S{String(week.number).padStart(2, "0")} · {week.title}
          </h1>
          <p className="text-xs text-niebla-300">
            {phase?.emoji} {phase?.name.split(" — ")[0]} ·{" "}
            {formatHuman(week.startDate)} → {formatHuman(addDaysISO(week.startDate, 4))}
          </p>
        </div>
        <button
          disabled={idx === plan.weeks.length - 1}
          onClick={() => setWeekId(plan.weeks[idx + 1].id)}
          aria-label="Semana siguiente"
          className="rounded-xl bg-surface-2 p-2 disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div>
        <div className="flex justify-between text-xs text-niebla-300">
          <span>
            {doneCount}/{weekTasks.length} tareas
          </span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-musgo-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => setShifting(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-niebla-700 px-4 py-2.5 text-sm font-medium text-niebla-300 hover:border-musgo-400 hover:text-musgo-300"
      >
        <CalendarRange className="h-4 w-4" />
        Se me corrió el plan…
      </button>

      {[...byDate.entries()].map(([date, tasks]) => {
        const holiday = holidayByDate.get(date);
        const isToday = date === today;
        return (
          <section key={date}>
            <h3
              className={cn(
                "mb-2 flex items-center gap-2 text-sm font-bold capitalize",
                isToday ? "text-frailejon-400" : "text-niebla-100",
              )}
            >
              {formatHuman(date)}
              {isToday && (
                <span className="rounded-full bg-frailejon-600/25 px-2 py-0.5 text-[10px] font-semibold text-frailejon-300">
                  HOY
                </span>
              )}
              {holiday && (
                <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] text-niebla-300">
                  festivo: {holiday}
                </span>
              )}
            </h3>
            <div className="flex flex-col gap-2.5">
              {tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  done={state.doneIds.has(t.id)}
                  onMove={setMoving}
                />
              ))}
            </div>
          </section>
        );
      })}

      {weekTasks.length === 0 && (
        <p className="rounded-2xl border border-surface-3 bg-surface-1 p-6 text-center text-sm text-niebla-300">
          Semana sin tareas (o todas fueron movidas).
        </p>
      )}

      <MoveTaskDialog task={moving} onClose={() => setMoving(null)} />
      {shifting && (
        <ShiftPlanDialog today={today} onClose={() => setShifting(false)} />
      )}
    </div>
  );
}
