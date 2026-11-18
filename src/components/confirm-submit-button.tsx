"use client";

import { type ReactNode, useRef } from "react";

import { ConfirmDialog } from "./confirm-dialog";

type ConfirmSubmitButtonProps = {
  className: string;
  disabled?: boolean;
  /** The button's text. */
  children: ReactNode;
  title: ReactNode;
  confirmLabel: string;
  /** What the confirmation explains. */
  message: ReactNode;
};

/**
 * A submit button that asks first. Render it inside the `<form>` it saves: it checks the form's
 * own validation (required fields) before opening the confirmation, whose button submits.
 */
export function ConfirmSubmitButton({
  className,
  disabled,
  children,
  title,
  confirmLabel,
  message,
}: ConfirmSubmitButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={(event) => {
          if (event.currentTarget.form?.reportValidity()) {
            dialogRef.current?.showModal();
          }
        }}
        className={className}
      >
        {children}
      </button>
      <ConfirmDialog
        dialogRef={dialogRef}
        title={title}
        confirmLabel={confirmLabel}
      >
        {message}
      </ConfirmDialog>
    </>
  );
}
