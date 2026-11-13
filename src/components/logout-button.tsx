"use client";

import { type ReactNode, useRef } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";

import { logout } from "@/app/admin/actions";

/** Logs out after a confirmation. The look comes from the caller: a row, an icon… */
export function LogoutButton({
  className,
  children,
  label = "Cerrar sesión",
}: {
  className: string;
  /** An icon instead of the text, which then becomes the button's accessible name. */
  children?: ReactNode;
  label?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <form action={logout}>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={children ? label : undefined}
        className={className}
      >
        {children ?? label}
      </button>
      <ConfirmDialog
        dialogRef={dialogRef}
        title="¿Cerrar sesión?"
        confirmLabel="Sí, cerrar sesión"
      >
        Para volver a administrar torneos tendrás que iniciar sesión otra vez.
      </ConfirmDialog>
    </form>
  );
}
