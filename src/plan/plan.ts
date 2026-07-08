import raw from "../data/plan.json";
import type { Plan, Task, Week, Phase } from "./types";

export const plan = raw as unknown as Plan;

export const holidaySet = new Set(plan.holidays.map((h) => h.date));
export const holidayByDate = new Map(plan.holidays.map((h) => [h.date, h.name]));

export const weekById = new Map<string, Week>(plan.weeks.map((w) => [w.id, w]));
export const phaseById = new Map<string, Phase>(
  plan.phases.map((p) => [p.id, p]),
);
export const taskById = new Map<string, Task>(plan.tasks.map((t) => [t.id, t]));

export const tasksByWeek = new Map<string, Task[]>();
for (const t of plan.tasks) {
  const arr = tasksByWeek.get(t.weekId) ?? [];
  arr.push(t);
  tasksByWeek.set(t.weekId, arr);
}

export const weeksByPhase = new Map<string, Week[]>();
for (const w of plan.weeks) {
  const arr = weeksByPhase.get(w.phaseId) ?? [];
  arr.push(w);
  weeksByPhase.set(w.phaseId, arr);
}

export const PLAN_START = plan.weeks[0].startDate;
export const PLAN_END = plan.tasks.reduce(
  (max, t) => (t.date > max ? t.date : max),
  PLAN_START,
);

/** Semana del plan que contiene una fecha (por fecha original). */
export function weekForDate(iso: string): Week | undefined {
  return [...plan.weeks]
    .reverse()
    .find((w) => w.startDate <= iso);
}
