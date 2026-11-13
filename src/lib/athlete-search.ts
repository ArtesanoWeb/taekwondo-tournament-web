import type { Athlete } from "@/lib/api/types";

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
