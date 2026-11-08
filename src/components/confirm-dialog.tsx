"use client";

import { type ReactNode, type RefObject, useId } from "react";

import { primaryButtonClass, secondaryButtonClass } from "./button-classes";

type ConfirmDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  title: ReactNode;
  children: ReactNode;
  confirmLabel: string;
};

/**
 * Modal that asks before an irreversible action. It must be rendered inside the `<form>` it
 * confirms: its confirm button submits that form; open it with `dialogRef.current?.showModal()`.
 */
export function ConfirmDialog({
  dialogRef,
  title,
  children,
  confirmLabel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg bg-white p-5 text-zinc-950 shadow-xl backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-50"
    >
      <div className="flex flex-col gap-4">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {children}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={close}
            className={secondaryButtonClass}
          >
            Cancelar
          </button>
          <button type="submit" onClick={close} className={primaryButtonClass}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
