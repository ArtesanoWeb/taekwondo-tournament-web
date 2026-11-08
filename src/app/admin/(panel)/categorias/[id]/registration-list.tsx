"use client";

import { useActionState, useRef } from "react";

import {
  ConfirmDialog,
  secondaryButtonClass,
} from "@/components/confirm-dialog";
import { FormError } from "@/components/form-error";
import type { Registration } from "@/lib/api/types";

import { withdrawRegistration, type WithdrawState } from "./actions";

type RegistrationListProps = {
  registrations: Registration[];
  /** Enrollment is open: each row gets a "Retirar" button. */
  canWithdraw: boolean;
};

export function RegistrationList({
  registrations,
  canWithdraw,
}: RegistrationListProps) {
  if (registrations.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Todavía no hay inscritos en esta categoría.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {registrations.map((registration) => (
        <li key={registration.id} className="p-3">
          <RegistrationRow
            registration={registration}
            canWithdraw={canWithdraw}
          />
        </li>
      ))}
    </ul>
  );
}

function RegistrationRow({
  registration,
  canWithdraw,
}: {
  registration: Registration;
  canWithdraw: boolean;
}) {
  const [state, formAction, isPending] = useActionState<
    WithdrawState,
    FormData
  >(withdrawRegistration, {});
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { athlete } = registration;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="font-medium">{athlete.name}</span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {athlete.club.name}
          </span>
        </div>
        {canWithdraw && (
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            disabled={isPending}
            className={`${secondaryButtonClass} shrink-0`}
          >
            {isPending ? "Retirando…" : "Retirar"}
          </button>
        )}
      </div>
      <FormError message={state.error} />
      {canWithdraw && (
        <>
          <input type="hidden" name="registrationId" value={registration.id} />
          <ConfirmDialog
            dialogRef={dialogRef}
            title={`¿Retirar a ${athlete.name}?`}
            confirmLabel="Sí, retirar"
          >
            Se borra su inscripción en esta categoría. Mientras las
            inscripciones sigan abiertas, se puede volver a inscribir.
          </ConfirmDialog>
        </>
      )}
    </form>
  );
}
