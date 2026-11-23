import { describe, expect, it } from "vitest";

import type { Match } from "@/lib/api/types";

import { categoryAwards, rankClubs } from "./ranking";

const match = (overrides: Partial<Match>): Match => ({
  id: 0,
  round_number: 1,
  slot: 0,
  athlete_red_id: null,
  athlete_red_name: null,
  athlete_blue_id: null,
  athlete_blue_name: null,
  winner_id: null,
  winner_name: null,
  next_match_id: null,
  status: "finished",
  round_scores: [],
  ...overrides,
});

// A bracket of four: 1 beats 2 and 3 beats 4 in the semifinals, 1 beats 3 in the final.
const fourAthletes = [
  match({ id: 1, athlete_red_id: 1, athlete_blue_id: 2, winner_id: 1 }),
  match({
    id: 2,
    slot: 1,
    athlete_red_id: 3,
    athlete_blue_id: 4,
    winner_id: 3,
  }),
  match({
    id: 3,
    round_number: 2,
    athlete_red_id: 1,
    athlete_blue_id: 3,
    winner_id: 1,
  }),
];
const clubs = { 1: "Halcones", 2: "Dojang", 3: "Tigres", 4: "Halcones" };

describe("categoryAwards", () => {
  it("gives gold, silver and the single bronze to the athletes' clubs", () => {
    expect(categoryAwards(fourAthletes, clubs)).toEqual([
      { club: "Halcones", award: "gold" },
      { club: "Tigres", award: "silver" },
      { club: "Dojang", award: "bronze" },
    ]);
  });

  it("gives nothing while the final is still on", () => {
    const unfinished = fourAthletes.map((m) =>
      m.round_number === 2
        ? { ...m, status: "pending" as const, winner_id: null }
        : m,
    );
    expect(categoryAwards(unfinished, clubs)).toEqual([]);
  });
});

describe("rankClubs", () => {
  it("adds 7, 3, 1 and 1 per category without a fight, and breaks ties by medals", () => {
    expect(
      rankClubs([
        { club: "Tigres", award: "silver" },
        { club: "Tigres", award: "silver" },
        { club: "Tigres", award: "walkover" },
        { club: "Halcones", award: "gold" },
        { club: "Dojang", award: "bronze" },
        { club: "Andes", award: "walkover" },
      ]).map(({ club, points }) => [club, points]),
    ).toEqual([
      ["Halcones", 7],
      ["Tigres", 7],
      // Same points: the bronze beats a category without a fight.
      ["Dojang", 1],
      ["Andes", 1],
    ]);
  });
});
