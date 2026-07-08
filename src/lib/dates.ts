import { addDays, format, parseISO } from "date-fns";
import { getSimulatedDate } from "./simulatedDate";

export const toISO = (d: Date): string => format(d, "yyyy-MM-dd");

/** Fecha “hoy” de la app: simulada en modo prueba, si no la del dispositivo. */
export const todayISO = (): string => getSimulatedDate() ?? toISO(new Date());

export function isRealToday(iso: string): boolean {
  return iso === toISO(new Date());
}

export function isWeekend(iso: string): boolean {
  const day = parseISO(iso).getDay();
  return day === 0 || day === 6;
}

export function isBusinessDay(iso: string, holidays: Set<string>): boolean {
  return !isWeekend(iso) && !holidays.has(iso);
}

export function addDaysISO(iso: string, n: number): string {
  return toISO(addDays(parseISO(iso), n));
}

/** Suma n días hábiles (salta findes y festivos). n puede ser negativo. */
export function addBusinessDays(
  iso: string,
  n: number,
  holidays: Set<string>,
): string {
  if (n === 0) return iso;
  const step = n > 0 ? 1 : -1;
  let remaining = Math.abs(n);
  let cur = iso;
  while (remaining > 0) {
    cur = addDaysISO(cur, step);
    if (isBusinessDay(cur, holidays)) remaining--;
  }
  return cur;
}

/** Días hábiles entre dos fechas ISO, ambas inclusive. */
export function businessDaysBetween(
  startISO: string,
  endISO: string,
  holidays: Set<string>,
): string[] {
  const out: string[] = [];
  let cur = startISO;
  while (cur <= endISO) {
    if (isBusinessDay(cur, holidays)) out.push(cur);
    cur = addDaysISO(cur, 1);
  }
  return out;
}

export function formatHuman(iso: string): string {
  const d = parseISO(iso);
  const days = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}
