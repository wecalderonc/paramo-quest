import { db } from "./db";
import { plan, holidaySet, taskById } from "../plan/plan";
import { shiftPlan, moveTask as moveTaskDomain } from "../domain/scheduler";
import { todayISO } from "../lib/dates";

const now = () => new Date().toISOString();

export async function toggleTask(taskId: string, done: boolean): Promise<void> {
  const prev = await db.taskStates.get(taskId);
  await db.taskStates.put({
    taskId,
    status: done ? "done" : "pending",
    completedAt: done ? now() : null,
    scheduledDate: prev?.scheduledDate ?? null,
  });
  await db.activity.add({
    at: now(),
    type: done ? "task_done" : "task_undone",
    payload: { taskId, date: todayISO() },
  });
}

export async function saveJournal(date: string, text: string): Promise<void> {
  const existed = await db.journal.get(date);
  if (text.trim() === "") {
    if (existed) await db.journal.delete(date);
    return;
  }
  await db.journal.put({ date, text });
  if (!existed) {
    await db.activity.add({ at: now(), type: "journal", payload: { date } });
  }
}

export async function moveTaskTo(taskId: string, toDate: string): Promise<void> {
  const { date } = moveTaskDomain(taskId, toDate, holidaySet);
  const prev = await db.taskStates.get(taskId);
  await db.taskStates.put({
    taskId,
    status: prev?.status ?? "pending",
    completedAt: prev?.completedAt ?? null,
    scheduledDate: date === taskById.get(taskId)?.date ? null : date,
  });
  await db.activity.add({
    at: now(),
    type: "task_moved",
    payload: { taskId, to: date },
  });
}

export async function shiftPlanFrom(
  fromDate: string,
  nBusinessDays: number,
): Promise<number> {
  const states = await db.taskStates.toArray();
  const overrides = new Map(
    states
      .filter((s) => s.scheduledDate)
      .map((s) => [s.taskId, s.scheduledDate as string]),
  );
  const done = new Set(
    states.filter((s) => s.status === "done").map((s) => s.taskId),
  );
  const moves = shiftPlan(
    plan.tasks,
    overrides,
    done,
    fromDate,
    nBusinessDays,
    holidaySet,
  );
  await db.transaction("rw", db.taskStates, async () => {
    for (const [taskId, date] of moves) {
      const prev = await db.taskStates.get(taskId);
      await db.taskStates.put({
        taskId,
        status: prev?.status ?? "pending",
        completedAt: prev?.completedAt ?? null,
        scheduledDate: date === taskById.get(taskId)?.date ? null : date,
      });
    }
  });
  await db.activity.add({
    at: now(),
    type: "plan_shifted",
    payload: { fromDate, nBusinessDays, moved: moves.size },
  });
  return moves.size;
}

export interface ExportData {
  version: 1;
  exportedAt: string;
  taskStates: unknown[];
  journal: unknown[];
  activity: unknown[];
  meta: unknown[];
  cardStates?: unknown[];
}

export async function exportAll(): Promise<ExportData> {
  return {
    version: 1,
    exportedAt: now(),
    taskStates: await db.taskStates.toArray(),
    journal: await db.journal.toArray(),
    activity: await db.activity.toArray(),
    meta: await db.meta.toArray(),
    cardStates: await db.cardStates.toArray(),
  };
}

export async function importAll(data: ExportData): Promise<void> {
  if (data.version !== 1) throw new Error("Versión de respaldo no soportada");
  await db.transaction(
    "rw",
    [db.taskStates, db.journal, db.activity, db.meta, db.cardStates],
    async () => {
      await db.taskStates.clear();
      await db.journal.clear();
      await db.activity.clear();
      await db.meta.clear();
      await db.cardStates.clear();
      await db.taskStates.bulkAdd(data.taskStates as never[]);
      await db.journal.bulkAdd(data.journal as never[]);
      await db.activity.bulkAdd(
        (data.activity as { id?: number }[]).map(({ id: _id, ...rest }) => rest) as never[],
      );
      if (data.meta?.length) {
        await db.meta.bulkAdd(data.meta as never[]);
      }
      if (data.cardStates?.length) {
        await db.cardStates.bulkAdd(data.cardStates as never[]);
      }
    },
  );
  await db.activity.add({ at: now(), type: "import", payload: {} });
}

export async function resetAll(): Promise<void> {
  await db.transaction(
    "rw",
    [db.taskStates, db.journal, db.activity, db.meta, db.cardStates],
    async () => {
      await db.taskStates.clear();
      await db.journal.clear();
      await db.activity.clear();
      await db.meta.clear();
      await db.cardStates.clear();
    },
  );
}
