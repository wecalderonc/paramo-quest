import { db } from "./db";
import {
  defaultPlanCursor,
  type TaskDateFn,
} from "../domain/planCursor";
import { effectiveDate } from "../domain/scheduler";
import { todayISO } from "../lib/dates";

const META_KEY = "planCursor";

export async function getPlanCursor(): Promise<string | null> {
  const row = await db.meta.get(META_KEY);
  return typeof row?.value === "string" ? row.value : null;
}

export async function setPlanCursor(iso: string): Promise<void> {
  await db.meta.put({ key: META_KEY, value: iso });
  await db.activity.add({
    at: new Date().toISOString(),
    type: "cursor_advanced",
    payload: { to: iso },
  });
}

/** Crea el cursor si no existe. Seguro llamar varias veces (idempotente). */
export async function initPlanCursorIfMissing(): Promise<string> {
  return db.transaction("rw", [db.meta, db.taskStates], async () => {
    const row = await db.meta.get(META_KEY);
    if (typeof row?.value === "string") return row.value;

    const states = await db.taskStates.toArray();
    const doneIds = new Set(
      states.filter((s) => s.status === "done").map((s) => s.taskId),
    );
    const overrides = new Map(
      states
        .filter((s) => s.scheduledDate)
        .map((s) => [s.taskId, s.scheduledDate as string]),
    );
    const taskDate: TaskDateFn = (t) => effectiveDate(t, overrides);
    const cursor = defaultPlanCursor(todayISO(), taskDate, doneIds);

    await db.meta.put({ key: META_KEY, value: cursor });
    return cursor;
  });
}

/** @deprecated Usar getPlanCursor + initPlanCursorIfMissing */
export async function ensurePlanCursor(): Promise<string> {
  return initPlanCursorIfMissing();
}

export async function advancePlanCursor(toISO: string): Promise<void> {
  await setPlanCursor(toISO);
}

export async function resetPlanCursor(): Promise<void> {
  await db.meta.delete(META_KEY);
}

/** Borra el cursor para que se recalcule (p. ej. al cambiar fecha simulada). */
export async function reinitPlanCursor(): Promise<string> {
  await resetPlanCursor();
  return initPlanCursorIfMissing();
}
