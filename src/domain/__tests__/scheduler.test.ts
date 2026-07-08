import { describe, it, expect } from "vitest";
import { shiftPlan, moveTask, snapToBusinessDay, effectiveDate } from "../scheduler";
import { addBusinessDays } from "../../lib/dates";
import type { Task } from "../../plan/types";

const H = new Set<string>(["2026-07-20"]); // lun 20 jul festivo

const mkTask = (id: string, date: string): Task => ({
  id, weekId: "w", dayOfWeek: 0, block: "morning", title: id,
  description: "", doneCriteria: "", resourceUrl: null,
  type: "study", xp: 10, date,
});

describe("addBusinessDays", () => {
  it("salta el fin de semana", () => {
    // vie 17 + 1 hábil = mar 21 (sáb, dom y lun festivo se saltan)
    expect(addBusinessDays("2026-07-17", 1, H)).toBe("2026-07-21");
  });
  it("negativo retrocede", () => {
    expect(addBusinessDays("2026-07-21", -1, H)).toBe("2026-07-17");
  });
});

describe("snapToBusinessDay", () => {
  it("sábado cae al lunes siguiente (o martes si el lunes es festivo)", () => {
    expect(snapToBusinessDay("2026-07-18", H)).toBe("2026-07-21");
  });
  it("día hábil queda igual", () => {
    expect(snapToBusinessDay("2026-07-15", H)).toBe("2026-07-15");
  });
});

describe("shiftPlan", () => {
  const tasks = [
    mkTask("a", "2026-07-15"),
    mkTask("b", "2026-07-16"),
    mkTask("c", "2026-07-17"),
  ];

  it("desplaza solo tareas pendientes desde la fecha dada", () => {
    const r = shiftPlan(tasks, new Map(), new Set(["a"]), "2026-07-16", 2, H);
    expect(r.has("a")).toBe(false); // hecha: no se mueve
    expect(r.get("b")).toBe("2026-07-21"); // jue 16 +2 hábiles: vie 17, mar 21 (finde y festivo saltados)
    expect(r.get("c")).toBe("2026-07-22"); // vie 17 +2 hábiles: mar 21, mié 22
  });

  it("no toca tareas anteriores a fromISO", () => {
    const r = shiftPlan(tasks, new Map(), new Set(), "2026-07-16", 1, H);
    expect(r.has("a")).toBe(false);
  });

  it("respeta overrides previos como punto de partida", () => {
    const overrides = new Map([["b", "2026-07-17"]]);
    const r = shiftPlan(tasks, overrides, new Set(), "2026-07-17", 1, H);
    expect(r.get("b")).toBe("2026-07-21");
  });
});

describe("moveTask / effectiveDate", () => {
  it("mover a un domingo ajusta al siguiente hábil", () => {
    const r = moveTask("x", "2026-07-19", H);
    expect(r.date).toBe("2026-07-21");
  });

  it("effectiveDate usa el override si existe", () => {
    const t = mkTask("a", "2026-07-15");
    expect(effectiveDate(t, new Map())).toBe("2026-07-15");
    expect(effectiveDate(t, new Map([["a", "2026-07-22"]]))).toBe("2026-07-22");
  });
});
