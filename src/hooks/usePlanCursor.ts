import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { initPlanCursorIfMissing } from "../db/planCursorRepo";
import { useSimulatedDateKey } from "./useToday";

const META_KEY = "planCursor";

/** Lee el cursor activo; inicializa en segundo plano si falta (nunca escribe dentro del live query). */
export function usePlanCursor(): string | undefined {
  const simKey = useSimulatedDateKey();

  const cursor = useLiveQuery(async () => {
    const row = await db.meta.get(META_KEY);
    return typeof row?.value === "string" ? row.value : null;
  }, [simKey]);

  useEffect(() => {
    if (cursor !== null) return;
    void initPlanCursorIfMissing().catch((err) => {
      console.error("[Páramo Quest] Error al inicializar planCursor:", err);
    });
  }, [cursor, simKey]);

  return cursor ?? undefined;
}
