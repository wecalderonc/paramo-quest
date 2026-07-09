import type { CardStateRow } from "../db/db";
import type { Flashcard } from "../data/flashcards";
import { newCardSrs, type CardSrs } from "./srs";

/** Cuántas tarjetas nuevas se introducen como máximo por día. */
export const NEW_PER_DAY = 12;

export interface QueueItem {
  card: Flashcard;
  srs: CardSrs;
  isNew: boolean;
}

export interface ReviewQueue {
  items: QueueItem[];
  dueCount: number;
  newCount: number;
  /** Tarjetas nuevas desbloqueadas que hoy no caben por el cupo diario. */
  newRemaining: number;
  /** Tarjetas del mazo aún no desbloqueadas (semana futura). */
  lockedCount: number;
}

const toSrs = (row: CardStateRow): CardSrs => ({
  interval: row.interval,
  ease: row.ease,
  reps: row.reps,
  lapses: row.lapses,
});

/**
 * Construye la cola de repaso del día.
 *
 * - `states`: estado SRS por tarjeta ya vista.
 * - `isWeekUnlocked`: true si la semana de la tarjeta ya empezó en el plan.
 * - Reintroduce primero las vencidas (due <= today) y luego tarjetas nuevas
 *   hasta el cupo diario restante.
 */
export function buildReviewQueue(
  cards: Flashcard[],
  states: Map<string, CardStateRow>,
  isWeekUnlocked: (weekId: string) => boolean,
  today: string,
  newPerDay = NEW_PER_DAY,
): ReviewQueue {
  const due: QueueItem[] = [];
  const fresh: Flashcard[] = [];
  let lockedCount = 0;

  for (const card of cards) {
    if (!isWeekUnlocked(card.weekId)) {
      lockedCount++;
      continue;
    }
    const state = states.get(card.id);
    if (state) {
      if (state.due <= today) {
        due.push({ card, srs: toSrs(state), isNew: false });
      }
    } else {
      fresh.push(card);
    }
  }

  due.sort((a, b) => {
    const sa = states.get(a.card.id)?.due ?? today;
    const sb = states.get(b.card.id)?.due ?? today;
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });

  const introducedToday = [...states.values()].filter(
    (s) => s.introducedOn === today,
  ).length;
  const allowance = Math.max(0, newPerDay - introducedToday);

  const newItems: QueueItem[] = fresh
    .slice(0, allowance)
    .map((card) => ({ card, srs: newCardSrs(), isNew: true }));

  return {
    items: [...due, ...newItems],
    dueCount: due.length,
    newCount: newItems.length,
    newRemaining: Math.max(0, fresh.length - newItems.length),
    lockedCount,
  };
}
