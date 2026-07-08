import type { Plan } from "../plan/types";

export const XP_JOURNAL = 5;
export const XP_WEEK_BONUS = 50;
export const XP_PHASE_BONUS = 200;

export interface Level {
  n: number;
  name: string;
  minXp: number;
}

export const LEVELS: Level[] = [
  { n: 1, name: "Caminante del Páramo", minXp: 0 },
  { n: 2, name: "Aprendiz de Datos", minXp: 300 },
  { n: 3, name: "Cartógrafo", minXp: 800 },
  { n: 4, name: "Ojo Satelital", minXp: 1600 },
  { n: 5, name: "Ingeniero de la Tierra", minXp: 2800 },
  { n: 6, name: "Guardián del Bosque", minXp: 4400 },
  { n: 7, name: "Especialista NbS", minXp: 6500 },
  { n: 8, name: "Geospatial Engineer", minXp: 9000 },
];

export function levelForXp(xp: number): Level {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.minXp) cur = l;
  return cur;
}

/** Progreso hacia el siguiente nivel: {current, next, pct}. */
export function levelProgress(xp: number): {
  current: Level;
  next: Level | null;
  pct: number;
} {
  const current = levelForXp(xp);
  const next = LEVELS.find((l) => l.minXp > xp) ?? null;
  const pct = next
    ? Math.min(
        100,
        Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100),
      )
    : 100;
  return { current, next, pct };
}

export interface XpBreakdown {
  total: number;
  fromTasks: number;
  fromJournal: number;
  fromWeekBonuses: number;
  fromPhaseBonuses: number;
  completedWeeks: string[];
  completedPhases: string[];
}

/** XP total, recalculado siempre desde los datos (nunca contador mutable). */
export function computeXp(
  plan: Plan,
  doneTaskIds: Set<string>,
  journalDays: number,
): XpBreakdown {
  let fromTasks = 0;
  for (const t of plan.tasks) if (doneTaskIds.has(t.id)) fromTasks += t.xp;

  const completedWeeks: string[] = [];
  for (const w of plan.weeks) {
    const tasks = plan.tasks.filter((t) => t.weekId === w.id);
    if (tasks.length > 0 && tasks.every((t) => doneTaskIds.has(t.id))) {
      completedWeeks.push(w.id);
    }
  }

  const completedPhases: string[] = [];
  for (const p of plan.phases) {
    const weeks = plan.weeks.filter((w) => w.phaseId === p.id);
    if (weeks.length > 0 && weeks.every((w) => completedWeeks.includes(w.id))) {
      completedPhases.push(p.id);
    }
  }

  const fromJournal = journalDays * XP_JOURNAL;
  const fromWeekBonuses = completedWeeks.length * XP_WEEK_BONUS;
  const fromPhaseBonuses = completedPhases.length * XP_PHASE_BONUS;

  return {
    total: fromTasks + fromJournal + fromWeekBonuses + fromPhaseBonuses,
    fromTasks,
    fromJournal,
    fromWeekBonuses,
    fromPhaseBonuses,
    completedWeeks,
    completedPhases,
  };
}
