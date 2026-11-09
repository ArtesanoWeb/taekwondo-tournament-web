"use client";

import { useEffect, useRef, useState } from "react";

import { secondaryButtonClass } from "@/components/button-classes";
import type { Registration } from "@/lib/api/types";

import { RegistrationList } from "./registration-list";

/** Keeps the roster one tap away without competing with the bracket for the screen. */
export function RegistrationsButton({
  registrations,
}: {
  registrations: Registration[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${secondaryButtonClass} w-fit`}
      >
        Ver inscritos
      </button>
      {open && (
        <RegistrationsDialog
          registrations={registrations}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function RegistrationsDialog({
  registrations,
  onClose,
}: {
  registrations: Registration[];
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label="Inscritos"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md rounded-lg bg-white text-zinc-950 shadow-xl backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-50"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col gap-3 p-5">
        <h2 className="text-lg font-semibold">Inscritos</h2>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <RegistrationList registrations={registrations} canWithdraw={false} />
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className={secondaryButtonClass}
        >
          Cerrar
        </button>
      </div>
    </dialog>
  );
}
