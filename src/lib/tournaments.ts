import type { Tournament } from "@/lib/api/types";

export function sortByMostRecent(tournaments: Tournament[]): Tournament[] {
  return tournaments.toSorted((a, b) => b.date.localeCompare(a.date));
}

export type TournamentGroups = {
  inProgress: Tournament[];
  open: Tournament[];
  finished: Tournament[];
};

/** Splits the tournaments by status, each group from the most recent to the oldest. */
export function groupTournamentsByStatus(
  tournaments: Tournament[],
): TournamentGroups {
  const sorted = sortByMostRecent(tournaments);
  return {
    inProgress: sorted.filter((t) => t.status === "in_progress"),
    open: sorted.filter((t) => t.status === "draft"),
    finished: sorted.filter((t) => t.status === "finished"),
  };
}
