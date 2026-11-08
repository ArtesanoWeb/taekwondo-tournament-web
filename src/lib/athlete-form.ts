// Validation of the athlete form, done before calling the API so the admin gets the errors in
// Spanish (the API's 422 messages are in English) and keeps what they typed.

import type { Athlete, Gender } from "@/lib/api/types";
import { isIsoDate } from "@/lib/tournament-form";

export const MAX_WEIGHT_KG = 250;

/** Same format the API enforces: 5 to 9 digits and an optional 2-character complement. */
const CI_PATTERN = /^[0-9]{5,9}(?:-[0-9A-Z]{2})?$/;

export type AthleteFormValues = {
  name: string;
  ci: string;
  birthDate: string;
  gender: string;
  beltRank: string;
  weight: string;
  clubId: string;
};

export type AthletePayload = {
  name: string;
  ci: string | null;
  birth_date: string;
  gender: Gender;
  belt_rank: string;
  weight_kg: number;
  club_id: number;
};

type ParsedAthlete =
  { ok: true; payload: AthletePayload } | { ok: false; error: string };

export const EMPTY_ATHLETE_VALUES: AthleteFormValues = {
  name: "",
  ci: "",
  birthDate: "",
  gender: "",
  beltRank: "",
  weight: "",
  clubId: "",
};

export function athleteToFormValues(athlete: Athlete): AthleteFormValues {
  return {
    name: athlete.name,
    ci: athlete.ci ?? "",
    birthDate: athlete.birth_date,
    gender: athlete.gender,
    beltRank: athlete.belt_rank,
    weight: String(athlete.weight_kg),
    clubId: String(athlete.club_id),
  };
}

function isGender(value: string): value is Gender {
  return value === "male" || value === "female";
}

/** `today` is `YYYY-MM-DD`; it's a parameter so the function stays pure and testable. */
export function parseAthleteForm(
  values: AthleteFormValues,
  today: string,
): ParsedAthlete {
  const name = values.name.trim();
  const ci = values.ci.trim().toUpperCase();
  const birthDate = values.birthDate.trim();
  const gender = values.gender.trim();
  const beltRank = values.beltRank.trim();
  // Spanish keyboards type the decimal separator as a comma.
  const weightText = values.weight.trim().replace(",", ".");
  const clubId = values.clubId.trim();

  const missing = [
    !name && "el nombre",
    !birthDate && "la fecha de nacimiento",
    !gender && "el género",
    !beltRank && "el cinturón",
    !weightText && "el peso",
    !clubId && "el club",
  ].filter((field): field is string => !!field);
  if (missing.length > 0) {
    const list =
      missing.length === 1
        ? missing[0]
        : `${missing.slice(0, -1).join(", ")} y ${missing.at(-1)}`;
    return { ok: false, error: `Falta ${list}.` };
  }

  if (ci && !CI_PATTERN.test(ci)) {
    return {
      ok: false,
      error:
        "El CI debe tener de 5 a 9 dígitos y, si corresponde, un complemento (ejemplo: 1234567-1A).",
    };
  }
  if (!isIsoDate(birthDate) || birthDate > today) {
    return { ok: false, error: "La fecha de nacimiento no es válida." };
  }
  if (!isGender(gender)) {
    return { ok: false, error: "El género no es válido." };
  }
  const weight = /^\d+(\.\d+)?$/.test(weightText) ? Number(weightText) : NaN;
  if (!(weight > 0 && weight <= MAX_WEIGHT_KG)) {
    return {
      ok: false,
      error: `El peso debe ser un número mayor que 0 y de hasta ${MAX_WEIGHT_KG} kg.`,
    };
  }
  if (!/^\d+$/.test(clubId)) {
    return { ok: false, error: "El club no es válido." };
  }

  return {
    ok: true,
    payload: {
      name,
      ci: ci || null,
      birth_date: birthDate,
      gender,
      belt_rank: beltRank,
      weight_kg: weight,
      club_id: Number(clubId),
    },
  };
}

// The API has no error code for this 409, and it uses the same status for a repeated CI or for a
// tournament in progress: the start of the message is the only way to tell them apart.
const WITHDRAWAL_PREFIX = "Este cambio retira al atleta de:";

export function isWithdrawalWarning(message: string): boolean {
  return message.startsWith(WITHDRAWAL_PREFIX);
}
