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
