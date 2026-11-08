"use client";

import { useActionState, useRef } from "react";

import { primaryButtonClass } from "@/components/button-classes";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormError } from "@/components/form-error";

import { generateBracket, type GenerateBracketState } from "./actions";

type GenerateBracketProps = { categoryId: number; registered: number };

export function GenerateBracket({
  categoryId,
  registered,
}: GenerateBracketProps) {
  const [state, formAction, isPending] = useActionState<
    GenerateBracketState,
    FormData
  >(generateBracket, {});
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <form
      action={formAction}
      className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700"
    >
      <p className="text-zinc-600 dark:text-zinc-400">
        La llave todavía no fue sorteada. Hay {registered} inscritos.
      </p>
      <input type="hidden" name="categoryId" value={categoryId} />
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        disabled={isPending}
        className={`${primaryButtonClass} w-full sm:w-auto`}
      >
        {isPending ? "Generando…" : "Generar llave"}
      </button>
      <FormError message={state.error} />
      <ConfirmDialog
        dialogRef={dialogRef}
        title="¿Generar la llave?"
        confirmLabel="Sí, generar"
      >
        Se sortean al azar los {registered} inscritos. Si no son una potencia de
        2, algunos pasan directo a la segunda ronda.{" "}
        <strong className="text-zinc-950 dark:text-zinc-50">
          La llave no se puede volver a sortear.
        </strong>
      </ConfirmDialog>
    </form>
  );
}
