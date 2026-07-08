import { describe, it, expect } from "vitest";
import { computeStreak } from "../streak";

// jul 2026: lun 13, mar 14, mié 15, jue 16, vie 17, sáb 18, dom 19, lun 20...
const H = new Set<string>(["2026-07-20"]); // lun 20 jul festivo (Independencia)

describe("computeStreak", () => {
  it("racha vacía sin actividad", () => {
    const s = computeStreak(new Set(), H, "2026-07-15");
    expect(s.current).toBe(0);
    expect(s.longest).toBe(0);
    expect(s.freezesLeft).toBe(2);
  });

  it("días consecutivos extienden la racha", () => {
    const s = computeStreak(
      new Set(["2026-07-13", "2026-07-14", "2026-07-15"]),
      H,
      "2026-07-15",
    );
    expect(s.current).toBe(3);
    expect(s.doneToday).toBe(true);
  });

  it("el fin de semana NO rompe la racha", () => {
    // vie 17 activo, sáb/dom sin actividad, mar 21 activo (lun 20 festivo)
    const s = computeStreak(
      new Set(["2026-07-16", "2026-07-17", "2026-07-21"]),
      H,
      "2026-07-21",
    );
    expect(s.current).toBe(3);
    expect(s.freezesLeft).toBe(2); // no consumió escudos
  });

  it("el festivo NO rompe la racha", () => {
    // el lunes 20 es festivo: de vie 17 salta a mar 21 sin penalidad
    const s = computeStreak(
      new Set(["2026-07-17", "2026-07-21"]),
      H,
      "2026-07-21",
    );
    expect(s.current).toBe(2);
    expect(s.events.some((e) => e.kind === "frozen")).toBe(false);
  });

  it("actividad en fin de semana no extiende la racha", () => {
    const s = computeStreak(
      new Set(["2026-07-17", "2026-07-18"]), // vie + sáb
      H,
      "2026-07-18",
    );
    expect(s.current).toBe(1);
  });

  it("día hábil perdido consume escudo automáticamente", () => {
    // lun 13 y mié 15 activos; mar 14 perdido -> escudo
    const s = computeStreak(
      new Set(["2026-07-13", "2026-07-15"]),
      H,
      "2026-07-15",
    );
    expect(s.current).toBe(2);
    expect(s.freezesLeft).toBe(1);
    expect(s.events.filter((e) => e.kind === "frozen")).toHaveLength(1);
  });

  it("sin escudos, la racha decae 20% (no a cero)", () => {
    // 10 días hábiles activos (13-17, 21-24 jul + lun 27), luego 3 perdidos
    const active = [
      "2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17",
      "2026-07-21", "2026-07-22", "2026-07-23", "2026-07-24", "2026-07-27",
    ];
    // mar 28, mié 29 perdidos -> 2 escudos; jue 30 perdido -> decae
    const s = computeStreak(new Set(active), H, "2026-07-31");
    // racha era 10; jue 30 decae: floor(10*0.8)=8; vie 31 es "hoy" sin actividad: no penaliza
    expect(s.freezesLeft).toBe(0);
    expect(s.current).toBe(8);
    expect(s.longest).toBe(10);
  });

  it("los escudos se reponen al cambiar de mes", () => {
    // activo vie 31 jul; lun 3 y mar 4 ago perdidos (agosto repone escudos); mié 5 activo
    const s = computeStreak(
      new Set([
        "2026-07-29", "2026-07-30", "2026-07-31", "2026-08-05",
      ]),
      H,
      "2026-08-05",
    );
    // 3 y 4 ago consumen los 2 escudos de agosto, racha se mantiene
    expect(s.current).toBe(4);
    expect(s.freezesLeft).toBe(0);
  });

  it("hoy sin actividad no penaliza (el día no ha terminado)", () => {
    const s = computeStreak(
      new Set(["2026-07-13", "2026-07-14"]),
      H,
      "2026-07-15",
    );
    expect(s.current).toBe(2);
    expect(s.doneToday).toBe(false);
    expect(s.freezesLeft).toBe(2);
  });
});
