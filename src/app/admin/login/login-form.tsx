"use client";

import { useActionState } from "react";

import { login, type LoginState } from "../actions";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10";

type LoginFormProps = { next?: string; expired: boolean };

export function LoginForm({ next, expired }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {expired && !state.error && (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
        >
          Tu sesión venció. Vuelve a iniciar sesión para continuar.
        </p>
      )}
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </p>
      )}

      {next && <input type="hidden" name="next" value={next} />}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Usuario
        <input
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          required
          defaultValue={state.username}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-4 py-2.5 font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {isPending ? "Entrando…" : "Iniciar sesión"}
      </button>
      {isPending && (
        <p className="animate-reveal-late text-sm text-zinc-600 dark:text-zinc-400">
          Despertando el servidor, puede tardar hasta un minuto…
        </p>
      )}
    </form>
  );
}
