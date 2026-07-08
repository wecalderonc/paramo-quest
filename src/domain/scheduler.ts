import { addBusinessDays, isBusinessDay, addDaysISO } from "../lib/dates";
import type { Task } from "../plan/types";

/** Fecha efectiva de una tarea: override si fue movida, si no la original. */
export function effectiveDate(
  task: Task,
  overrides: Map<string, string>,
): string {
  return overrides.get(task.id) ?? task.date;
}

/** Si la fecha cae en finde/festivo, correr al siguiente día hábil. */
export function snapToBusinessDay(iso: string, holidays: Set<string>): string {
  let cur = iso;
  while (!isBusinessDay(cur, holidays)) cur = addDaysISO(cur, 1);
  return cur;
}

/**
 * "Se me corrió el plan": desplaza todas las tareas pendientes con fecha
 * efectiva >= fromISO, n días hábiles hacia adelante (o atrás con n negativo).
 * Devuelve el mapa de overrides nuevos {taskId -> nuevaFecha}.
 */
export function shiftPlan(
  tasks: Task[],
  overrides: Map<string, string>,
  doneTaskIds: Set<string>,
  fromISO: string,
  nBusinessDays: number,
  holidays: Set<string>,
): Map<string, string> {
  const result = new Map<string, string>();
  for (const t of tasks) {
    if (doneTaskIds.has(t.id)) continue;
    const cur = effectiveDate(t, overrides);
    if (cur < fromISO) continue;
    const snapped = snapToBusinessDay(cur, holidays);
    result.set(t.id, addBusinessDays(snapped, nBusinessDays, holidays));
  }
  return result;
}

/** Mover una sola tarea a una fecha (ajustada a día hábil). */
export function moveTask(
  taskId: string,
  toISO: string,
  holidays: Set<string>,
): { taskId: string; date: string } {
  return { taskId, date: snapToBusinessDay(toISO, holidays) };
}
