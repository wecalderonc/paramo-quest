import { describe, it, expect } from "vitest";
import { newCardSrs, schedule, nextDue, MIN_EASE } from "../srs";
import { buildReviewQueue } from "../reviewQueue";
import type { CardStateRow } from "../../db/db";
import type { Flashcard } from "../../data/flashcards";

describe("schedule (SRS)", () => {
  it("tarjeta nueva con 'good' pasa a intervalo de 1 día", () => {
    const r = schedule(newCardSrs(), "good");
    expect(r.interval).toBe(1);
    expect(r.reps).toBe(1);
  });

  it("tarjeta nueva con 'easy' salta a 3 días", () => {
    const r = schedule(newCardSrs(), "easy");
    expect(r.interval).toBe(3);
    expect(r.ease).toBeCloseTo(2.65);
  });

  it("'again' reinicia el intervalo a 0 y baja el ease", () => {
    const learned = { interval: 10, ease: 2.5, reps: 3, lapses: 0 };
    const r = schedule(learned, "again");
    expect(r.interval).toBe(0);
    expect(r.reps).toBe(0);
    expect(r.lapses).toBe(1);
    expect(r.ease).toBeCloseTo(2.3);
  });

  it("el ease nunca baja de MIN_EASE", () => {
    let s = { interval: 1, ease: 1.35, reps: 1, lapses: 0 };
    s = schedule(s, "again");
    expect(s.ease).toBe(MIN_EASE);
  });

  it("'good' repetido crece de forma multiplicativa", () => {
    let s = newCardSrs();
    s = schedule(s, "good"); // 1
    expect(s.interval).toBe(1);
    s = schedule(s, "good"); // round(1 * 2.5) = 3
    expect(s.interval).toBe(3);
    s = schedule(s, "good"); // round(3 * 2.5) = 8
    expect(s.interval).toBe(8);
  });

  it("nextDue suma el intervalo a hoy", () => {
    expect(nextDue(newCardSrs(), "good", "2026-07-13")).toBe("2026-07-14");
    expect(nextDue(newCardSrs(), "again", "2026-07-13")).toBe("2026-07-13");
  });
});

const card = (id: string, weekId: string): Flashcard => ({
  id,
  weekId,
  topic: "t",
  front: "q",
  back: "a",
});

const row = (
  cardId: string,
  due: string,
  introducedOn: string,
): CardStateRow => ({
  cardId,
  due,
  interval: 1,
  ease: 2.5,
  reps: 1,
  lapses: 0,
  introducedOn,
  lastReviewed: null,
});

describe("buildReviewQueue", () => {
  const cards = [card("a", "s01"), card("b", "s01"), card("c", "s02")];
  const unlockS01 = (w: string) => w === "s01";

  it("no incluye tarjetas de semanas bloqueadas", () => {
    const q = buildReviewQueue(cards, new Map(), unlockS01, "2026-07-13");
    expect(q.lockedCount).toBe(1); // la de s02
    expect(q.items.every((i) => i.card.weekId === "s01")).toBe(true);
  });

  it("introduce tarjetas nuevas hasta el cupo diario", () => {
    const q = buildReviewQueue(cards, new Map(), unlockS01, "2026-07-13", 1);
    expect(q.newCount).toBe(1);
    expect(q.newRemaining).toBe(1);
  });

  it("incluye vencidas y respeta el cupo ya usado hoy", () => {
    const states = new Map([
      ["a", row("a", "2026-07-13", "2026-07-13")], // vence hoy, introducida hoy
    ]);
    const q = buildReviewQueue(cards, states, unlockS01, "2026-07-13", 1);
    expect(q.dueCount).toBe(1);
    expect(q.newCount).toBe(0); // cupo (1) ya consumido por la introducida hoy
  });

  it("no incluye tarjetas cuyo due es futuro", () => {
    const states = new Map([["a", row("a", "2026-07-20", "2026-07-13")]]);
    const q = buildReviewQueue(cards, states, unlockS01, "2026-07-13", 5);
    expect(q.dueCount).toBe(0);
    expect(q.newCount).toBe(1); // solo "b" es nueva
  });
});
