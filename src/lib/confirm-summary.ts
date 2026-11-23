// What each confirmation shows before saving: the data as it was typed in the form, with the same
// Spanish labels as the form. When editing, each row also carries its value before the change.

import type { AthleteFormValues } from "@/lib/athlete-form";
import type { Grade } from "@/lib/api/types";
import type { AthleteOption } from "@/lib/registrations";
import type { CategoryFormValues } from "@/lib/category-form";
import { formatAgeRange } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { beltGroupLabels, genderLabels, gradeLabels } from "@/lib/labels";
import type { TournamentFormValues } from "@/lib/tournament-form";

export type SummaryRow = {
  label: string;
  value: string;
  /** Only when editing and the value changed: what it was before. */
  previous?: string;
  /** The grade row also draws its belt. */
  grade?: Grade;
};

const EMPTY = "—";

function text(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? EMPTY : trimmed;
}

function lookup<K extends string>(
  labels: Record<K, string>,
  value: string,
): string {
  return Object.hasOwn(labels, value) ? labels[value as K] : EMPTY;
}

function date(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
    ? formatDate(value.trim())
    : EMPTY;
}

function kilos(value: string): string {
  const weight = value.trim().replace(",", ".");
  return weight === "" ? EMPTY : `${weight} kg`;
}

/** Marks what changed: each row gets the old value when it differs from the new one. */
export function withChanges(
  rows: SummaryRow[],
  before: SummaryRow[],
): SummaryRow[] {
  const old = new Map(before.map((row) => [row.label, row.value]));
  return rows.map((row) => {
    const previous = old.get(row.label);
    return previous !== undefined && previous !== row.value
      ? { ...row, previous }
      : row;
  });
}

export function tournamentSummary(values: TournamentFormValues): SummaryRow[] {
  return [
    { label: "Nombre", value: text(values.name) },
    { label: "Fecha", value: date(values.date) },
    { label: "Lugar", value: text(values.location) },
  ];
}

export function clubSummary(name: string, previousName?: string): SummaryRow[] {
  const rows = [{ label: "Nombre", value: text(name) }];
  return previousName === undefined
    ? rows
    : withChanges(rows, [{ label: "Nombre", value: previousName }]);
}

type ClubName = { id: number; name: string };

function athleteRows(
  values: AthleteFormValues,
  clubs: ClubName[],
): SummaryRow[] {
  const club = clubs.find((item) => String(item.id) === values.clubId.trim());
  const grade = values.grade.trim();
  const isGrade = Object.hasOwn(gradeLabels, grade);
  return [
    { label: "Nombre completo", value: text(values.name) },
    { label: "CI", value: values.ci.trim().toUpperCase() || "Sin CI" },
    { label: "Fecha de nacimiento", value: date(values.birthDate) },
    { label: "Género", value: lookup(genderLabels, values.gender) },
    {
      label: "Grado",
      value: lookup(gradeLabels, grade),
      ...(isGrade && { grade: grade as Grade }),
    },
    { label: "Peso", value: kilos(values.weight) },
    { label: "Club", value: club?.name ?? EMPTY },
  ];
}

/** With `previous` (editing), the rows that changed show their old value. */
export function athleteSummary(
  values: AthleteFormValues,
  clubs: ClubName[],
  previous?: AthleteFormValues,
): SummaryRow[] {
  const rows = athleteRows(values, clubs);
  return previous ? withChanges(rows, athleteRows(previous, clubs)) : rows;
}

export function categorySummary(values: CategoryFormValues): SummaryRow[] {
  const minAge = Number(values.minAge.trim());
  const maxAge = values.maxAge.trim() === "" ? null : Number(values.maxAge);
  const ages =
    values.minAge.trim() === "" ? "" : ` · ${formatAgeRange(minAge, maxAge)}`;
  const minWeight = values.minWeight.trim();
  const maxWeight = values.maxWeight.trim();
  const weights =
    minWeight && maxWeight
      ? ` · ${minWeight} a ${maxWeight} kg`
      : maxWeight
        ? ` · hasta ${maxWeight} kg`
        : minWeight
          ? ` · más de ${minWeight} kg`
          : "";
  return [
    { label: "Género", value: lookup(genderLabels, values.gender) },
    { label: "Edad", value: `${text(values.ageLabel)}${ages}` },
    { label: "Cinturón", value: lookup(beltGroupLabels, values.beltGroup) },
    { label: "Peso", value: `${text(values.weightLabel)}${weights}` },
    { label: "Rounds para ganar", value: text(values.roundsToWin) },
  ];
}

export function registrationSummary(
  athlete: AthleteOption,
  categoryName: string,
): SummaryRow[] {
  return [
    { label: "Atleta", value: athlete.name },
    { label: "CI", value: athlete.ci ?? "Sin CI" },
    { label: "Club", value: athlete.club },
    { label: "Peso", value: `${athlete.weightKg} kg` },
    { label: "Categoría", value: categoryName },
  ];
}

/** A form's current fields as strings (for the summaries above). */
export function formValues<T extends Record<string, string>>(
  form: HTMLFormElement,
  empty: T,
): T {
  const data = new FormData(form);
  return Object.fromEntries(
    Object.keys(empty).map((key) => {
      const value = data.get(key);
      return [key, typeof value === "string" ? value : ""];
    }),
  ) as T;
}
