import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { flashcards } from "../data/flashcards";
import { weekById } from "../plan/plan";
import { buildReviewQueue, type ReviewQueue } from "../domain/reviewQueue";
import { useSimulatedDateKey } from "./useToday";

/**
 * Cola de repaso reactiva. Una tarjeta se desbloquea cuando la semana del plan
 * a la que pertenece ya empezó respecto a `planDay` (día actual del plan).
 */
export function useReviewQueue(
  planDay: string,
  today: string,
): ReviewQueue | undefined {
  const simKey = useSimulatedDateKey();

  return useLiveQuery(async () => {
    const rows = await db.cardStates.toArray();
    const states = new Map(rows.map((r) => [r.cardId, r]));
    const isWeekUnlocked = (weekId: string) => {
      const w = weekById.get(weekId);
      return w ? w.startDate <= planDay : false;
    };
    return buildReviewQueue(flashcards, states, isWeekUnlocked, today);
  }, [planDay, today, simKey]);
}
