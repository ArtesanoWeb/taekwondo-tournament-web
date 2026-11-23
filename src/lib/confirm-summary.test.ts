import { describe, expect, it } from "vitest";

import {
  athleteSummary,
  categorySummary,
  clubSummary,
  registrationSummary,
  tournamentSummary,
} from "./confirm-summary";

const clubs = [
  { id: 1, name: "Club Halcones" },
  { id: 2, name: "Dojang Central" },
];

const athlete = {
  name: "Abril Calle",
  ci: "",
  birthDate: "2011-02-10",
  gender: "female",
  grade: "kup_7",
  weight: "53",
  clubId: "1",
};

describe("tournamentSummary", () => {
  it("shows the date written out and a dash for what's missing", () => {
    expect(
      tournamentSummary({ name: " Copa ", date: "2027-02-14", location: "" }),
    ).toEqual([
      { label: "Nombre", value: "Copa" },
      { label: "Fecha", value: "14 de febrero de 2027" },
      { label: "Lugar", value: "—" },
    ]);
  });
});

describe("athleteSummary", () => {
  it("translates every field and draws the belt of the grade", () => {
    const rows = athleteSummary(athlete, clubs);
    expect(rows.map((row) => row.value)).toEqual([
      "Abril Calle",
      "Sin CI",
      "10 de febrero de 2011",
      "Femenino",
      "7.º Kup",
      "53 kg",
      "Club Halcones",
    ]);
    expect(rows.find((row) => row.label === "Grado")?.grade).toBe("kup_7");
  });

  it("when editing, only the rows that changed carry the old value", () => {
    const rows = athleteSummary(
      { ...athlete, weight: "55", clubId: "2" },
      clubs,
      athlete,
    );
    expect(rows.filter((row) => row.previous)).toEqual([
      { label: "Peso", value: "55 kg", previous: "53 kg" },
      { label: "Club", value: "Dojang Central", previous: "Club Halcones" },
    ]);
  });
});

describe("clubSummary", () => {
  it("shows the old name only when it changes", () => {
    expect(clubSummary("Halcones", "Club Halcones")).toEqual([
      { label: "Nombre", value: "Halcones", previous: "Club Halcones" },
    ]);
    expect(clubSummary("Halcones", "Halcones")).toEqual([
      { label: "Nombre", value: "Halcones" },
    ]);
  });
});

describe("categorySummary", () => {
  it("joins the names with their ranges", () => {
    expect(
      categorySummary({
        gender: "male",
        ageLabel: "Cadete",
        minAge: "12",
        maxAge: "14",
        beltGroup: "color",
        weightLabel: "Hasta 45kg",
        minWeight: "",
        maxWeight: "45",
        roundsToWin: "2",
      }).map((row) => row.value),
    ).toEqual([
      "Masculino",
      "Cadete · 12 a 14 años",
      "Cinturón de color",
      "Hasta 45kg · hasta 45 kg",
      "2",
    ]);
  });
});

describe("registrationSummary", () => {
  it("shows who is registered and where", () => {
    expect(
      registrationSummary(
        {
          id: 3,
          name: "Abril Calle",
          ci: null,
          club: "Club Halcones",
          weightKg: 34,
        },
        "Infantil · Hasta 35kg",
      ).map((row) => row.value),
    ).toEqual([
      "Abril Calle",
      "Sin CI",
      "Club Halcones",
      "34 kg",
      "Infantil · Hasta 35kg",
    ]);
  });
});
