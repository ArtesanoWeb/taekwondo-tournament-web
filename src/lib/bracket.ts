import type { Match } from "@/lib/api/types";

export type Round = { number: number; name: string; matches: Match[] };

// Named from the end: the last round is always the final.
const NAMES_FROM_FINAL = [
  "Final",
  "Semifinal",
  "Cuartos de final",
  "Octavos de final",
  "Dieciseisavos de final",
];

export function roundName(roundNumber: number, totalRounds: number): string {
  return NAMES_FROM_FINAL[totalRounds - roundNumber] ?? `Ronda ${roundNumber}`;
}

/** The API returns every match of every round in one unordered list. */
export function groupRounds(matches: Match[]): Round[] {
  const byRound = Map.groupBy(matches, (match) => match.round_number);
  const roundNumbers = [...byRound.keys()].toSorted((a, b) => a - b);
  const totalRounds = roundNumbers.length;
  return roundNumbers.map((number) => ({
    number,
    name: roundName(number, totalRounds),
    matches: byRound.get(number)!.toSorted((a, b) => a.slot - b.slot),
  }));
}

/** Rounds won by each side, from the loaded round scores. */
export function roundsWon(match: Match): { red: number; blue: number } {
  const won = (athleteId: number | null) =>
    athleteId === null
      ? 0
      : match.round_scores.filter(
          (score) => score.round_winner_id === athleteId,
        ).length;
  return { red: won(match.athlete_red_id), blue: won(match.athlete_blue_id) };
}
