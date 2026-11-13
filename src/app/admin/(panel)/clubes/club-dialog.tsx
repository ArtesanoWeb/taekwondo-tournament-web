"use client";

import {
  type ReactNode,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/button-classes";
import { FormError } from "@/components/form-error";
import type { Club } from "@/lib/api/types";

import { type ClubState, saveClub } from "./actions";

type ClubDialogButtonProps = {
  /** Without a club, the dialog creates a new one. */
  club?: Club;
  className: string;
  /** An icon instead of the text, which then becomes the button's accessible name. */
  children?: ReactNode;
};

export function ClubDialogButton({
  club,
  className,
  children,
}: ClubDialogButtonProps) {
  const label = club ? "Editar" : "Nuevo club";
  // Mounted only while open, so closing discards the form.
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={children ? label : undefined}
        className={className}
      >
        {children ?? label}
      </button>
      {open && <ClubDialog club={club} onClose={() => setOpen(false)} />}
    </>
  );
}

function ClubDialog({ club, onClose }: { club?: Club; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, isPending] = useActionState<ClubState, FormData>(
    async (previous, formData) => {
      const next = await saveClub(previous, formData);
      if (next.saved) dialogRef.current?.close();
      return next;
    },
    {},
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const name = state.name ?? club?.name ?? "";
  const title = club ? `Editar ${club.name}` : "Nuevo club";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label={title}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg bg-white p-5 text-zinc-950 shadow-xl backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-50"
    >
      {/* `key`: React resets uncontrolled inputs after an action, so remount them with what came back. */}
      <form key={name} action={formAction} className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {club && <input type="hidden" name="clubId" value={club.id} />}
        <FormError message={state.error} />
        <label className="flex flex-col gap-1 text-sm font-medium">
          Nombre
          <input
            name="name"
            required
            autoComplete="off"
            defaultValue={name}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          />
        </label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={secondaryButtonClass}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={primaryButtonClass}
          >
            {isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
