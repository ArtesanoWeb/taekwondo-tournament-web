// Validation of the "new category" form, done before calling the API so the admin gets the errors
// in Spanish (the API's 422 messages are in English) and keeps what they typed.

import type { BeltGroup, Gender } from "@/lib/api/types";

export const MAX_AGE = 120;
export const MAX_WEIGHT_KG = 250;
export const MAX_ROUNDS_TO_WIN = 5;

export type CategoryFormValues = {
  gender: string;
  ageLabel: string;
  minAge: string;
  maxAge: string;
  beltGroup: string;
  weightLabel: string;
  minWeight: string;
  maxWeight: string;
  roundsToWin: string;
};

export type CategoryFields = {
  gender: Gender;
  age_label: string;
  min_age: number;
  max_age: number | null;
  belt_group: BeltGroup;
  weight_label: string;
  min_weight: number | null;
  max_weight: number | null;
  rounds_to_win: number;
};

type ParsedCategory =
  { ok: true; fields: CategoryFields } | { ok: false; error: string };

export const EMPTY_CATEGORY_VALUES: CategoryFormValues = {
  gender: "",
  ageLabel: "",
  minAge: "",
  maxAge: "",
  beltGroup: "",
  weightLabel: "",
  minWeight: "",
  maxWeight: "",
  // Best of 3, the usual format.
  roundsToWin: "2",
};

function parseAge(text: string): number | undefined {
  if (!/^\d+$/.test(text)) return undefined;
  const age = Number(text);
  return age <= MAX_AGE ? age : undefined;
}

function parseWeight(text: string): number | undefined {
  // Spanish keyboards type the decimal separator as a comma.
  const normalized = text.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) return undefined;
  const weight = Number(normalized);
  return weight > 0 && weight <= MAX_WEIGHT_KG ? weight : undefined;
}

export function parseCategoryForm(values: CategoryFormValues): ParsedCategory {
  const gender = values.gender.trim();
  const ageLabel = values.ageLabel.trim();
  const minAgeText = values.minAge.trim();
  const maxAgeText = values.maxAge.trim();
  const beltGroup = values.beltGroup.trim();
  const weightLabel = values.weightLabel.trim();
  const minWeightText = values.minWeight.trim();
  const maxWeightText = values.maxWeight.trim();
  const roundsText = values.roundsToWin.trim();

  const missing = [
    !gender && "el género",
    !ageLabel && "el nombre de la edad",
    !minAgeText && "la edad mínima",
    !beltGroup && "el cinturón",
    !weightLabel && "el nombre del peso",
    !roundsText && "los rounds para ganar",
  ].filter((field): field is string => !!field);
  if (missing.length > 0) {
    const list =
      missing.length === 1
        ? missing[0]
        : `${missing.slice(0, -1).join(", ")} y ${missing.at(-1)}`;
    return { ok: false, error: `Falta ${list}.` };
  }

  if (gender !== "male" && gender !== "female") {
    return { ok: false, error: "El género no es válido." };
  }
  if (beltGroup !== "color" && beltGroup !== "black") {
    return { ok: false, error: "El cinturón no es válido." };
  }

  const ageError = `La edad debe ser un número entero de 0 a ${MAX_AGE}.`;
  const minAge = parseAge(minAgeText);
  if (minAge === undefined) return { ok: false, error: ageError };
  const maxAge = maxAgeText ? parseAge(maxAgeText) : null;
  if (maxAge === undefined) return { ok: false, error: ageError };
  if (maxAge !== null && minAge > maxAge) {
    return {
      ok: false,
      error: "La edad mínima no puede ser mayor que la máxima.",
    };
  }

  const weightError = `El peso debe ser un número mayor que 0 y de hasta ${MAX_WEIGHT_KG} kg.`;
  const minWeight = minWeightText ? parseWeight(minWeightText) : null;
  if (minWeight === undefined) return { ok: false, error: weightError };
  const maxWeight = maxWeightText ? parseWeight(maxWeightText) : null;
  if (maxWeight === undefined) return { ok: false, error: weightError };
  if (minWeight !== null && maxWeight !== null && minWeight > maxWeight) {
    return {
      ok: false,
      error: "El peso mínimo no puede ser mayor que el máximo.",
    };
  }

  const rounds = /^\d+$/.test(roundsText) ? Number(roundsText) : NaN;
  if (!(rounds >= 1 && rounds <= MAX_ROUNDS_TO_WIN)) {
    return {
      ok: false,
      error: `Los rounds para ganar deben ser de 1 a ${MAX_ROUNDS_TO_WIN}.`,
    };
  }

  return {
    ok: true,
    fields: {
      gender,
      age_label: ageLabel,
      min_age: minAge,
      max_age: maxAge,
      belt_group: beltGroup,
      weight_label: weightLabel,
      min_weight: minWeight,
      max_weight: maxWeight,
      rounds_to_win: rounds,
    },
  };
}
