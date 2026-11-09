import type { Athlete, Registration, TournamentStatus } from "@/lib/api/types";

/** Alphabetical by athlete name, Spanish rules (accents don't change the order: "Álvarez" ≈ "Alvarez"). */
export function sortByAthleteName(
  registrations: Registration[],
): Registration[] {
  return registrations.toSorted((a, b) =>
    a.athlete.name.localeCompare(b.athlete.name, "es", { sensitivity: "base" }),
  );
}

/** The API only lets registrations change while the tournament is a draft (enrollment open). */
export function canWithdraw(status: TournamentStatus): boolean {
  return status === "draft";
}

/** Registrations per tournament. The API allows an athlete only one category per tournament. */
export function countAthletesByTournament(
  registrations: Registration[],
): Map<number, number> {
  const counts = new Map<number, number>();
  for (const { category } of registrations) {
    counts.set(
      category.tournament_id,
      (counts.get(category.tournament_id) ?? 0) + 1,
    );
  }
  return counts;
}

/** The only athlete data the "register" dialog needs in the browser. */
export type AthleteOption = {
  id: number;
  name: string;
  ci: string | null;
  club: string;
  weightKg: number;
};

/** Athletes that can still be offered: everyone not registered in this category yet. */
export function toAthleteOptions(
  athletes: Athlete[],
  registrations: Registration[],
): AthleteOption[] {
  const registered = new Set(registrations.map((r) => r.athlete_id));
  return athletes
    .filter((athlete) => !registered.has(athlete.id))
    .map((athlete) => ({
      id: athlete.id,
      name: athlete.name,
      ci: athlete.ci ?? null,
      club: athlete.club.name,
      weightKg: athlete.weight_kg,
    }));
}

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

/** Matches name or CI, ignoring accents and case, like the API's search. */
export function filterAthleteOptions(
  options: AthleteOption[],
  query: string,
): AthleteOption[] {
  const term = normalize(query);
  if (!term) return options;
  return options.filter(
    (option) =>
      normalize(option.name).includes(term) ||
      normalize(option.ci ?? "").includes(term),
  );
}
