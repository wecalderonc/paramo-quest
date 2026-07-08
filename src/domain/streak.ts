import { addDaysISO, isBusinessDay } from "../lib/dates";

export const FREEZES_PER_MONTH = 2;
export const DECAY_FACTOR = 0.8;

export interface StreakEvent {
  date: string;
  kind: "extended" | "frozen" | "decayed";
  streakAfter: number;
}

export interface StreakState {
  current: number;
  longest: number;
  freezesLeft: number;
  events: StreakEvent[];
  /** true si hoy ya se extendió la racha */
  doneToday: boolean;
}

/**
 * Recalcula la racha desde cero a partir de los días con actividad.
 * Reglas:
 *  - Solo cuentan días hábiles (findes y festivos ni rompen ni extienden).
 *  - >=1 actividad en un día hábil => racha +1.
 *  - Día hábil sin actividad: consume escudo (2/mes, se reponen el día 1);
 *    sin escudos, la racha decae 20% (floor).
 *  - El día de hoy sin actividad no penaliza (el día no ha terminado).
 */
export function computeStreak(
  activeDays: Set<string>,
  holidays: Set<string>,
  todayISO: string,
): StreakState {
  const businessActive = [...activeDays]
    .filter((d) => isBusinessDay(d, holidays))
    .sort();

  if (businessActive.length === 0) {
    return {
      current: 0,
      longest: 0,
      freezesLeft: FREEZES_PER_MONTH,
      events: [],
      doneToday: false,
    };
  }

  let current = 0;
  let longest = 0;
  let freezes = FREEZES_PER_MONTH;
  let month = businessActive[0].slice(0, 7);
  const events: StreakEvent[] = [];

  let cur = businessActive[0];
  while (cur <= todayISO) {
    const curMonth = cur.slice(0, 7);
    if (curMonth !== month) {
      month = curMonth;
      freezes = FREEZES_PER_MONTH;
    }

    if (isBusinessDay(cur, holidays)) {
      if (activeDays.has(cur)) {
        current += 1;
        longest = Math.max(longest, current);
        events.push({ date: cur, kind: "extended", streakAfter: current });
      } else if (cur === todayISO) {
        // hoy aún no termina: no penalizar
      } else if (freezes > 0 && current > 0) {
        freezes -= 1;
        events.push({ date: cur, kind: "frozen", streakAfter: current });
      } else if (current > 0) {
        current = Math.floor(current * DECAY_FACTOR);
        events.push({ date: cur, kind: "decayed", streakAfter: current });
      }
    }
    cur = addDaysISO(cur, 1);
  }

  return {
    current,
    longest,
    freezesLeft: freezes,
    events,
    doneToday: activeDays.has(todayISO),
  };
}
