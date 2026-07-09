/**
 * Repetición espaciada (spaced repetition) al estilo Anki, en versión ligera.
 *
 * Granularidad de días: cada tarjeta tiene una fecha `due` (yyyy-MM-dd). Una
 * tarjeta con `interval === 0` sigue "en aprendizaje" y vuelve a salir el mismo
 * día hasta que se responde bien.
 */
import { addDaysISO } from "../lib/dates";

export type Grade = "again" | "good" | "easy";

export interface CardSrs {
  /** Días hasta el próximo repaso (0 = hoy mismo, aún aprendiendo). */
  interval: number;
  /** Factor de facilidad (ease). Empieza en 2.5; nunca baja de 1.3. */
  ease: number;
  /** Repasos correctos consecutivos. Se reinicia con "again". */
  reps: number;
  /** Veces que se olvidó (respuestas "again" tras haberla aprendido). */
  lapses: number;
}

export const START_EASE = 2.5;
export const MIN_EASE = 1.3;

export function newCardSrs(): CardSrs {
  return { interval: 0, ease: START_EASE, reps: 0, lapses: 0 };
}

const round = (n: number) => Math.max(1, Math.round(n));

/** Calcula el nuevo estado SRS de una tarjeta tras calificarla. */
export function schedule(prev: CardSrs, grade: Grade): CardSrs {
  if (grade === "again") {
    return {
      interval: 0,
      ease: Math.max(MIN_EASE, prev.ease - 0.2),
      reps: 0,
      lapses: prev.reps > 0 || prev.interval > 0 ? prev.lapses + 1 : prev.lapses,
    };
  }

  if (grade === "good") {
    const interval = prev.reps === 0 ? 1 : round(prev.interval * prev.ease);
    return { ...prev, interval, reps: prev.reps + 1 };
  }

  // easy
  const ease = prev.ease + 0.15;
  const interval = prev.reps === 0 ? 3 : round(prev.interval * ease * 1.3);
  return { interval, ease, reps: prev.reps + 1, lapses: prev.lapses };
}

/** Fecha `due` resultante de aplicar una calificación hoy. */
export function nextDue(prev: CardSrs, grade: Grade, today: string): string {
  const { interval } = schedule(prev, grade);
  return addDaysISO(today, interval);
}

/** Texto amable del próximo intervalo, para mostrar en el botón. */
export function intervalLabel(prev: CardSrs, grade: Grade): string {
  const { interval } = schedule(prev, grade);
  if (interval === 0) return "hoy";
  if (interval === 1) return "1 día";
  return `${interval} días`;
}
