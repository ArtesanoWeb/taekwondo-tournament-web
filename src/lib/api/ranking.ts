import "server-only";

import type { Tournament } from "@/lib/api/types";
import {
  type ClubAward,
  type ClubStanding,
  categoryAwards,
  rankClubs,
} from "@/lib/ranking";

import { getBracket, getCategories, getRegistrants } from "./public";

export type TournamentRanking = {
  standings: ClubStanding[];
  /** Categories that already gave their points (final over, or no fight), out of `total`. */
  decided: number;
  total: number;
};

/**
 * A tournament's club ranking from its brackets (`lib/ranking.ts`), through the public cached
 * reads. The bracket only has names: clubs come from each category's registrants. A category
 * without a bracket and a single registrant counts as won without a fight once the tournament
 * started. `null` if the categories can't be read.
 */
export async function getTournamentRanking(
  tournament: Tournament,
): Promise<TournamentRanking | null> {
  const categories = await getCategories(tournament.id);
  if (!categories.ok) return null;
  const started = tournament.status !== "draft";

  const results = await Promise.all(
    categories.data.map(async (category): Promise<ClubAward[] | null> => {
      if (!category.has_bracket && !started) return null;
      const [bracket, registrants] = await Promise.all([
        category.has_bracket ? getBracket(category.id) : null,
        getRegistrants(category.id),
      ]);
      if (!registrants.ok) return null;
      if (!bracket) {
        const [only] = registrants.data;
        return registrants.data.length === 1
          ? [{ club: only.club, award: "walkover" }]
          : null;
      }
      if (!bracket.ok) return null;
      const clubs = Object.fromEntries(
        registrants.data.map((registrant) => [
          registrant.athlete_id,
          registrant.club,
        ]),
      );
      const awards = categoryAwards(bracket.data.matches, clubs);
      return awards.length > 0 ? awards : null;
    }),
  );

  const decided = results.filter((awards) => awards !== null);
  return {
    standings: rankClubs(decided.flat()),
    decided: decided.length,
    total: categories.data.length,
  };
}
