import type { Match } from "@/lib/api/types";

export type Round = {
  number: number;
  name: string;
  /** For the phone tabs, where the full name doesn't fit. */
  shortName: string;
  matches: Match[];
};

// Named from the end: the last round is always the final.
const NAMES_FROM_FINAL = [
  "Final",
  "Semifinal",
  "Cuartos de final",
  "Octavos de final",
  "Dieciseisavos de final",
];

const SHORT_NAMES_FROM_FINAL = [
  "Final",
  "Semi",
  "Cuartos",
  "Octavos",
  "16avos",
];

export function roundName(roundNumber: number, totalRounds: number): string {
  return NAMES_FROM_FINAL[totalRounds - roundNumber] ?? `Ronda ${roundNumber}`;
}

export function shortRoundName(
  roundNumber: number,
  totalRounds: number,
): string {
  return SHORT_NAMES_FROM_FINAL[totalRounds - roundNumber] ?? `R${roundNumber}`;
}

/** The API returns every match of every round in one unordered list. */
export function groupRounds(matches: Match[]): Round[] {
  const byRound = Map.groupBy(matches, (match) => match.round_number);
  const roundNumbers = [...byRound.keys()].toSorted((a, b) => a - b);
  const totalRounds = roundNumbers.length;
  return roundNumbers.map((number) => ({
    number,
    name: roundName(number, totalRounds),
    shortName: shortRoundName(number, totalRounds),
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

/** Pending matches with both athletes known, in the order they are fought: round by round. */
export function matchesToScore(matches: Match[]): Match[] {
  return matches
    .filter(
      (match) =>
        match.status === "pending" &&
        match.athlete_red_id !== null &&
        match.athlete_blue_id !== null,
    )
    .toSorted((a, b) => a.round_number - b.round_number || a.slot - b.slot);
}

/** Matches still to be fought, counting those that wait for an earlier result. */
export function pendingMatchCount(matches: Match[]): number {
  return matches.filter((match) => match.status === "pending").length;
}

/** The round to open first: the earliest with a pending match, or the final when all are done. */
export function currentRoundIndex(rounds: Round[]): number {
  const index = rounds.findIndex((round) =>
    round.matches.some((match) => match.status === "pending"),
  );
  return index === -1 ? Math.max(rounds.length - 1, 0) : index;
}
