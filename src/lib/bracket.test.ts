import { describe, expect, it } from "vitest";

import type { Match } from "@/lib/api/types";

import { groupRounds, roundName, roundsWon } from "./bracket";

const match = (
  id: number,
  round_number: number,
  slot: number,
  overrides: Partial<Match> = {},
): Match => ({
  id,
  round_number,
  slot,
  athlete_red_id: null,
  athlete_red_name: null,
  athlete_blue_id: null,
  athlete_blue_name: null,
  winner_id: null,
  winner_name: null,
  next_match_id: null,
  status: "pending",
  round_scores: [],
  ...overrides,
});

describe("roundName", () => {
  it("names rounds counting back from the final", () => {
    expect(roundName(4, 4)).toBe("Final");
    expect(roundName(3, 4)).toBe("Semifinal");
    expect(roundName(2, 4)).toBe("Cuartos de final");
    expect(roundName(1, 4)).toBe("Octavos de final");
  });

  it("falls back to a number for very large brackets", () => {
    expect(roundName(1, 7)).toBe("Ronda 1");
  });
});

describe("groupRounds", () => {
  it("groups an unordered list by round and sorts each round by slot", () => {
    const rounds = groupRounds([
      match(7, 3, 0),
      match(2, 1, 1),
      match(5, 2, 0),
      match(1, 1, 0),
      match(4, 1, 3),
      match(6, 2, 1),
      match(3, 1, 2),
    ]);
    expect(rounds.map((round) => round.name)).toEqual([
      "Cuartos de final",
      "Semifinal",
      "Final",
    ]);
    expect(rounds.map((round) => round.matches.map((m) => m.id))).toEqual([
      [1, 2, 3, 4],
      [5, 6],
      [7],
    ]);
  });

  it("treats a single match as the final", () => {
    expect(groupRounds([match(1, 1, 0)])[0].name).toBe("Final");
  });
});

describe("roundsWon", () => {
  it("counts the rounds each side won", () => {
    const scores = [10, 10, 20].map((round_winner_id, index) => ({
      id: index,
      match_id: 1,
      round_number: index + 1,
      red_points: 0,
      blue_points: 0,
      round_winner_id,
    }));
    expect(
      roundsWon(
        match(1, 1, 0, {
          athlete_red_id: 10,
          athlete_blue_id: 20,
          round_scores: scores,
        }),
      ),
    ).toEqual({ red: 2, blue: 1 });
  });
});
