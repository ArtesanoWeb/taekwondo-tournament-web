import { describe, expect, it } from "vitest";

import type { Athlete, Registration } from "@/lib/api/types";

import {
  type AthleteOption,
  canWithdraw,
  countAthletesByTournament,
  filterAthleteOptions,
  sortByAthleteName,
  toAthleteOptions,
} from "./registrations";

const registration = (id: number, name: string) =>
  ({ id, athlete: { name } }) as Registration;

describe("sortByAthleteName", () => {
  it("sorts alphabetically ignoring accents and case, without mutating the input", () => {
    const input = [
      registration(1, "Zoe Rojas"),
      registration(2, "álvaro Pérez"),
      registration(3, "Ana Mamani"),
      registration(4, "Ñusta Quispe"),
      registration(5, "Nina Flores"),
    ];
    expect(sortByAthleteName(input).map((r) => r.id)).toEqual([2, 3, 5, 4, 1]);
    expect(input[0].id).toBe(1);
  });
});

describe("canWithdraw", () => {
  it("only allows withdrawing while enrollment is open", () => {
    expect(canWithdraw("draft")).toBe(true);
    expect(canWithdraw("in_progress")).toBe(false);
    expect(canWithdraw("finished")).toBe(false);
  });
});

describe("countAthletesByTournament", () => {
  it("adds up the registrations of every category of each tournament", () => {
    const inTournament = (tournament_id: number) =>
      ({ category: { tournament_id } }) as Registration;
    const counts = countAthletesByTournament([
      inTournament(1),
      inTournament(2),
      inTournament(1),
    ]);
    expect(counts.get(1)).toBe(2);
    expect(counts.get(2)).toBe(1);
    expect(counts.get(3)).toBeUndefined();
  });
});

describe("toAthleteOptions", () => {
  it("leaves out the athletes already registered", () => {
    const athlete = (id: number) =>
      ({
        id,
        name: `A${id}`,
        ci: null,
        weight_kg: 40,
        club: { id: 1, name: "Club" },
      }) as Athlete;
    const options = toAthleteOptions(
      [athlete(1), athlete(2)],
      [{ athlete_id: 2 } as Registration],
    );
    expect(options).toEqual([
      { id: 1, name: "A1", ci: null, club: "Club", weightKg: 40 },
    ]);
  });
});

describe("filterAthleteOptions", () => {
  const option = (id: number, name: string, ci: string | null) =>
    ({ id, name, ci, club: "C", weightKg: 40 }) as AthleteOption;
  const options = [
    option(1, "Zoé Pérez", "1234567"),
    option(2, "Ana Quispe", null),
  ];

  it("returns everyone with a blank search", () => {
    expect(filterAthleteOptions(options, "  ")).toHaveLength(2);
  });

  it("finds by name ignoring accents and case", () => {
    expect(filterAthleteOptions(options, "ZOE per").map((o) => o.id)).toEqual([
      1,
    ]);
  });

  it("finds by CI", () => {
    expect(filterAthleteOptions(options, "2345").map((o) => o.id)).toEqual([1]);
  });

  it("returns nothing without a match", () => {
    expect(filterAthleteOptions(options, "xyz")).toEqual([]);
  });
});
