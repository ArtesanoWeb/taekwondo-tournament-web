"use client";

import { type ReactNode, useRef, useState } from "react";

import { ConfirmDialog } from "./confirm-dialog";

type ConfirmSubmitButtonProps = {
  className: string;
  disabled?: boolean;
  /** The button's text. */
  children: ReactNode;
  title: ReactNode;
  confirmLabel: string;
  /**
   * What the confirmation explains. As a function it gets the form when the button is tapped, so
   * it can show what's typed at that moment.
   */
  message: ReactNode | ((form: HTMLFormElement) => ReactNode);
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
  const [content, setContent] = useState<ReactNode>(
    typeof message === "function" ? null : message,
  );
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={(event) => {
          const form = event.currentTarget.form;
          if (!form?.reportValidity()) return;
          setContent(typeof message === "function" ? message(form) : message);
          dialogRef.current?.showModal();
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
        {content}
      </ConfirmDialog>
    </>
  );
}
