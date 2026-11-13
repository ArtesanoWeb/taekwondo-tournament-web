"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormError } from "@/components/form-error";

import { type CreateTournamentState, createTournament } from "../actions";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10";

// Android Chrome draws date inputs natively (own width and border): `appearance-none` lets them
// look and stretch like the other fields; the min height keeps an empty one from collapsing.
const dateInputClass = `${inputClass} min-h-[2.625rem] w-full appearance-none text-left [&::-webkit-date-and-time-value]:text-left`;

export function TournamentForm() {
  const [state, formAction, isPending] = useActionState<
    CreateTournamentState,
    FormData
  >(createTournament, {});

  return (
    // `key` remounts the inputs with the values that came back, so an error never clears the form.
    <form
      key={JSON.stringify(state.values ?? {})}
      action={formAction}
      className="flex flex-col gap-4"
    >
      <FormError message={state.error} />

      <label className="flex flex-col gap-1 text-sm font-medium">
        Nombre
        <input
          name="name"
          required
          autoComplete="off"
          placeholder="Copa Cochabamba"
          defaultValue={state.values?.name}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Fecha
        <input
          name="date"
          type="date"
          required
          defaultValue={state.values?.date}
          className={dateInputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Lugar
        <input
          name="location"
          required
          placeholder="Cochabamba, Bolivia"
          defaultValue={state.values?.location}
          className={inputClass}
        />
      </label>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        El torneo se crea con las inscripciones abiertas y no aparece en el
        sitio público hasta que lo inicies.
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/torneos"
          className="rounded-md border border-zinc-300 px-4 py-2.5 text-center font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-4 py-2.5 font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isPending ? "Creando…" : "Crear torneo"}
        </button>
      </div>
    </form>
  );
}
