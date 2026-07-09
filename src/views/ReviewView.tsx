import { useState } from "react";
import { Brain, Sparkles, Lock, RotateCcw, Trees } from "lucide-react";
import type { AppState } from "../hooks/useAppState";
import { useToday } from "../hooks/useToday";
import { usePlanCursor } from "../hooks/usePlanCursor";
import { useReviewQueue } from "../hooks/useReviewQueue";
import { reviewCard } from "../db/srsRepo";
import { schedule, intervalLabel, type Grade } from "../domain/srs";
import { XP_REVIEW } from "../domain/xp";
import type { QueueItem } from "../domain/reviewQueue";
import { cn } from "../lib/utils";

interface Session {
  cards: QueueItem[];
  pos: number;
  reviewed: number;
}

const GRADES: { grade: Grade; label: string; className: string }[] = [
  {
    grade: "again",
    label: "Otra vez",
    className: "bg-rose-700 hover:bg-rose-600 text-rose-50",
  },
  {
    grade: "good",
    label: "Bien",
    className: "bg-musgo-600 hover:bg-musgo-500 text-white",
  },
  {
    grade: "easy",
    label: "Fácil",
    className: "bg-frailejon-600 hover:bg-frailejon-500 text-white",
  },
];

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 rounded-xl bg-surface-1 p-2 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-niebla-300">{label}</p>
    </div>
  );
}

export function ReviewView({ state }: { state: AppState }) {
  const today = useToday();
  const planCursor = usePlanCursor();
  const planDay = planCursor ?? today;
  const queue = useReviewQueue(planDay, today);

  const [session, setSession] = useState<Session | null>(null);
  const [revealed, setRevealed] = useState(false);

  const totalToday = queue ? queue.items.length : 0;

  const start = () => {
    if (!queue || queue.items.length === 0) return;
    setSession({ cards: [...queue.items], pos: 0, reviewed: 0 });
    setRevealed(false);
  };

  if (!queue) {
    return (
      <div className="py-12 text-center text-niebla-300">Cargando repaso…</div>
    );
  }

  // ── Sesión de estudio activa ──────────────────────────────────────────────
  if (session) {
    const current = session.cards[session.pos];

    if (!current) {
      const gainedXp = session.reviewed * XP_REVIEW;
      return (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-musgo-600 bg-musgo-900/30 px-6 py-14 text-center">
          <Sparkles className="h-14 w-14 text-frailejon-400" />
          <div>
            <h2 className="text-xl font-bold">Repaso completado</h2>
            <p className="mt-1 text-niebla-300">
              Repasaste {session.reviewed}{" "}
              {session.reviewed === 1 ? "tarjeta" : "tarjetas"}. +{gainedXp} XP
            </p>
            <p className="mt-3 text-sm text-musgo-300">
              La memoria se construye repasando justo antes de olvidar. 🧠
            </p>
          </div>
          <button
            onClick={() => setSession(null)}
            className="rounded-xl bg-surface-2 px-5 py-2.5 text-sm font-semibold hover:bg-surface-3"
          >
            Volver
          </button>
        </div>
      );
    }

    const grade = async (g: Grade) => {
      await reviewCard(current.card.id, g, today);
      setSession((s) => {
        if (!s) return s;
        const cards = s.cards;
        // "Otra vez": la tarjeta vuelve al final de la sesión.
        const requeue =
          g === "again"
            ? [
                ...cards,
                { ...current, srs: schedule(current.srs, "again"), isNew: false },
              ]
            : cards;
        return { cards: requeue, pos: s.pos + 1, reviewed: s.reviewed + 1 };
      });
      setRevealed(false);
    };

    const remaining = session.cards.length - session.pos;

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-niebla-300">
          <Brain className="h-4 w-4 text-frailejon-400" />
          <span className="font-semibold text-niebla-100">Repaso</span>
          <span className="ml-auto">{remaining} restantes</span>
        </div>

        <div className="flex min-h-[16rem] flex-col rounded-3xl border border-surface-3 bg-surface-2 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-niebla-300">
              {current.card.topic}
            </span>
            {current.isNew && (
              <span className="rounded-full bg-frailejon-600/25 px-2 py-0.5 text-[11px] font-medium text-frailejon-300">
                nueva
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-center gap-4">
            <p className="text-lg font-semibold leading-snug">
              {current.card.front}
            </p>
            {revealed && (
              <div className="border-t border-surface-3 pt-4">
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-niebla-100/90">
                  {current.card.back}
                </p>
              </div>
            )}
          </div>
        </div>

        {revealed ? (
          <div className="grid grid-cols-3 gap-2">
            {GRADES.map(({ grade: g, label, className }) => (
              <button
                key={g}
                onClick={() => grade(g)}
                className={cn(
                  "flex flex-col items-center rounded-xl px-2 py-3 text-sm font-bold transition-colors",
                  className,
                )}
              >
                {label}
                <span className="mt-0.5 text-[10px] font-medium opacity-80">
                  {intervalLabel(current.srs, g)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="rounded-xl bg-musgo-600 py-3.5 text-sm font-bold hover:bg-musgo-500"
          >
            Mostrar respuesta
          </button>
        )}

        <button
          onClick={() => setSession(null)}
          className="text-center text-xs text-niebla-300 underline"
        >
          Terminar sesión
        </button>
      </div>
    );
  }

  // ── Pantalla de inicio ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Repaso</h1>
        <p className="mt-0.5 text-sm text-niebla-300">
          Tarjetas de memoria con repetición espaciada. Sin instalar nada: la
          evaluación pasa aquí.
        </p>
      </div>

      <section className="rounded-2xl border border-surface-3 bg-surface-2 p-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-frailejon-400" />
          <h3 className="font-semibold">Para hoy</h3>
          <span className="ml-auto text-[11px] text-niebla-300">
            +{XP_REVIEW} XP por tarjeta
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          <StatPill value={queue.dueCount} label="por repasar" />
          <StatPill value={queue.newCount} label="nuevas" />
          <StatPill value={state.xp.fromReviews} label="XP de repaso" />
        </div>

        <button
          onClick={start}
          disabled={totalToday === 0}
          className="mt-4 w-full rounded-xl bg-musgo-600 py-3.5 text-sm font-bold hover:bg-musgo-500 disabled:opacity-40"
        >
          {totalToday > 0
            ? `Empezar repaso (${totalToday})`
            : "Nada que repasar por ahora"}
        </button>
      </section>

      {totalToday === 0 && (
        <EmptyHint
          lockedCount={queue.lockedCount}
          newRemaining={queue.newRemaining}
        />
      )}

      {(queue.newRemaining > 0 || queue.lockedCount > 0) && totalToday > 0 && (
        <p className="text-center text-xs text-niebla-700">
          {queue.newRemaining > 0 &&
            `${queue.newRemaining} tarjetas nuevas esperan para próximos días. `}
          {queue.lockedCount > 0 &&
            `${queue.lockedCount} se desbloquean al avanzar en el plan.`}
        </p>
      )}
    </div>
  );
}

function EmptyHint({
  lockedCount,
  newRemaining,
}: {
  lockedCount: number;
  newRemaining: number;
}) {
  const allLocked = lockedCount > 0 && newRemaining === 0;
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-surface-3 bg-surface-1 px-6 py-10 text-center">
      {allLocked ? (
        <Lock className="h-10 w-10 text-niebla-500" />
      ) : newRemaining > 0 ? (
        <RotateCcw className="h-10 w-10 text-musgo-400" />
      ) : (
        <Trees className="h-10 w-10 text-musgo-400" />
      )}
      <p className="max-w-xs text-sm text-niebla-300">
        {allLocked
          ? "Aún no hay tarjetas desbloqueadas. Avanza en las tareas del plan y aparecerán aquí."
          : newRemaining > 0
            ? "Terminaste tus tarjetas nuevas de hoy y no hay repasos pendientes. Vuelve mañana para las siguientes."
            : "¡Estás al día! No hay tarjetas para repasar hoy. La memoria descansa."}
      </p>
    </div>
  );
}
