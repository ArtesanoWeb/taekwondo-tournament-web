import type { Tournament, TournamentStatus } from "@/lib/api/types";

export function sortByMostRecent(tournaments: Tournament[]): Tournament[] {
  return tournaments.toSorted((a, b) => b.date.localeCompare(a.date));
}

/** Drafts are still being prepared by the admin, so the public site doesn't show them. */
export function isPublic(status: TournamentStatus): boolean {
  return status !== "draft";
}

export type PublicTournamentGroups = {
  inProgress: Tournament[];
  finished: Tournament[];
};

/** Splits the public tournaments by status, each group from the most recent to the oldest. */
export function groupPublicTournaments(
  tournaments: Tournament[],
): PublicTournamentGroups {
  const sorted = sortByMostRecent(tournaments);
  return {
    inProgress: sorted.filter((t) => t.status === "in_progress"),
    finished: sorted.filter((t) => t.status === "finished"),
  };
}
