// Validation of the "create tournament" form, done before calling the API so the admin gets the
// errors in Spanish (the API's 422 messages are in English) and keeps what they typed.

export type TournamentFormValues = {
  name: string;
  date: string;
  location: string;
};

type ParsedTournament =
  { ok: true; values: TournamentFormValues } | { ok: false; error: string };

/** `YYYY-MM-DD` that is also a real calendar day (rejects 2026-02-30). */
export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function parseTournamentForm(
  name: unknown,
  date: unknown,
  location: unknown,
): ParsedTournament {
  const values = {
    name: typeof name === "string" ? name.trim() : "",
    date: typeof date === "string" ? date.trim() : "",
    location: typeof location === "string" ? location.trim() : "",
  };

  const missing = [
    !values.name && "el nombre",
    !values.date && "la fecha",
    !values.location && "el lugar",
  ].filter((field): field is string => !!field);
  if (missing.length > 0) {
    return { ok: false, error: `Falta ${listInSpanish(missing)}.` };
  }
  if (!isIsoDate(values.date)) {
    return { ok: false, error: "La fecha no es válida." };
  }
  return { ok: true, values };
}

function listInSpanish(items: string[]): string {
  return items.length === 1
    ? items[0]
    : `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
}
