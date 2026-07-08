import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { Task } from "../plan/types";
import { moveTaskTo } from "../db/repo";
import { addDaysISO, todayISO, formatHuman } from "../lib/dates";
import { snapToBusinessDay } from "../domain/scheduler";
import { holidaySet } from "../plan/plan";

export function MoveTaskDialog({
  task,
  onClose,
}: {
  task: Task | null;
  onClose: () => void;
}) {
  const [customDate, setCustomDate] = useState("");

  if (!task) return null;

  const move = async (toDate: string) => {
    await moveTaskTo(task.id, toDate);
    onClose();
  };

  const tomorrow = snapToBusinessDay(addDaysISO(todayISO(), 1), holidaySet);
  const nextWeek = snapToBusinessDay(addDaysISO(todayISO(), 7), holidaySet);

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-black/60" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-40 mx-auto max-w-sm -translate-y-1/2 rounded-2xl border border-surface-3 bg-surface-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="font-bold leading-tight">
              Mover “{task.title}”
            </Dialog.Title>
            <Dialog.Close
              aria-label="Cerrar"
              className="rounded-lg p-1 text-niebla-300 hover:bg-surface-3"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-1 text-sm text-niebla-300">
            Elige la nueva fecha (se ajusta a día hábil).
          </Dialog.Description>

          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => move(tomorrow)}
              className="rounded-xl bg-surface-3 px-4 py-2.5 text-left text-sm font-medium hover:bg-musgo-800"
            >
              Siguiente día hábil ({formatHuman(tomorrow)})
            </button>
            <button
              onClick={() => move(nextWeek)}
              className="rounded-xl bg-surface-3 px-4 py-2.5 text-left text-sm font-medium hover:bg-musgo-800"
            >
              En una semana ({formatHuman(nextWeek)})
            </button>
            <div className="mt-1 flex gap-2">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="flex-1 rounded-xl border border-surface-3 bg-surface-2 px-3 py-2 text-sm"
              />
              <button
                disabled={!customDate}
                onClick={() => move(customDate)}
                className="rounded-xl bg-musgo-600 px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Mover
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
