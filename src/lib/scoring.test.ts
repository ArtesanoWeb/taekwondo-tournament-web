import { describe, expect, it } from "vitest";

import { parseRoundPoints } from "./scoring";

describe("parseRoundPoints", () => {
  it("accepts whole points from 0 to 99", () => {
    expect(parseRoundPoints("12", "5")).toEqual({
      ok: true,
      points: { red: 12, blue: 5 },
    });
    expect(parseRoundPoints(" 0 ", "99")).toEqual({
      ok: true,
      points: { red: 0, blue: 99 },
    });
  });

  it("rejects empty, negative, decimal and too large values", () => {
    for (const [red, blue] of [
      ["", "3"],
      ["-1", "3"],
      ["2.5", "3"],
      ["100", "3"],
      ["abc", "3"],
      [null, "3"],
    ]) {
      expect(parseRoundPoints(red, blue).ok).toBe(false);
    }
  });

  it("rejects a tie", () => {
    expect(parseRoundPoints("7", "7")).toEqual({
      ok: false,
      error: "Un round no puede terminar en empate.",
    });
  });
});
