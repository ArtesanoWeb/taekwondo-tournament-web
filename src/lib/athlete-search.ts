import type { Athlete, Gender } from "@/lib/api/types";

/** Lowercase and without accents, like the API's search: `perez` finds `Pérez`. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function matchesQuery(athlete: Athlete, query: string): boolean {
  const wanted = normalize(query);
  if (!wanted) return true;
  return (
    normalize(athlete.name).includes(wanted) ||
    (athlete.ci ?? "").toLowerCase().includes(wanted)
  );
}

export type AthleteFilters = {
  query: string;
  clubId: number | null;
  gender: Gender | null;
};

export const NO_FILTERS: AthleteFilters = {
  query: "",
  clubId: null,
  gender: null,
};

export function filterAthletes(
  athletes: Athlete[],
  { query, clubId, gender }: AthleteFilters,
): Athlete[] {
  return athletes.filter(
    (athlete) =>
      (clubId === null || athlete.club_id === clubId) &&
      (gender === null || athlete.gender === gender) &&
      matchesQuery(athlete, query),
  );
}

/** Up to `limit` athletes for the search box, those whose name starts with the text first. */
export function suggestions(
  athletes: Athlete[],
  query: string,
  limit = 5,
): Athlete[] {
  const wanted = normalize(query);
  if (!wanted) return [];
  const starts = (athlete: Athlete) =>
    normalize(athlete.name).startsWith(wanted) ? 0 : 1;
  return athletes
    .filter((athlete) => matchesQuery(athlete, wanted))
    .toSorted((a, b) => starts(a) - starts(b) || compareNames(a.name, b.name))
    .slice(0, limit);
}

const collator = new Intl.Collator("es", { sensitivity: "base" });

/** Spanish order: Ñ comes after N, accents don't count. */
export function compareNames(a: string, b: string): number {
  return collator.compare(a, b);
}

export const ALPHABET = [..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"];

/** The index letter of a name: Ñ stays Ñ, Á goes under A; anything else under "#". */
export function letterOf(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  if (first === "Ñ") return "Ñ";
  const plain = first.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return ALPHABET.includes(plain) ? plain : "#";
}
