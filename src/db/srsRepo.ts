import { db, type CardStateRow } from "./db";
import { schedule, type CardSrs, type Grade } from "../domain/srs";
import { addDaysISO, todayISO } from "../lib/dates";

const now = () => new Date().toISOString();

/**
 * Registra la calificación de una tarjeta y actualiza su estado SRS.
 * Crea el estado si la tarjeta es nueva (marca `introducedOn`).
 */
export async function reviewCard(
  cardId: string,
  grade: Grade,
  today: string = todayISO(),
): Promise<void> {
  const prevRow = await db.cardStates.get(cardId);
  const prevSrs: CardSrs = prevRow
    ? {
        interval: prevRow.interval,
        ease: prevRow.ease,
        reps: prevRow.reps,
        lapses: prevRow.lapses,
      }
    : { interval: 0, ease: 2.5, reps: 0, lapses: 0 };

  const next = schedule(prevSrs, grade);

  const row: CardStateRow = {
    cardId,
    due: addDaysISO(today, next.interval),
    interval: next.interval,
    ease: next.ease,
    reps: next.reps,
    lapses: next.lapses,
    introducedOn: prevRow?.introducedOn ?? today,
    lastReviewed: now(),
  };

  await db.cardStates.put(row);
  await db.activity.add({
    at: now(),
    type: "review",
    payload: { cardId, grade, date: today },
  });
}

export async function resetCardStates(): Promise<void> {
  await db.cardStates.clear();
}
