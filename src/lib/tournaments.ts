import type { Tournament } from "@/lib/api/types";

export function sortByMostRecent(tournaments: Tournament[]): Tournament[] {
  return tournaments.toSorted((a, b) => b.date.localeCompare(a.date));
}
