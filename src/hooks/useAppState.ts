import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { plan, holidaySet } from "../plan/plan";
import { computeXp, levelProgress, type XpBreakdown } from "../domain/xp";
import { computeStreak, type StreakState } from "../domain/streak";
import { effectiveDate } from "../domain/scheduler";
import { useSimulatedDateKey } from "./useToday";
import { todayISO } from "../lib/dates";
import type { Task } from "../plan/types";

export interface AppState {
  ready: boolean;
  doneIds: Set<string>;
  overrides: Map<string, string>;
  journalDates: Set<string>;
  xp: XpBreakdown;
  level: ReturnType<typeof levelProgress>;
  streak: StreakState;
  /** días con >=1 tarea completada o bitácora (para heatmap/racha) */
  activeDays: Set<string>;
  /** conteo de tareas hechas por día (heatmap) */
  doneByDay: Map<string, number>;
  taskDate: (t: Task) => string;
}

const EMPTY: AppState = {
  ready: false,
  doneIds: new Set(),
  overrides: new Map(),
  journalDates: new Set(),
  xp: computeXp(plan, new Set(), 0),
  level: levelProgress(0),
  streak: computeStreak(new Set(), holidaySet, todayISO()),
  activeDays: new Set(),
  doneByDay: new Map(),
  taskDate: (t) => t.date,
};

export function useAppState(): AppState {
  const simKey = useSimulatedDateKey();
  const state = useLiveQuery(async () => {
    const [states, journal, activity] = await Promise.all([
      db.taskStates.toArray(),
      db.journal.toArray(),
      db.activity.toArray(),
    ]);

    const doneIds = new Set(
      states.filter((s) => s.status === "done").map((s) => s.taskId),
    );
    const overrides = new Map(
      states
        .filter((s) => s.scheduledDate)
        .map((s) => [s.taskId, s.scheduledDate as string]),
    );
    const journalDates = new Set(journal.map((j) => j.date));

    // días activos: día en que se completó una tarea (task_done), bitácora o repaso
    const activeDays = new Set<string>();
    const doneByDay = new Map<string, number>();
    const undoneCount = new Map<string, number>();
    let reviewCount = 0;
    for (const a of activity) {
      const d =
        (a.payload as { date?: string }).date ?? a.at.slice(0, 10);
      if (a.type === "task_done") {
        activeDays.add(d);
        doneByDay.set(d, (doneByDay.get(d) ?? 0) + 1);
      } else if (a.type === "task_undone") {
        undoneCount.set(d, (undoneCount.get(d) ?? 0) + 1);
      } else if (a.type === "journal") {
        activeDays.add(d);
      } else if (a.type === "review") {
        activeDays.add(d);
        reviewCount++;
      }
    }
    // compensar unchecks del mismo día
    for (const [d, n] of undoneCount) {
      const net = (doneByDay.get(d) ?? 0) - n;
      if (net <= 0) {
        doneByDay.delete(d);
        if (!journalDates.has(d)) activeDays.delete(d);
      } else {
        doneByDay.set(d, net);
      }
    }

    const xp = computeXp(plan, doneIds, journalDates.size, reviewCount);
    const today = todayISO();

    return {
      ready: true,
      doneIds,
      overrides,
      journalDates,
      xp,
      level: levelProgress(xp.total),
      streak: computeStreak(activeDays, holidaySet, today),
      activeDays,
      doneByDay,
      taskDate: (t: Task) => effectiveDate(t, overrides),
    } satisfies AppState;
  }, [simKey]);

  return state ?? EMPTY;
}
