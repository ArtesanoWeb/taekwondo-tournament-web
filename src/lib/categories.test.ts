import { describe, expect, it } from "vitest";

import type { Category } from "@/lib/api/types";

import { formatAgeRange, groupByGender } from "./categories";

const category = (id: number, overrides: Partial<Category> = {}): Category => ({
  id,
  tournament_id: 1,
  discipline: "sparring",
  gender: "male",
  age_label: "Cadete",
  min_age: 12,
  max_age: 14,
  belt_group: "color",
  weight_label: "Hasta 45kg",
  min_weight: null,
  max_weight: 45,
  rounds_to_win: 2,
  ...overrides,
});

describe("formatAgeRange", () => {
  it("formats a closed range", () => {
    expect(formatAgeRange(12, 14)).toBe("12 a 14 años");
  });

  it("formats a single age", () => {
    expect(formatAgeRange(9, 9)).toBe("9 años");
  });

  it("formats an open range", () => {
    expect(formatAgeRange(18, null)).toBe("18 años o más");
  });
});

describe("groupByGender", () => {
  it("puts female first and leaves out empty groups", () => {
    const groups = groupByGender([
      category(1, { gender: "male" }),
      category(2, { gender: "female" }),
    ]);
    expect(groups.map((group) => group.gender)).toEqual(["female", "male"]);
    expect(groupByGender([category(1)]).map((g) => g.gender)).toEqual(["male"]);
  });

  it("sorts by age and then by weight, open weight last", () => {
    const [male] = groupByGender([
      category(1, { min_age: 15, max_weight: 55 }),
      category(2, { min_age: 12, max_weight: null }),
      category(3, { min_age: 12, max_weight: 45 }),
    ]);
    expect(male.categories.map((c) => c.id)).toEqual([3, 2, 1]);
  });
});
