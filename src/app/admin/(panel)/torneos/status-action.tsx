"use client";

import { useActionState, useId, useRef } from "react";

import type { Tournament } from "@/lib/api/types";

import { changeTournamentStatus, type StatusActionState } from "./actions";

const actions = {
  draft: {
    action: "start",
    label: "Iniciar torneo",
    pendingLabel: "Iniciando…",
    consequence:
      "Se cierran las inscripciones y la creación de categorías, y ya se pueden generar las llaves.",
    confirm: "Sí, iniciar",
  },
  in_progress: {
    action: "finish",
    label: "Finalizar torneo",
    pendingLabel: "Finalizando…",
    consequence: "Los resultados de todas sus llaves quedan como definitivos.",
    confirm: "Sí, finalizar",
  },
} as const;

const buttonClass =
  "rounded-md px-3 py-2 text-sm font-medium disabled:opacity-60";
const primaryClass = `${buttonClass} bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300`;

export function StatusAction({ tournament }: { tournament: Tournament }) {
  const [state, formAction, isPending] = useActionState<
    StatusActionState,
    FormData
  >(changeTournamentStatus, {});
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  if (tournament.status === "finished") return null;
  const copy = actions[tournament.status];

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        disabled={isPending}
        className={primaryClass}
      >
        {isPending ? copy.pendingLabel : copy.label}
      </button>
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800 sm:max-w-xs dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </p>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg bg-white p-5 text-zinc-950 shadow-xl backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-50"
      >
        <form
          action={formAction}
          onSubmit={() => dialogRef.current?.close()}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="tournamentId" value={tournament.id} />
          <input type="hidden" name="action" value={copy.action} />
          <h2 id={titleId} className="text-lg font-semibold">
            ¿{copy.label} «{tournament.name}»?
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {copy.consequence}{" "}
            <strong className="text-zinc-950 dark:text-zinc-50">
              No se puede deshacer.
            </strong>
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className={`${buttonClass} border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800`}
            >
              Cancelar
            </button>
            <button type="submit" className={primaryClass}>
              {copy.confirm}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
