import { describe, expect, it } from "vitest";

import { isIsoDate, parseTournamentForm } from "./tournament-form";

describe("isIsoDate", () => {
  it("accepts real calendar days", () => {
    expect(isIsoDate("2026-11-15")).toBe(true);
    expect(isIsoDate("2028-02-29")).toBe(true);
  });

  it("rejects other formats and days that don't exist", () => {
    expect(isIsoDate("15/11/2026")).toBe(false);
    expect(isIsoDate("2026-2-5")).toBe(false);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2027-02-29")).toBe(false);
    expect(isIsoDate("")).toBe(false);
  });
});

describe("parseTournamentForm", () => {
  it("returns the trimmed values when everything is filled in", () => {
    expect(
      parseTournamentForm("  Copa Cochabamba ", "2026-11-15", " Cochabamba "),
    ).toEqual({
      ok: true,
      values: {
        name: "Copa Cochabamba",
        date: "2026-11-15",
        location: "Cochabamba",
      },
    });
  });

  it("names every missing field, treating blanks as missing", () => {
    expect(parseTournamentForm("   ", "", null)).toEqual({
      ok: false,
      error: "Falta el nombre, la fecha y el lugar.",
    });
    expect(parseTournamentForm("Copa", "2026-11-15", "")).toEqual({
      ok: false,
      error: "Falta el lugar.",
    });
    expect(parseTournamentForm("", "2026-11-15", "")).toEqual({
      ok: false,
      error: "Falta el nombre y el lugar.",
    });
  });

  it("rejects an invalid date", () => {
    expect(parseTournamentForm("Copa", "2026-02-30", "Cochabamba")).toEqual({
      ok: false,
      error: "La fecha no es válida.",
    });
  });
});
