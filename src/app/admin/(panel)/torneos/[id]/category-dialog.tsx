"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/button-classes";
import { DigitsInput } from "@/components/digits-input";
import { FormError } from "@/components/form-error";
import { EMPTY_CATEGORY_VALUES } from "@/lib/category-form";
import { beltGroupLabels, genderLabels } from "@/lib/labels";

import { type CategoryState, createCategory } from "../actions";

const inputClass =
  "w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10";
const labelClass = "flex min-w-0 flex-col gap-1 text-sm font-medium";

const AGE_SUGGESTIONS = ["Infantil", "Cadete", "Juvenil", "Adultos"];

export function NewCategoryButton({ tournamentId }: { tournamentId: number }) {
  // Mounted only while open, so closing discards the form.
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={secondaryButtonClass}
      >
        Nueva categoría
      </button>
      {open && (
        <CategoryDialog
          tournamentId={tournamentId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function CategoryDialog({
  tournamentId,
  onClose,
}: {
  tournamentId: number;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    CategoryState,
    FormData
  >(async (previous, formData) => {
    const next = await createCategory(previous, formData);
    if (next.saved) dialogRef.current?.close();
    return next;
  }, {});

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const values = state.values ?? EMPTY_CATEGORY_VALUES;

  return (
    <dialog
      ref={dialogRef}
      onClose={() => {
        if (state.stale) router.refresh();
        onClose();
      }}
      aria-label="Nueva categoría"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg bg-white p-5 text-zinc-950 shadow-xl backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-50"
    >
      {/* `key`: React resets uncontrolled inputs after an action, so remount them with what came back. */}
      <form
        key={JSON.stringify(values)}
        action={formAction}
        className="flex flex-col gap-4"
      >
        <h2 className="text-lg font-semibold">Nueva categoría</h2>
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <FormError message={state.error} />

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
          Nombre de la edad
          <input
            name="ageLabel"
            required
            list="age-suggestions"
            autoComplete="off"
            placeholder="Cadete"
            defaultValue={values.ageLabel}
            className={inputClass}
          />
          <datalist id="age-suggestions">
            {AGE_SUGGESTIONS.map((age) => (
              <option key={age} value={age} />
            ))}
          </datalist>
        </label>
        <div className="grid grid-cols-2 items-end gap-3">
          <label className={labelClass}>
            Edad mínima
            <DigitsInput
              name="minAge"
              required
              autoComplete="off"
              defaultValue={values.minAge}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Edad máxima (opcional)
            <DigitsInput
              name="maxAge"
              autoComplete="off"
              defaultValue={values.maxAge}
              className={inputClass}
            />
          </label>
        </div>

        <label className={labelClass}>
          Cinturón
          <select
            name="beltGroup"
            required
            defaultValue={values.beltGroup}
            className={inputClass}
          >
            <option value="" disabled>
              Elegir…
            </option>
            {(["color", "black"] as const).map((group) => (
              <option key={group} value={group}>
                {beltGroupLabels[group]}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Nombre del peso
          <input
            name="weightLabel"
            required
            autoComplete="off"
            placeholder="Hasta 45kg"
            defaultValue={values.weightLabel}
            className={inputClass}
          />
        </label>
        <div className="grid grid-cols-2 items-end gap-3">
          <label className={labelClass}>
            Peso mínimo (opcional)
            <DigitsInput
              name="minWeight"
              autoComplete="off"
              defaultValue={values.minWeight}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Peso máximo (opcional)
            <DigitsInput
              name="maxWeight"
              autoComplete="off"
              defaultValue={values.maxWeight}
              className={inputClass}
            />
          </label>
        </div>

        <label className={labelClass}>
          Rounds para ganar
          <DigitsInput
            name="roundsToWin"
            required
            autoComplete="off"
            defaultValue={values.roundsToWin}
            className={inputClass}
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
            {isPending ? "Creando…" : "Crear categoría"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
