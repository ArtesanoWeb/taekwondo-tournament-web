"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/button-classes";
import { FormError } from "@/components/form-error";
import { type AthleteOption, filterAthleteOptions } from "@/lib/registrations";

import { registerAthlete, type RegisterState } from "./actions";

const MAX_RESULTS = 50;

type RegisterAthleteButtonProps = {
  categoryId: number;
  options: AthleteOption[];
};

export function RegisterAthleteButton({
  categoryId,
  options,
}: RegisterAthleteButtonProps) {
  // Mounted only while open, so closing discards the search and the messages.
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={secondaryButtonClass}
      >
        Inscribir atleta
      </button>
      {open && (
        <RegisterDialog
          categoryId={categoryId}
          options={options}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function RegisterDialog({
  categoryId,
  options,
  onClose,
}: RegisterAthleteButtonProps & { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  // Remembered here: once registered, an athlete leaves `options` and its name would be lost.
  const [names] = useState(
    () => new Map(options.map((option) => [option.id, option.name])),
  );
  const [state, formAction, isPending] = useActionState<
    RegisterState,
    FormData
  >(registerAthlete, {});

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const matches = filterAthleteOptions(options, query);
  const shown = matches.slice(0, MAX_RESULTS);
  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      onClose={() => {
        if (state.stale) router.refresh();
        onClose();
      }}
      aria-label="Inscribir atleta"
      className="m-auto h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md rounded-lg bg-white text-zinc-950 shadow-xl backdrop:bg-black/50 sm:h-[min(40rem,calc(100dvh-2rem))] dark:bg-zinc-900 dark:text-zinc-50"
    >
      <div className="flex h-full flex-col gap-3 p-5">
        <h2 className="text-lg font-semibold">Inscribir atleta</h2>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre o CI"
          aria-label="Buscar por nombre o CI"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
        />

        {state.registeredId !== undefined && (
          <p
            role="status"
            className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            Inscripción lista: {names.get(state.registeredId)}.
          </p>
        )}
        <FormError
          message={
            state.error &&
            (state.errorAthleteId !== undefined
              ? `${names.get(state.errorAthleteId)}: ${state.error}`
              : state.error)
          }
        />

        <form action={formAction} className="min-h-0 flex-1 overflow-y-auto">
          <input type="hidden" name="categoryId" value={categoryId} />
          {shown.length === 0 ? (
            <p className="p-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
              {options.length === 0
                ? "No hay más atletas para inscribir."
                : "No se encontraron atletas."}
            </p>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {shown.map((option) => (
                <li
                  key={option.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="font-medium break-words">
                      {option.name}
                    </span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {option.club} · {option.weightKg} kg
                    </span>
                  </div>
                  <button
                    type="submit"
                    name="athleteId"
                    value={option.id}
                    disabled={isPending}
                    className={`${primaryButtonClass} shrink-0`}
                  >
                    Inscribir
                  </button>
                </li>
              ))}
            </ul>
          )}
          {matches.length > MAX_RESULTS && (
            <p className="p-3 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Mostrando {MAX_RESULTS} de {matches.length}. Escribe para acotar.
            </p>
          )}
        </form>

        <button type="button" onClick={close} className={secondaryButtonClass}>
          Cerrar
        </button>
      </div>
    </dialog>
  );
}
