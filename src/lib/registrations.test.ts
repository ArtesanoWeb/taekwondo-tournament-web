import { describe, expect, it } from "vitest";

import type { Registration } from "@/lib/api/types";

import {
  canWithdraw,
  countAthletesByTournament,
  sortByAthleteName,
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
