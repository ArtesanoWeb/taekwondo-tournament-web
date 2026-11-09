import { describe, expect, it } from "vitest";

import type { Tournament, TournamentStatus } from "@/lib/api/types";

import {
  groupAdminTournaments,
  groupPublicTournaments,
  isPublic,
  sortByMostRecent,
} from "./tournaments";

const tournament = (
  id: number,
  date: string,
  status: TournamentStatus = "draft",
): Tournament => ({
  id,
  date,
  name: `Torneo ${id}`,
  location: "Cochabamba",
  status,
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

describe("isPublic", () => {
  it("hides only drafts", () => {
    expect(isPublic("draft")).toBe(false);
    expect(isPublic("in_progress")).toBe(true);
    expect(isPublic("finished")).toBe(true);
  });
});

describe("groupPublicTournaments", () => {
  it("splits by status, newest first in each group, and leaves drafts out", () => {
    const groups = groupPublicTournaments([
      tournament(1, "2026-01-10", "finished"),
      tournament(2, "2026-11-20", "draft"),
      tournament(3, "2026-10-05", "in_progress"),
      tournament(4, "2026-06-01", "finished"),
      tournament(5, "2026-11-01", "in_progress"),
    ]);
    expect(groups.inProgress.map((t) => t.id)).toEqual([5, 3]);
    expect(groups.finished.map((t) => t.id)).toEqual([4, 1]);
  });

  it("returns empty groups when there is nothing public", () => {
    expect(groupPublicTournaments([tournament(1, "2026-11-20")])).toEqual({
      inProgress: [],
      finished: [],
    });
  });
});

describe("groupAdminTournaments", () => {
  it("splits every status, each group from the most recent to the oldest", () => {
    const groups = groupAdminTournaments([
      tournament(1, "2026-01-01", "draft"),
      tournament(2, "2026-02-01", "in_progress"),
      tournament(3, "2026-03-01", "draft"),
      tournament(4, "2026-04-01", "finished"),
    ]);
    expect(groups.inProgress.map((t) => t.id)).toEqual([2]);
    expect(groups.open.map((t) => t.id)).toEqual([3, 1]);
    expect(groups.finished.map((t) => t.id)).toEqual([4]);
  });
});
