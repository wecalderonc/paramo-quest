import { useEffect, useState } from "react";
import {
  getSimulatedDate,
  subscribeSimulatedDate,
} from "../lib/simulatedDate";
import { todayISO } from "../lib/dates";

/** Re-renderiza cuando cambia la fecha simulada (modo prueba). */
export function useSimulatedDateKey(): string | null {
  const [key, setKey] = useState(getSimulatedDate);
  useEffect(() => subscribeSimulatedDate(() => setKey(getSimulatedDate())), []);
  return key;
}

export function useToday(): string {
  const simKey = useSimulatedDateKey();
  // simKey en deps fuerza recalcular cuando cambia la simulación
  void simKey;
  return todayISO();
}
