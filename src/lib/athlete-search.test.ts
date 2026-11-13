import { describe, expect, it } from "vitest";

import type { Athlete } from "@/lib/api/types";

import {
  compareNames,
  filterAthletes,
  letterOf,
  matchesQuery,
  NO_FILTERS,
  normalize,
  suggestions,
} from "./athlete-search";

const athlete = (id: number, name: string, overrides: Partial<Athlete> = {}) =>
  ({
    id,
    name,
    ci: null,
    birth_date: "2012-01-01",
    gender: "male",
    belt_rank: "azul",
    weight_kg: 40,
    club_id: 1,
    club: { id: 1, name: "Dojang Central" },
    ...overrides,
  }) as Athlete;

const athletes = [
  athlete(1, "Andrés Pérez", { ci: "1234567" }),
  athlete(2, "Beatriz Peralta", { gender: "female", club_id: 2 }),
  athlete(3, "Óscar Ñandú"),
  athlete(4, "Lucía Nina", { gender: "female" }),
];

describe("normalize", () => {
  it("ignores case and accents", () => {
    expect(normalize("  Pérez ")).toBe("perez");
  });
});

describe("matchesQuery", () => {
  it("finds by name without accents and by CI", () => {
    expect(matchesQuery(athletes[0], "perez")).toBe(true);
    expect(matchesQuery(athletes[0], "4567")).toBe(true);
    expect(matchesQuery(athletes[1], "perez")).toBe(false);
  });
});

describe("filterAthletes", () => {
  it("combines the search with club and gender", () => {
    expect(
      filterAthletes(athletes, { ...NO_FILTERS, gender: "female" }).map(
        (a) => a.id,
      ),
    ).toEqual([2, 4]);
    expect(
      filterAthletes(athletes, { query: "per", clubId: 2, gender: null }).map(
        (a) => a.id,
      ),
    ).toEqual([2]);
    expect(filterAthletes(athletes, NO_FILTERS)).toHaveLength(4);
  });
});

describe("suggestions", () => {
  it("puts names that start with the text first, up to the limit", () => {
    expect(suggestions(athletes, "pe").map((a) => a.id)).toEqual([1, 2]);
    expect(suggestions(athletes, "a", 2)).toHaveLength(2);
    expect(suggestions(athletes, "   ")).toEqual([]);
  });
});

describe("letterOf and compareNames", () => {
  it("indexes Ñ on its own and accented letters under the plain one", () => {
    expect(letterOf("Ñandú")).toBe("Ñ");
    expect(letterOf("Óscar")).toBe("O");
    expect(letterOf("123")).toBe("#");
  });

  it("sorts Ñ after N", () => {
    const sorted = ["Ñu", "Oso", "Nina"].toSorted(compareNames);
    expect(sorted).toEqual(["Nina", "Ñu", "Oso"]);
  });
});
