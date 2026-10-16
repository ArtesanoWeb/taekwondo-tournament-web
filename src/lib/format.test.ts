import { describe, expect, it } from "vitest";

import { formatDate, formatDateTime, formatShortDate } from "./format";

describe("formatDate", () => {
  it("keeps the same calendar day regardless of the machine's timezone", () => {
    expect(formatDate("2026-11-15")).toBe("15 de noviembre de 2026");
  });

  it("formats the short version as dd/mm/aaaa", () => {
    expect(formatShortDate("2026-01-05")).toBe("05/01/2026");
  });
});

describe("formatDateTime", () => {
  it("treats datetimes without timezone as UTC and shows them in Bolivian time", () => {
    expect(formatDateTime("2026-10-04T22:18:11.963610")).toBe(
      "4 de octubre de 2026 a las 6:18 p. m.",
    );
  });

  it("respects an explicit timezone", () => {
    expect(formatDateTime("2026-10-04T22:18:11Z")).toBe(
      "4 de octubre de 2026 a las 6:18 p. m.",
    );
  });
});
