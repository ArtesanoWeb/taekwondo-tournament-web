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
import { DigitsInput } from "@/components/digits-input";
import { FormError } from "@/components/form-error";
import type { Athlete, Club } from "@/lib/api/types";
import { athleteToFormValues, EMPTY_ATHLETE_VALUES } from "@/lib/athlete-form";
import { genderLabels } from "@/lib/labels";

import { type AthleteState, saveAthlete } from "./actions";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10";

// Android Chrome draws date inputs natively (own width and border): `appearance-none` lets them
// look and stretch like the other fields; the min height keeps an empty one from collapsing.
const dateInputClass = `${inputClass} min-h-[2.625rem] w-full appearance-none text-left [&::-webkit-date-and-time-value]:text-left`;
const labelClass = "flex flex-col gap-1 text-sm font-medium";

const BELT_SUGGESTIONS = [
  "blanco",
  "amarillo",
  "verde",
  "azul",
  "rojo",
  "negro 1er dan",
];

type AthleteDialogButtonProps = {
  /** Without an athlete, the dialog creates a new one. */
  athlete?: Athlete;
  clubs: Club[];
  className: string;
  /** An icon instead of the text, which then becomes the button's accessible name. */
  children?: ReactNode;
};

export function AthleteDialogButton({
  athlete,
  clubs,
  className,
  children,
}: AthleteDialogButtonProps) {
  const label = athlete ? "Editar" : "Nuevo atleta";
  // Mounted only while open: the list can have many athletes, and closing discards all form state.
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
      {open && (
        <AthleteDialog
          athlete={athlete}
          clubs={clubs}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

type AthleteDialogProps = {
  athlete?: Athlete;
  clubs: Club[];
  onClose: () => void;
};

function AthleteDialog({ athlete, clubs, onClose }: AthleteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [state, formAction, isPending] = useActionState<AthleteState, FormData>(
    async (previous, formData) => {
      setWarningDismissed(false);
      const next = await saveAthlete(previous, formData);
      if (next.saved) dialogRef.current?.close();
      return next;
    },
    {},
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const values =
    state.values ??
    (athlete ? athleteToFormValues(athlete) : EMPTY_ATHLETE_VALUES);
  const close = () => dialogRef.current?.close();
  const showWarning = !!state.withdrawal && !warningDismissed;
  const title = athlete ? `Editar a ${athlete.name}` : "Nuevo atleta";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label={title}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg bg-white p-5 text-zinc-950 shadow-xl backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-50"
    >
      {/* `key`: React resets uncontrolled inputs after an action, so remount them with what came back. */}
      <form
        key={JSON.stringify(values)}
        action={formAction}
        className="flex flex-col gap-4"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        {athlete && <input type="hidden" name="athleteId" value={athlete.id} />}
        <FormError message={state.error} />

        {/* Hidden, not unmounted, during the warning: its values are what gets confirmed. */}
        <div className={showWarning ? "hidden" : "flex flex-col gap-4"}>
          <label className={labelClass}>
            Nombre completo
            <input
              name="name"
              required
              autoComplete="off"
              defaultValue={values.name}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            CI (opcional)
            <input
              name="ci"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="1234567 o 1234567-1A"
              defaultValue={values.ci}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Fecha de nacimiento
            <input
              name="birthDate"
              type="date"
              required
              defaultValue={values.birthDate}
              className={dateInputClass}
            />
          </label>
          <label className={labelClass}>
            Género
            <select
              name="gender"
              required
              defaultValue={values.gender}
              className={inputClass}
            >
              <option value="" disabled>
                Elegir…
              </option>
              {(["female", "male"] as const).map((gender) => (
                <option key={gender} value={gender}>
                  {genderLabels[gender]}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Cinturón
            <input
              name="beltRank"
              required
              list="belt-suggestions"
              autoComplete="off"
              defaultValue={values.beltRank}
              className={inputClass}
            />
            <datalist id="belt-suggestions">
              {BELT_SUGGESTIONS.map((belt) => (
                <option key={belt} value={belt} />
              ))}
            </datalist>
          </label>
          <label className={labelClass}>
            Peso (kg)
            <DigitsInput
              name="weight"
              required
              autoComplete="off"
              placeholder="38"
              defaultValue={values.weight}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Club
            <select
              name="clubId"
              required
              defaultValue={values.clubId}
              className={inputClass}
            >
              <option value="" disabled>
                Elegir…
              </option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={close}
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
        </div>

        {showWarning && (
          <div className="flex flex-col gap-4">
            <p
              role="alert"
              className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            >
              {state.withdrawal}
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setWarningDismissed(true)}
                className={secondaryButtonClass}
              >
                Volver a editar
              </button>
              <button
                type="submit"
                name="confirmWithdrawal"
                value="true"
                disabled={isPending}
                className={primaryButtonClass}
              >
                {isPending ? "Guardando…" : "Sí, guardar y retirar"}
              </button>
            </div>
          </div>
        )}
      </form>
    </dialog>
  );
}
