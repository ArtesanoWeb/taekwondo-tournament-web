import type { Registration, TournamentStatus } from "@/lib/api/types";

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
