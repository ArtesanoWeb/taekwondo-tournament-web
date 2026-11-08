import { describe, expect, it } from "vitest";

import type { Athlete } from "@/lib/api/types";

import {
  athleteToFormValues,
  type AthleteFormValues,
  isWithdrawalWarning,
  parseAthleteForm,
} from "./athlete-form";

const TODAY = "2026-11-08";

const valid: AthleteFormValues = {
  name: " Mateo Quispe ",
  ci: " 1234567-1a ",
  birthDate: "2012-03-14",
  gender: "male",
  beltRank: " verde ",
  weight: "38,5",
  clubId: "2",
};

const parse = (changes: Partial<AthleteFormValues>) =>
  parseAthleteForm({ ...valid, ...changes }, TODAY);

describe("parseAthleteForm", () => {
  it("normalizes valid values into the API payload", () => {
    expect(parse({})).toEqual({
      ok: true,
      payload: {
        name: "Mateo Quispe",
        ci: "1234567-1A",
        birth_date: "2012-03-14",
        gender: "male",
        belt_rank: "verde",
        weight_kg: 38.5,
        club_id: 2,
      },
    });
  });

  it("sends a null CI when it's left blank", () => {
    expect(parse({ ci: "  " })).toMatchObject({
      ok: true,
      payload: { ci: null },
    });
  });

  it("names every missing field", () => {
    expect(parse({ name: "", weight: "  ", clubId: "" })).toEqual({
      ok: false,
      error: "Falta el nombre, el peso y el club.",
    });
  });

  it.each(["1234", "1234567890", "1234567-1", "abcdefg"])(
    "rejects the CI %s",
    (ci) => {
      expect(parse({ ci })).toMatchObject({ ok: false });
    },
  );

  it.each(["2026-11-09", "2012-02-30", "14/03/2012"])(
    "rejects the birth date %s",
    (birthDate) => {
      expect(parse({ birthDate })).toEqual({
        ok: false,
        error: "La fecha de nacimiento no es válida.",
      });
    },
  );

  it("accepts a birth date of today", () => {
    expect(parse({ birthDate: TODAY }).ok).toBe(true);
  });

  it.each(["0", "-5", "251", "abc", "1.2.3"])(
    "rejects the weight %s",
    (weight) => {
      expect(parse({ weight })).toMatchObject({ ok: false });
    },
  );

  it("rejects an unknown gender and a non-numeric club", () => {
    expect(parse({ gender: "x" })).toMatchObject({ ok: false });
    expect(parse({ clubId: "abc" })).toMatchObject({ ok: false });
  });
});

describe("athleteToFormValues", () => {
  it("turns an athlete into form strings, with an empty CI when it has none", () => {
    const athlete = {
      name: "Ana",
      ci: null,
      birth_date: "2012-01-01",
      gender: "female",
      belt_rank: "azul",
      weight_kg: 40.5,
      club_id: 3,
    } as Athlete;
    expect(athleteToFormValues(athlete)).toEqual({
      name: "Ana",
      ci: "",
      birthDate: "2012-01-01",
      gender: "female",
      beltRank: "azul",
      weight: "40.5",
      clubId: "3",
    });
  });
});

describe("isWithdrawalWarning", () => {
  it("only recognizes the 409 that asks to confirm the withdrawal", () => {
    expect(
      isWithdrawalWarning(
        "Este cambio retira al atleta de: Cadete 45kg (Copa). Hay que confirmar el retiro para continuar",
      ),
    ).toBe(true);
    expect(isWithdrawalWarning("Ya existe un atleta con ese CI")).toBe(false);
  });
});
