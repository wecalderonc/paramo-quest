import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Trees, NotebookPen, FastForward, Coffee } from "lucide-react";
import { holidayByDate, weekById, phaseById } from "../plan/plan";
import { isWeekend, formatHuman } from "../lib/dates";
import { useToday } from "../hooks/useToday";
import { usePlanCursor } from "../hooks/usePlanCursor";
import type { AppState } from "../hooks/useAppState";
import type { Task } from "../plan/types";
import { TaskCard } from "../components/TaskCard";
import { MoveTaskDialog } from "../components/MoveTaskDialog";
import { db } from "../db/db";
import { saveJournal } from "../db/repo";
import { advancePlanCursor } from "../db/planCursorRepo";
import {
  isPlanDayComplete,
  nextPlanDayWithTasks,
  tasksForPlanDate,
} from "../domain/planCursor";
import { XP_JOURNAL } from "../domain/xp";

function Journal({ planDay }: { planDay: string }) {
  const entry = useLiveQuery(() => db.journal.get(planDay), [planDay]);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (entry) setText(entry.text);
    else setText("");
  }, [entry, planDay]);

  const save = async () => {
    await saveJournal(planDay, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <section className="rounded-2xl border border-surface-3 bg-surface-2 p-4">
      <div className="flex items-center gap-2">
        <NotebookPen className="h-4 w-4 text-frailejon-400" />
        <h3 className="font-semibold">Bitácora del día</h3>
        <span className="ml-auto text-[11px] text-niebla-300">
          +{XP_JOURNAL} XP
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="3 líneas: ¿qué aprendí hoy?"
        className="mt-2 w-full resize-none rounded-xl border border-surface-3 bg-surface-1 p-3 text-sm placeholder:text-niebla-700 focus:border-musgo-500 focus:outline-none"
      />
      <button
        onClick={save}
        disabled={text.trim() === "" && !entry}
        className="mt-2 rounded-xl bg-musgo-600 px-4 py-2 text-sm font-semibold hover:bg-musgo-500 disabled:opacity-40"
      >
        {saved ? "Guardado ✓" : entry ? "Actualizar" : "Guardar"}
      </button>
    </section>
  );
}

function RestDay({ reason }: { reason: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-surface-3 bg-surface-1 px-6 py-14 text-center">
      <Trees className="h-14 w-14 text-musgo-400" />
      <div>
        <h2 className="text-xl font-bold">Hoy se descansa</h2>
        <p className="mt-1 text-niebla-300">{reason}</p>
        <p className="mt-3 text-sm text-musgo-300">
          El páramo espera. La disciplina se sostiene con descanso.
        </p>
      </div>
    </div>
  );
}

function ContinuePrompt({
  nextDay,
  onContinue,
  onStop,
}: {
  nextDay: string;
  onContinue: () => void;
  onStop: () => void;
}) {
  return (
    <section className="rounded-2xl border border-frailejon-500/50 bg-gradient-to-b from-frailejon-600/15 to-surface-2 p-5">
      <div className="flex items-start gap-3">
        <FastForward className="mt-0.5 h-6 w-6 shrink-0 text-frailejon-400" />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-frailejon-200">
            ¿Sigues con el día siguiente?
          </h3>
          <p className="mt-1 text-sm text-niebla-300">
            Completaste este día del plan. Si tienes energía, puedes continuar
            hoy con las tareas del{" "}
            <b className="text-niebla-100">{formatHuman(nextDay)}</b> y acortar
            el tiempo total del plan.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={onContinue}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-musgo-600 px-4 py-3 text-sm font-bold hover:bg-musgo-500"
            >
              <FastForward className="h-4 w-4" />
              Sí, continuar
            </button>
            <button
              onClick={onStop}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-niebla-700 bg-surface-1 px-4 py-3 text-sm font-semibold text-niebla-300 hover:bg-surface-3"
            >
              <Coffee className="h-4 w-4" />
              No, por hoy basta
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TodayView({ state }: { state: AppState }) {
  const [moving, setMoving] = useState<Task | null>(null);
  const [dismissedAdvance, setDismissedAdvance] = useState(false);
  const calendarToday = useToday();
  const planCursor = usePlanCursor();

  // Si cambia el día del plan, mostrar de nuevo el prompt si aplica
  useEffect(() => {
    setDismissedAdvance(false);
  }, [planCursor]);

  const planDay = planCursor ?? calendarToday;

  const dayTasks = useMemo(() => {
    const list = tasksForPlanDate(planDay, state.taskDate);
    return list.sort((a, b) =>
      a.block === b.block ? 0 : a.block === "morning" ? -1 : 1,
    );
  }, [state, planDay]);

  const holidayName = holidayByDate.get(planDay);
  const weekend = isWeekend(planDay);
  const dayComplete = isPlanDayComplete(planDay, state.taskDate, state.doneIds);
  const nextDay = dayComplete
    ? nextPlanDayWithTasks(planDay, state.taskDate)
    : null;
  const isAhead = planDay > calendarToday;

  const week = dayTasks[0] ? weekById.get(dayTasks[0].weekId) : undefined;
  const phase = week ? phaseById.get(week.phaseId) : undefined;

  const handleContinue = async () => {
    if (!nextDay) return;
    await advancePlanCursor(nextDay);
    setDismissedAdvance(false);
  };

  if (!planCursor) {
    return (
      <div className="py-12 text-center text-niebla-300">Cargando plan…</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold capitalize">{formatHuman(planDay)}</h1>
        {isAhead && (
          <p className="mt-1 text-xs font-medium text-frailejon-400">
            Adelantado · calendario real: {formatHuman(calendarToday)}
          </p>
        )}
        {phase && week && (
          <p className="mt-0.5 text-sm text-niebla-300">
            {phase.emoji} {phase.name.split(" — ")[0]} · S
            {String(week.number).padStart(2, "0")}: {week.title}
          </p>
        )}
      </div>

      {holidayName ? (
        <RestDay reason={`Festivo: ${holidayName}. Finde largo, descanso total.`} />
      ) : weekend && dayTasks.length === 0 ? (
        <RestDay reason="Fin de semana: cero estudio por diseño del plan." />
      ) : dayTasks.length === 0 ? (
        <RestDay reason="No hay tareas programadas para este día del plan." />
      ) : (
        <>
          {dayComplete && (
            <div className="rounded-2xl border border-musgo-600 bg-musgo-900/40 px-4 py-3 text-sm font-semibold text-musgo-200">
              Día del plan completado. El páramo está orgulloso. 🌄
            </div>
          )}
          {dayTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              done={state.doneIds.has(t.id)}
              onMove={!dayComplete ? setMoving : undefined}
            />
          ))}
        </>
      )}

      {dayComplete &&
        nextDay &&
        !dismissedAdvance &&
        !weekend &&
        !holidayName && (
          <ContinuePrompt
            nextDay={nextDay}
            onContinue={handleContinue}
            onStop={() => setDismissedAdvance(true)}
          />
        )}

      {dayComplete && dismissedAdvance && nextDay && (
        <button
          type="button"
          onClick={() => setDismissedAdvance(false)}
          className="text-center text-sm text-niebla-300 underline"
        >
          Cambié de opinión — quiero continuar con {formatHuman(nextDay)}
        </button>
      )}

      {!weekend && !holidayName && dayTasks.length > 0 && !dayComplete && (
        <Journal planDay={planDay} />
      )}

      {dayComplete && !nextDay && (
        <p className="text-center text-sm text-musgo-300">
          No hay más días en el plan. ¡Llegaste al final del camino!
        </p>
      )}

      <MoveTaskDialog task={moving} onClose={() => setMoving(null)} />
    </div>
  );
}
