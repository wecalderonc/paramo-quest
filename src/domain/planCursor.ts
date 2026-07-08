import { addDaysISO } from "../lib/dates";
import { PLAN_END, PLAN_START, plan } from "../plan/plan";
import type { Task } from "../plan/types";

export type TaskDateFn = (task: Task) => string;

/** Tareas programadas para una fecha del plan (fecha efectiva). */
export function tasksForPlanDate(
  iso: string,
  taskDate: TaskDateFn,
): Task[] {
  return plan.tasks.filter((t) => taskDate(t) === iso);
}

export function isPlanDayComplete(
  iso: string,
  taskDate: TaskDateFn,
  doneIds: Set<string>,
): boolean {
  const tasks = tasksForPlanDate(iso, taskDate);
  return tasks.length > 0 && tasks.every((t) => doneIds.has(t.id));
}

/** Siguiente fecha del plan que tenga al menos una tarea (puede ser finde/festivo). */
export function nextPlanDayWithTasks(
  fromISO: string,
  taskDate: TaskDateFn,
): string | null {
  let cur = addDaysISO(fromISO, 1);
  while (cur <= PLAN_END) {
    if (tasksForPlanDate(cur, taskDate).length > 0) return cur;
    cur = addDaysISO(cur, 1);
  }
  return null;
}

/** Primer día del plan con tareas pendientes, empezando desde `fromISO`. */
export function firstPendingPlanDay(
  fromISO: string,
  taskDate: TaskDateFn,
  doneIds: Set<string>,
): string | null {
  let cur = fromISO < PLAN_START ? PLAN_START : fromISO;
  while (cur <= PLAN_END) {
    const tasks = tasksForPlanDate(cur, taskDate);
    if (tasks.length > 0 && tasks.some((t) => !doneIds.has(t.id))) return cur;
    cur = addDaysISO(cur, 1);
  }
  return null;
}

/** Cursor inicial: hoy del calendario o inicio del plan, lo que sea posterior. */
export function defaultPlanCursor(
  today: string,
  taskDate: TaskDateFn,
  doneIds: Set<string>,
): string {
  const start = today < PLAN_START ? PLAN_START : today;
  return (
    firstPendingPlanDay(start, taskDate, doneIds) ??
    firstPlanDayWithTasks(taskDate) ??
    PLAN_START
  );
}

function firstPlanDayWithTasks(taskDate: TaskDateFn): string | null {
  let cur = PLAN_START;
  while (cur <= PLAN_END) {
    if (tasksForPlanDate(cur, taskDate).length > 0) return cur;
    cur = addDaysISO(cur, 1);
  }
  return null;
}
