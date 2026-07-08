const KEY = "pq_simulated_date";

type Listener = () => void;
const listeners = new Set<Listener>();

/** Fecha simulada (yyyy-MM-dd) o null = fecha real del dispositivo. */
export function getSimulatedDate(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setSimulatedDate(iso: string | null): void {
  try {
    if (iso) localStorage.setItem(KEY, iso);
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}

export function subscribeSimulatedDate(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Lee ?fecha=2026-07-13 de la URL (útil para pruebas rápidas). */
export function initSimulatedDateFromUrl(): void {
  const fecha = new URLSearchParams(window.location.search).get("fecha");
  if (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    setSimulatedDate(fecha);
  }
}

export const PLAN_DAY_ONE = "2026-07-13"; // lun S01 — primer día del plan
