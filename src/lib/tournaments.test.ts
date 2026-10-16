import { describe, expect, it } from "vitest";

import type { Tournament } from "@/lib/api/types";

import { sortByMostRecent } from "./tournaments";

const tournament = (id: number, date: string): Tournament => ({
  id,
  date,
  name: `Torneo ${id}`,
  location: "Cochabamba",
  status: "draft",
});

describe("sortByMostRecent", () => {
  it("puts the most recent tournament first without mutating the input", () => {
    const input = [
      tournament(1, "2026-03-01"),
      tournament(2, "2026-11-15"),
      tournament(3, "2025-12-31"),
    ];
    expect(sortByMostRecent(input).map((t) => t.id)).toEqual([2, 1, 3]);
    expect(input.map((t) => t.id)).toEqual([1, 2, 3]);
  });
});
