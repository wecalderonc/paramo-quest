import Dexie, { type EntityTable } from "dexie";

export interface TaskStateRow {
  taskId: string;
  status: "done" | "pending";
  completedAt: string | null; // ISO datetime
  scheduledDate: string | null; // override de fecha; null = fecha original
}

export interface JournalRow {
  date: string; // yyyy-MM-dd
  text: string;
}

export interface CardStateRow {
  cardId: string;
  due: string; // yyyy-MM-dd — próximo repaso
  interval: number; // días
  ease: number;
  reps: number;
  lapses: number;
  introducedOn: string; // yyyy-MM-dd en que se vio por primera vez
  lastReviewed: string | null; // ISO datetime
}

export interface ActivityRow {
  id?: number;
  at: string; // ISO datetime
  type:
    | "task_done"
    | "task_undone"
    | "task_moved"
    | "plan_shifted"
    | "journal"
    | "import"
    | "cursor_advanced"
    | "review";
  payload: Record<string, unknown>;
}

export interface MetaRow {
  key: string;
  value: unknown;
}

export const db = new Dexie("ParamoQuest") as Dexie & {
  taskStates: EntityTable<TaskStateRow, "taskId">;
  journal: EntityTable<JournalRow, "date">;
  activity: EntityTable<ActivityRow, "id">;
  meta: EntityTable<MetaRow, "key">;
  cardStates: EntityTable<CardStateRow, "cardId">;
};

db.version(1).stores({
  taskStates: "taskId, status, scheduledDate",
  journal: "date",
  activity: "++id, at, type",
});

// v2: tabla meta (planCursor, etc.) — usuarios con v1 instalada necesitan migración
db.version(2).stores({
  taskStates: "taskId, status, scheduledDate",
  journal: "date",
  activity: "++id, at, type",
  meta: "key",
});

// v3: tarjetas de repaso (SRS) — reemplaza a Anki dentro de la app
db.version(3).stores({
  taskStates: "taskId, status, scheduledDate",
  journal: "date",
  activity: "++id, at, type",
  meta: "key",
  cardStates: "cardId, due, introducedOn",
});
