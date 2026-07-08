export type TaskType = "study" | "project" | "post" | "review";
export type Block = "morning" | "night";

export interface Phase {
  id: string;
  name: string;
  emoji: string;
  description: string;
  deliverable: string;
  order: number;
}

export interface Week {
  id: string;
  phaseId: string;
  number: number;
  title: string;
  startDate: string;
}

export interface Task {
  id: string;
  weekId: string;
  dayOfWeek: number; // 0 = lunes ... 4 = viernes
  block: Block;
  title: string;
  description: string;
  doneCriteria: string;
  resourceUrl: string | null;
  type: TaskType;
  xp: number;
  date: string; // fecha original planeada (ISO)
}

export interface Holiday {
  date: string;
  name: string;
}

export interface Plan {
  phases: Phase[];
  weeks: Week[];
  tasks: Task[];
  holidays: Holiday[];
}
