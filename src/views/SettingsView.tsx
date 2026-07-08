import { useRef, useState } from "react";
import {
  Download,
  Upload,
  Trash2,
  Smartphone,
  Shield,
  FlaskConical,
} from "lucide-react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { exportAll, importAll, resetAll, type ExportData } from "../db/repo";
import { FREEZES_PER_MONTH } from "../domain/streak";
import {
  getSimulatedDate,
  setSimulatedDate,
  PLAN_DAY_ONE,
} from "../lib/simulatedDate";
import { toISO } from "../lib/dates";
import { reinitPlanCursor } from "../db/planCursorRepo";
import { useSimulatedDateKey } from "../hooks/useToday";
import type { AppState } from "../hooks/useAppState";

export function SettingsView({ state }: { state: AppState }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const simKey = useSimulatedDateKey();
  const simulated = simKey ?? getSimulatedDate();
  const [simDate, setSimDate] = useState(simulated ?? "");
  const isSimulating = simulated !== null;
  const { canInstall, isStandalone, install } = useInstallPrompt();

  const applySimDate = async (iso: string) => {
    setSimulatedDate(iso);
    setSimDate(iso);
    await reinitPlanCursor();
    setMsg(`Modo prueba: la app cree que hoy es ${iso}.`);
  };

  const clearSimDate = async () => {
    setSimulatedDate(null);
    setSimDate("");
    await reinitPlanCursor();
    setMsg("Modo prueba desactivado. Fecha real del dispositivo.");
  };

  const doExport = async () => {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paramo-quest-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Respaldo descargado.");
  };

  const doImport = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as ExportData;
      await importAll(data);
      setMsg("Respaldo importado correctamente.");
    } catch (e) {
      setMsg(`Error al importar: ${e instanceof Error ? e.message : e}`);
    }
  };

  const doReset = async () => {
    if (
      confirm(
        "¿Borrar TODO el progreso (checks, bitácora, historial)? Esta acción no se puede deshacer.",
      )
    ) {
      await resetAll();
      setMsg("Progreso reiniciado.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      <section className="rounded-2xl border border-frailejon-600/40 bg-frailejon-600/10 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-frailejon-300">
          <FlaskConical className="h-4 w-4" /> Modo prueba (fecha simulada)
        </h3>
        <p className="mt-1 text-sm text-niebla-300">
          El plan arranca el <b>lun 13 jul 2026</b> (S01). Hoy real (
          {toISO(new Date())}) aún no tiene tareas. Simula otra fecha para probar
          la vista Hoy. Al completar un día del plan puedes{" "}
          <b>continuar con el día siguiente</b> el mismo día real para acortar el
          plan.
        </p>
        {isSimulating && (
          <p className="mt-2 rounded-lg bg-surface-1 px-3 py-2 text-sm font-medium text-frailejon-300">
            Activo: la app usa <b>{simulated}</b> como “hoy”.
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => applySimDate(PLAN_DAY_ONE)}
            className="rounded-xl bg-musgo-600 px-4 py-2 text-sm font-semibold hover:bg-musgo-500"
          >
            Día 1 del plan (13 jul)
          </button>
          <button
            onClick={() => applySimDate("2026-07-07")}
            className="rounded-xl bg-surface-3 px-4 py-2 text-sm font-semibold hover:bg-niebla-900"
          >
            Hoy 7 jul (sin tareas)
          </button>
          {isSimulating && (
            <button
              onClick={clearSimDate}
              className="rounded-xl border border-niebla-700 px-4 py-2 text-sm font-semibold text-niebla-300"
            >
              Volver a fecha real
            </button>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="date"
            value={simDate}
            onChange={(e) => setSimDate(e.target.value)}
            className="flex-1 rounded-xl border border-surface-3 bg-surface-2 px-3 py-2 text-sm"
          />
          <button
            disabled={!simDate}
            onClick={() => applySimDate(simDate)}
            className="rounded-xl bg-surface-3 px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Aplicar
          </button>
        </div>
        <p className="mt-2 text-[11px] text-niebla-700">
          Atajo URL:{" "}
          <code className="text-niebla-300">?fecha=2026-07-13</code>
        </p>
      </section>

      <section className="rounded-2xl border border-surface-3 bg-surface-2 p-4">
        <h3 className="flex items-center gap-2 font-semibold">
          <Shield className="h-4 w-4 text-niebla-300" /> Racha
        </h3>
        <p className="mt-1 text-sm text-niebla-300">
          Tienes <b>{state.streak.freezesLeft}</b> de {FREEZES_PER_MONTH} escudos
          este mes. Se consumen solos si pierdes un día hábil; se reponen el día
          1 de cada mes. Findes y festivos nunca rompen la racha.
        </p>
      </section>

      <section className="rounded-2xl border border-surface-3 bg-surface-2 p-4">
        <h3 className="font-semibold">Respaldo</h3>
        <p className="mt-1 text-sm text-niebla-300">
          Tus datos viven solo en este dispositivo. Exporta un respaldo de vez
          en cuando (o antes de cambiar de celular).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={doExport}
            className="flex items-center gap-2 rounded-xl bg-musgo-600 px-4 py-2 text-sm font-semibold hover:bg-musgo-500"
          >
            <Download className="h-4 w-4" /> Exportar JSON
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-surface-3 px-4 py-2 text-sm font-semibold hover:bg-niebla-900"
          >
            <Upload className="h-4 w-4" /> Importar JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-surface-3 bg-surface-2 p-4">
        <h3 className="flex items-center gap-2 font-semibold">
          <Smartphone className="h-4 w-4 text-niebla-300" /> Instalar en Android
        </h3>
        {isStandalone ? (
          <p className="mt-2 text-sm text-musgo-200">
            Ya estás usando la app instalada (pantalla completa, sin barra de
            URL).
          </p>
        ) : (
          <>
            {canInstall ? (
              <button
                onClick={async () => {
                  const ok = await install();
                  setMsg(
                    ok
                      ? "App instalada. Ábrela desde el ícono en el launcher."
                      : "Instalación cancelada.",
                  );
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-musgo-600 px-4 py-3 text-sm font-semibold hover:bg-musgo-500"
              >
                <Smartphone className="h-4 w-4" /> Instalar Páramo Quest
              </button>
            ) : (
              <p className="mt-2 text-sm text-niebla-300">
                Chrome no muestra el botón automático todavía. Usa el menú del
                navegador (pasos abajo). También ayuda navegar un poco (Hoy →
                Semana) y volver a Ajustes.
              </p>
            )}
            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-niebla-300">
              <li>
                Abre la URL en <b>Google Chrome</b> (no Firefox, no el
                navegador de Facebook/WhatsApp).
              </li>
              <li>
                Toca <b>⋮</b> (tres puntos, arriba a la derecha). Busca una de
                estas opciones:
                <ul className="mt-1 list-inside list-disc pl-2 text-niebla-400">
                  <li>“Instalar aplicación”</li>
                  <li>“Instalar app”</li>
                  <li>“Añadir a la pantalla de inicio”</li>
                  <li>“Añadir a pantalla principal”</li>
                </ul>
              </li>
              <li>
                Si no aparece en ⋮, prueba <b>⋮ → Compartir</b> y busca{" "}
                <b>“Añadir a la pantalla de inicio”</b>.
              </li>
              <li>
                Otra opción: en la barra de direcciones, a la derecha, a veces
                hay un ícono <b>↓</b> o <b>+</b> para instalar.
              </li>
              <li>
                Confirma el nombre <b>Páramo Quest</b> → Instalar / Añadir.
              </li>
            </ol>
            <p className="mt-2 text-[11px] text-niebla-700">
              URL:{" "}
              <code className="text-niebla-300">
                https://wecalderonc.github.io/paramo-quest/
              </code>
            </p>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-red-900/50 bg-surface-2 p-4">
        <h3 className="font-semibold text-red-300">Zona de peligro</h3>
        <button
          onClick={doReset}
          className="mt-2 flex items-center gap-2 rounded-xl border border-red-800 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-950"
        >
          <Trash2 className="h-4 w-4" /> Reiniciar todo el progreso
        </button>
      </section>

      {msg && (
        <p className="rounded-xl bg-surface-3 px-4 py-2 text-sm text-musgo-200">
          {msg}
        </p>
      )}

      <p className="text-center text-[11px] text-niebla-700">
        Páramo Quest v1 · local-first · tus datos nunca salen de tu dispositivo
      </p>
    </div>
  );
}
