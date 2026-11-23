// The club ranking of a tournament, with Abel's points (meeting of 3/11): gold 7, silver 3,
// bronze 1 (a single bronze per category) and 1 for a category won without a fight (it had a
// single registrant). The API plans its own ranking in its 0.9.0; until then it's computed here
// from the brackets.

import type { Match } from "@/lib/api/types";
import { podium } from "@/lib/bracket";

export type Award = "gold" | "silver" | "bronze" | "walkover";

export const AWARD_POINTS: Record<Award, number> = {
  gold: 7,
  silver: 3,
  bronze: 1,
  walkover: 1,
};

export type ClubStanding = { club: string; points: number } & Record<
  Award,
  number
>;

/** One award to one club: a medal of a finished category, or a category without a fight. */
export type ClubAward = { club: string; award: Award };

/**
 * The medals of a category whose final is over, each to its athlete's club. Nothing while the
 * final is still on, and nothing for an athlete whose club isn't known.
 */
export function categoryAwards(
  matches: Match[],
  clubs: Record<number, string>,
): ClubAward[] {
  const result = podium(matches);
  if (!result) return [];
  return (["gold", "silver", "bronze"] as const).flatMap((award) => {
    const athlete = result[award];
    const club = athlete && clubs[athlete.id];
    return club ? [{ club, award }] : [];
  });
}

/** Clubs by points, then golds, silvers and bronzes; ties keep alphabetical order. */
export function rankClubs(awards: ClubAward[]): ClubStanding[] {
  const byClub = new Map<string, ClubStanding>();
  for (const { club, award } of awards) {
    const standing = byClub.get(club) ?? {
      club,
      points: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      walkover: 0,
    };
    standing[award] += 1;
    standing.points += AWARD_POINTS[award];
    byClub.set(club, standing);
  }
  return [...byClub.values()].toSorted(
    (a, b) =>
      b.points - a.points ||
      b.gold - a.gold ||
      b.silver - a.silver ||
      b.bronze - a.bronze ||
      a.club.localeCompare(b.club, "es"),
  );
}
