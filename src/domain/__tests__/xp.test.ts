import { describe, it, expect } from "vitest";
import { computeXp, levelForXp, levelProgress, LEVELS } from "../xp";
import type { Plan } from "../../plan/types";

const mini: Plan = {
  phases: [
    { id: "p1", name: "Fase 1", emoji: "x", description: "", deliverable: "", order: 0 },
  ],
  weeks: [
    { id: "w1", phaseId: "p1", number: 1, title: "S1", startDate: "2026-07-13" },
    { id: "w2", phaseId: "p1", number: 2, title: "S2", startDate: "2026-07-20" },
  ],
  tasks: [
    { id: "t1", weekId: "w1", dayOfWeek: 0, block: "morning", title: "a", description: "", doneCriteria: "", resourceUrl: null, type: "study", xp: 10, date: "2026-07-13" },
    { id: "t2", weekId: "w1", dayOfWeek: 1, block: "morning", title: "b", description: "", doneCriteria: "", resourceUrl: null, type: "post", xp: 30, date: "2026-07-14" },
    { id: "t3", weekId: "w2", dayOfWeek: 0, block: "morning", title: "c", description: "", doneCriteria: "", resourceUrl: null, type: "project", xp: 15, date: "2026-07-20" },
  ],
  holidays: [],
};

describe("computeXp", () => {
  it("suma XP de tareas + bitácora", () => {
    const r = computeXp(mini, new Set(["t1", "t2"]), 3);
    // 10 + 30 tareas + 15 bitácora + 50 bonus semana w1 completa
    expect(r.fromTasks).toBe(40);
    expect(r.fromJournal).toBe(15);
    expect(r.fromWeekBonuses).toBe(50);
    expect(r.completedWeeks).toEqual(["w1"]);
    expect(r.total).toBe(105);
  });

  it("bonus de fase al completar todas sus semanas", () => {
    const r = computeXp(mini, new Set(["t1", "t2", "t3"]), 0);
    expect(r.fromWeekBonuses).toBe(100);
    expect(r.fromPhaseBonuses).toBe(200);
    expect(r.total).toBe(55 + 100 + 200);
  });

  it("sin tareas hechas, cero bonus", () => {
    const r = computeXp(mini, new Set(), 0);
    expect(r.total).toBe(0);
  });
});

describe("niveles", () => {
  it("nivel correcto por XP", () => {
    expect(levelForXp(0).n).toBe(1);
    expect(levelForXp(299).n).toBe(1);
    expect(levelForXp(300).n).toBe(2);
    expect(levelForXp(9000).n).toBe(8);
    expect(levelForXp(99999).n).toBe(8);
  });

  it("progreso hacia el siguiente nivel", () => {
    const p = levelProgress(150);
    expect(p.current.n).toBe(1);
    expect(p.next?.n).toBe(2);
    expect(p.pct).toBe(50);
  });

  it("nivel máximo: 100%", () => {
    const p = levelProgress(10000);
    expect(p.next).toBeNull();
    expect(p.pct).toBe(100);
  });

  it("los niveles están ordenados", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minXp).toBeGreaterThan(LEVELS[i - 1].minXp);
    }
  });
});
