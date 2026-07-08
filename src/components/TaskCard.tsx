import { useState } from "react";
import { Sunrise, Moon, ExternalLink, CalendarClock, Check } from "lucide-react";
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
  study: "bg-niebla-900 text-niebla-300",
  project: "bg-musgo-800 text-musgo-200",
  post: "bg-frailejon-600/25 text-frailejon-300",
  review: "bg-purple-900/40 text-purple-300",
};

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

  const handleToggle = async () => {
    const next = !done;
    await toggleTask(task.id, next);
    if (next) {
      setJustChecked(true);
      setTimeout(() => setJustChecked(false), 1200);
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-4 transition-colors",
        done
          ? "border-musgo-800 bg-surface-1 opacity-70"
          : "border-surface-3 bg-surface-2",
      )}
    >
      {justChecked && (
        <span className="animate-xp-pop pointer-events-none absolute -top-1 right-4 text-sm font-bold text-frailejon-400">
          +{task.xp} XP
        </span>
      )}
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          aria-label={done ? "Desmarcar tarea" : "Marcar tarea como hecha"}
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 transition-colors",
            done
              ? "border-musgo-500 bg-musgo-500 text-surface-0"
              : "border-niebla-700 bg-transparent hover:border-musgo-400",
          )}
        >
          {done && <Check className="animate-check-in h-5 w-5" strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {task.block === "morning" ? (
              <Sunrise className="h-4 w-4 text-frailejon-400" />
            ) : (
              <Moon className="h-4 w-4 text-niebla-300" />
            )}
            <span
              className={cn(
                "font-semibold leading-tight",
                done && "line-through decoration-musgo-500/60",
              )}
            >
              {task.title}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                TYPE_STYLE[task.type],
              )}
            >
              {TYPE_LABEL[task.type]} · {task.xp} XP
            </span>
            {showDate && (
              <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[11px] text-niebla-300">
                {showDate}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm leading-snug text-niebla-100/90">
            {task.description}
          </p>

          {task.doneCriteria && (
            <p className="mt-1.5 text-xs text-musgo-300">
              <span className="font-semibold">Hecho cuando:</span>{" "}
              {task.doneCriteria}
            </p>
          )}

          <div className="mt-2 flex items-center gap-4">
            {task.resourceUrl && (
              <a
                href={task.resourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-frailejon-300 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Recurso
              </a>
            )}
            {onMove && !done && (
              <button
                onClick={() => onMove(task)}
                className="inline-flex items-center gap-1 text-xs font-medium text-niebla-300 hover:text-niebla-100"
              >
                <CalendarClock className="h-3.5 w-3.5" /> Mover
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
