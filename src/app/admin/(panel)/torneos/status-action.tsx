"use client";

import { useActionState, useRef } from "react";

import { primaryButtonClass } from "@/components/button-classes";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormError } from "@/components/form-error";
import type { Tournament } from "@/lib/api/types";

import { changeTournamentStatus, type StatusActionState } from "./actions";

const actions = {
  draft: {
    action: "start",
    label: "Cerrar inscripciones e iniciar torneo",
    pendingLabel: "Iniciando…",
    consequence:
      "Ya no se podrá inscribir a nadie más ni crear categorías, y se podrán generar las llaves.",
    confirm: "Sí, cerrar e iniciar",
  },
  in_progress: {
    action: "finish",
    label: "Finalizar torneo",
    pendingLabel: "Finalizando…",
    consequence: "Los resultados de todas sus llaves quedan como definitivos.",
    confirm: "Sí, finalizar",
  },
} as const;

export function StatusAction({ tournament }: { tournament: Tournament }) {
  const [state, formAction, isPending] = useActionState<
    StatusActionState,
    FormData
  >(changeTournamentStatus, {});
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (tournament.status === "finished") return null;
  const copy = actions[tournament.status];

  return (
    <form
      action={formAction}
      className="flex flex-col items-stretch gap-2 sm:items-end"
    >
      <input type="hidden" name="tournamentId" value={tournament.id} />
      <input type="hidden" name="action" value={copy.action} />
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        disabled={isPending}
        className={primaryButtonClass}
      >
        {isPending ? copy.pendingLabel : copy.label}
      </button>
      {state.error && (
        <div className="sm:max-w-xs">
          <FormError message={state.error} />
        </div>
      )}
      <ConfirmDialog
        dialogRef={dialogRef}
        title={`¿${copy.label} «${tournament.name}»?`}
        confirmLabel={copy.confirm}
      >
        {copy.consequence}{" "}
        <strong className="text-zinc-950 dark:text-zinc-50">
          No se puede deshacer.
        </strong>
      </ConfirmDialog>
    </form>
  );
}
