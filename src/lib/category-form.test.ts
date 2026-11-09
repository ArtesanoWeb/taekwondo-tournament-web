import { describe, expect, it } from "vitest";

import { type CategoryFormValues, parseCategoryForm } from "./category-form";

const valid: CategoryFormValues = {
  gender: "male",
  ageLabel: " Cadete ",
  minAge: "12",
  maxAge: "14",
  beltGroup: "color",
  weightLabel: " Hasta 45kg ",
  minWeight: "",
  maxWeight: "45,5",
  roundsToWin: "2",
};

const parse = (changes: Partial<CategoryFormValues>) =>
  parseCategoryForm({ ...valid, ...changes });

describe("parseCategoryForm", () => {
  it("normalizes valid values for the API", () => {
    expect(parse({})).toEqual({
      ok: true,
      fields: {
        gender: "male",
        age_label: "Cadete",
        min_age: 12,
        max_age: 14,
        belt_group: "color",
        weight_label: "Hasta 45kg",
        min_weight: null,
        max_weight: 45.5,
        rounds_to_win: 2,
      },
    });
  });

  it("allows open ranges: no maximum age and no weight limits", () => {
    expect(parse({ maxAge: "", maxWeight: "" })).toMatchObject({
      ok: true,
      fields: { max_age: null, min_weight: null, max_weight: null },
    });
  });

  it("names every missing field", () => {
    expect(parse({ gender: "", ageLabel: " ", roundsToWin: "" })).toEqual({
      ok: false,
      error: "Falta el género, el nombre de la edad y los rounds para ganar.",
    });
  });

  it("rejects a minimum greater than the maximum", () => {
    expect(parse({ minAge: "15" })).toEqual({
      ok: false,
      error: "La edad mínima no puede ser mayor que la máxima.",
    });
    expect(parse({ minWeight: "50" })).toEqual({
      ok: false,
      error: "El peso mínimo no puede ser mayor que el máximo.",
    });
  });

  it("accepts equal minimum and maximum", () => {
    expect(parse({ minAge: "14" }).ok).toBe(true);
    expect(parse({ minWeight: "45.5" }).ok).toBe(true);
  });

  it.each(["abc", "-1", "12.5", "121"])("rejects the age %s", (minAge) => {
    expect(parse({ minAge })).toMatchObject({ ok: false });
  });

  it.each(["abc", "0", "-5", "251"])("rejects the weight %s", (maxWeight) => {
    expect(parse({ maxWeight })).toMatchObject({ ok: false });
  });

  it.each(["0", "6", "1.5", "x"])("rejects %s rounds to win", (roundsToWin) => {
    expect(parse({ roundsToWin })).toMatchObject({ ok: false });
  });

  it("rejects an unknown gender or belt group", () => {
    expect(parse({ gender: "x" })).toMatchObject({ ok: false });
    expect(parse({ beltGroup: "x" })).toMatchObject({ ok: false });
  });
});
