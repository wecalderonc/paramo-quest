import { describe, it, expect } from "vitest";
import {
  tasksForPlanDate,
  isPlanDayComplete,
  nextPlanDayWithTasks,
  defaultPlanCursor,
} from "../planCursor";

const taskDate = (t: { date: string }) => t.date;

describe("planCursor", () => {
  it("encuentra tareas del 13 jul (día 1)", () => {
    const tasks = tasksForPlanDate("2026-07-13", taskDate);
    expect(tasks.length).toBe(2);
  });

  it("día completo cuando todas las tareas están hechas", () => {
    const tasks = tasksForPlanDate("2026-07-13", taskDate);
    const done = new Set(tasks.map((t) => t.id));
    expect(isPlanDayComplete("2026-07-13", taskDate, done)).toBe(true);
    expect(isPlanDayComplete("2026-07-13", taskDate, new Set())).toBe(false);
  });

  it("siguiente día con tareas después del 13 jul es 14 jul", () => {
    expect(nextPlanDayWithTasks("2026-07-13", taskDate)).toBe("2026-07-14");
  });

  it("después del viernes 17 salta al lunes 21 (finde + festivo 20)", () => {
    expect(nextPlanDayWithTasks("2026-07-17", taskDate)).toBe("2026-07-21");
  });

  it("cursor por defecto desde inicio del plan", () => {
    expect(defaultPlanCursor("2026-07-13", taskDate, new Set())).toBe(
      "2026-07-13",
    );
  });

  it("cursor por defecto salta días ya completados", () => {
    const tasks13 = tasksForPlanDate("2026-07-13", taskDate);
    const done = new Set(tasks13.map((t) => t.id));
    expect(defaultPlanCursor("2026-07-13", taskDate, done)).toBe("2026-07-14");
  });
});
