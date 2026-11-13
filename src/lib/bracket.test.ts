import { describe, expect, it } from "vitest";

import type { Match } from "@/lib/api/types";

import {
  bracketStats,
  champion,
  currentRoundIndex,
  groupRounds,
  matchesToScore,
  pendingMatchCount,
  roundName,
  roundsWon,
  shortRoundName,
} from "./bracket";

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

describe("matchesToScore", () => {
  it("keeps pending matches with both sides known, round by round", () => {
    const both = { athlete_red_id: 1, athlete_blue_id: 2 };
    const matches = [
      match(1, 2, 0, both),
      match(2, 1, 1, both),
      match(3, 1, 0, both),
      match(4, 1, 2, { ...both, status: "finished", winner_id: 1 }),
      match(5, 1, 3, { athlete_red_id: 1, status: "bye", winner_id: 1 }),
      match(6, 2, 1, { athlete_red_id: 1 }),
    ];
    expect(matchesToScore(matches).map((m) => m.id)).toEqual([3, 2, 1]);
  });
});

describe("pendingMatchCount", () => {
  it("counts pending matches, including those waiting for a result", () => {
    const matches = [
      match(1, 1, 0, { status: "finished" }),
      match(2, 1, 1, { status: "bye" }),
      match(3, 2, 0),
    ];
    expect(pendingMatchCount(matches)).toBe(1);
  });
});

describe("shortRoundName", () => {
  it("abbreviates counting back from the final", () => {
    expect(shortRoundName(4, 4)).toBe("Final");
    expect(shortRoundName(3, 4)).toBe("Semi");
    expect(shortRoundName(1, 5)).toBe("16avos");
  });

  it("falls back to a number when there are too many rounds", () => {
    expect(shortRoundName(1, 6)).toBe("R1");
  });
});

describe("currentRoundIndex", () => {
  it("opens the earliest round with a pending match", () => {
    const rounds = groupRounds([
      match(1, 1, 1, { status: "finished" }),
      match(2, 2, 1),
      match(3, 3, 1),
    ]);
    expect(currentRoundIndex(rounds)).toBe(1);
  });

  it("opens the final when everything is finished", () => {
    const rounds = groupRounds([
      match(1, 1, 1, { status: "bye" }),
      match(2, 2, 1, { status: "finished" }),
    ]);
    expect(currentRoundIndex(rounds)).toBe(1);
  });

  it("doesn't fail without rounds", () => {
    expect(currentRoundIndex([])).toBe(0);
  });
});

describe("bracketStats", () => {
  it("doesn't count byes as matches, and counts each athlete once", () => {
    expect(
      bracketStats([
        match(1, 1, 1, { athlete_red_id: 1, athlete_blue_id: 2 }),
        match(2, 1, 2, {
          athlete_red_id: 3,
          athlete_blue_id: null,
          status: "bye",
        }),
        match(3, 2, 1, { athlete_red_id: 1, athlete_blue_id: 3 }),
      ]),
    ).toEqual({ matches: 2, athletes: 3 });
  });

  it("is zero without matches", () => {
    expect(bracketStats([])).toEqual({ matches: 0, athletes: 0 });
  });
});

describe("champion", () => {
  const semis = [
    match(1, 1, 0, { status: "finished", winner_id: 10 }),
    match(2, 1, 1, { status: "finished", winner_id: 20 }),
  ];

  it("is the winner of the final", () => {
    const final = match(3, 2, 0, {
      athlete_red_id: 10,
      athlete_red_name: "Ana",
      athlete_blue_id: 20,
      athlete_blue_name: "Bea",
      status: "finished",
      winner_id: 20,
      winner_name: "Bea",
    });
    expect(champion([final, ...semis])).toEqual({ id: 20, name: "Bea" });
  });

  it("takes the name from the winning side when the API doesn't send it", () => {
    const final = match(3, 2, 0, {
      athlete_red_id: 10,
      athlete_red_name: "Ana",
      athlete_blue_id: 20,
      athlete_blue_name: "Bea",
      status: "finished",
      winner_id: 10,
    });
    expect(champion([...semis, final])).toEqual({ id: 10, name: "Ana" });
  });

  it("is null while the final hasn't been fought", () => {
    expect(champion([...semis, match(3, 2, 0)])).toBeNull();
    expect(champion([])).toBeNull();
  });
});
