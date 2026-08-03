import { useState } from "react";
import {
  Sunrise,
  Moon,
  ExternalLink,
  CalendarClock,
  Check,
  Target,
  Clock,
} from "lucide-react";
import type { Task } from "../plan/types";
import { toggleTask } from "../db/repo";
import { cn } from "../lib/utils";

const TYPE_LABEL: Record<Task["type"], string> = {
  study: "Estudio",
  project: "Proyecto",
  post: "Post",
  review: "Revisión",
};

const TYPE_STYLE: Record<Task["type"], string> = {
  study: "bg-niebla-900 text-niebla-200 ring-1 ring-niebla-700/60",
  project: "bg-musgo-800 text-musgo-100 ring-1 ring-musgo-600/60",
  post: "bg-frailejon-600/25 text-frailejon-200 ring-1 ring-frailejon-500/40",
  review: "bg-purple-900/40 text-purple-200 ring-1 ring-purple-500/40",
};

type TaskStep = {
  minutes: string | null;
  text: string;
};

function parseTaskSteps(description: string): TaskStep[] {
  return description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^•\s*/, ""))
    .map((line) => {
      const withMinutes = line.match(/^\(([^)]+)\)\s*(.+)$/);
      if (withMinutes) {
        return { minutes: withMinutes[1], text: withMinutes[2] };
      }
      return { minutes: null, text: line };
    });
}

/** Extrae minutos de una etiqueta tipo "20 min", "1 h", "1 h 30 min". */
function stepMinutes(label: string | null): number {
  if (!label) return 0;
  const h = label.match(/(\d+)\s*h/i);
  const m = label.match(/(\d+)\s*min/i);
  let total = 0;
  if (h) total += Number(h[1]) * 60;
  if (m) total += Number(m[1]);
  if (!h && !m) {
    const n = label.match(/(\d+)/);
    if (n) total += Number(n[1]);
  }
  return total;
}

function formatDuration(total: number): string {
  if (total <= 0) return "";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}

export function TaskCard({
  task,
  done,
  onMove,
  showDate,
}: {
  task: Task;
  done: boolean;
  onMove?: (task: Task) => void;
  showDate?: string;
}) {
  const [justChecked, setJustChecked] = useState(false);
  const steps = parseTaskSteps(task.description);
  const hasStructuredSteps = steps.length > 1 || steps.some((s) => s.minutes);
  const totalMinutes = steps.reduce((sum, s) => sum + stepMinutes(s.minutes), 0);
  const isMorning = task.block === "morning";

  const handleToggle = async () => {
    const next = !done;
    await toggleTask(task.id, next);
    if (next) {
      setJustChecked(true);
      setTimeout(() => setJustChecked(false), 1200);
    }
  };

  return (
    <article
      className={cn(
        "group animate-fade-in-up relative overflow-hidden rounded-2xl border shadow-card transition-colors",
        done
          ? "border-musgo-800/70 bg-surface-1/70"
          : "border-surface-3 bg-surface-2 hover:border-musgo-700",
      )}
    >
      {/* Barra de acento según bloque */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          done
            ? "bg-musgo-700/50"
            : isMorning
              ? "bg-gradient-to-b from-frailejon-400 to-frailejon-600"
              : "bg-gradient-to-b from-niebla-500 to-niebla-700",
        )}
      />

      {justChecked && (
        <span className="animate-xp-pop pointer-events-none absolute -top-1 right-4 text-sm font-bold text-frailejon-400">
          +{task.xp} XP
        </span>
      )}

      <div className="flex gap-3 p-4 pl-5">
        <button
          onClick={handleToggle}
          aria-label={done ? "Desmarcar tarea" : "Marcar tarea como hecha"}
          className={cn(
            "tap mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2",
            done
              ? "border-musgo-500 bg-musgo-500 text-surface-0"
              : "border-niebla-700 bg-surface-1/60 hover:border-musgo-400 hover:bg-musgo-900/40",
          )}
        >
          {done && <Check className="animate-check-in h-5 w-5" strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          {/* Fila de metadatos */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                isMorning
                  ? "bg-frailejon-600/15 text-frailejon-300"
                  : "bg-niebla-900 text-niebla-300",
              )}
            >
              {isMorning ? (
                <Sunrise className="h-3 w-3" />
              ) : (
                <Moon className="h-3 w-3" />
              )}
              {isMorning ? "Mañana" : "Noche"}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                TYPE_STYLE[task.type],
              )}
            >
              {TYPE_LABEL[task.type]} · +{task.xp} XP
            </span>
            {totalMinutes > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-niebla-200">
                <Clock className="h-3 w-3" />≈ {formatDuration(totalMinutes)}
              </span>
            )}
            {showDate && (
              <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[11px] text-niebla-300">
                {showDate}
              </span>
            )}
          </div>

          <h3
            className={cn(
              "mt-1.5 text-[15px] font-bold leading-tight tracking-tight",
              done ? "text-niebla-300 line-through decoration-musgo-500/60" : "text-niebla-100",
            )}
          >
            {task.title}
          </h3>

          {/* Meta / objetivo, lo primero que ayuda a entender la tarea */}
          {task.doneCriteria && (
            <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-musgo-700/40 bg-musgo-900/25 px-3 py-2">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-musgo-300" />
              <p className="text-xs leading-snug text-musgo-100">
                <span className="font-semibold text-musgo-200">Lo logras cuando:</span>{" "}
                {task.doneCriteria}
              </p>
            </div>
          )}

          {/* Pasos */}
          {hasStructuredSteps ? (
            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-niebla-500">
                Cómo hacerlo
              </p>
              <ol className="space-y-1.5">
                {steps.map((step, idx) => (
                  <li
                    key={`${task.id}-step-${idx}`}
                    className="flex items-start gap-2.5"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-3 text-[10px] font-bold text-niebla-300">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      {step.minutes && (
                        <span className="mr-1.5 inline-flex items-center rounded bg-frailejon-600/15 px-1.5 py-px text-[10px] font-semibold text-frailejon-300">
                          {step.minutes}
                        </span>
                      )}
                      <span className="text-sm leading-snug text-niebla-100/90">
                        {step.text}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-line text-sm leading-snug text-niebla-100/90">
              {task.description}
            </p>
          )}

          {/* Acciones */}
          {(task.resourceUrl || (onMove && !done)) && (
            <div className="mt-3 flex items-center gap-2 border-t border-surface-3/70 pt-2.5">
              {task.resourceUrl && (
                <a
                  href={task.resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="tap inline-flex items-center gap-1.5 rounded-lg bg-frailejon-600/15 px-2.5 py-1 text-xs font-semibold text-frailejon-300 hover:bg-frailejon-600/25"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Abrir recurso
                </a>
              )}
              {onMove && !done && (
                <button
                  onClick={() => onMove(task)}
                  className="tap ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-niebla-300 hover:bg-surface-3 hover:text-niebla-100"
                >
                  <CalendarClock className="h-3.5 w-3.5" /> Mover
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
