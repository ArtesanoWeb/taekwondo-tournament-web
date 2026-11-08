import { describe, expect, it } from "vitest";

import type { Registration } from "@/lib/api/types";

import { canWithdraw, sortByAthleteName } from "./registrations";

const registration = (id: number, name: string) =>
  ({ id, athlete: { name } }) as Registration;

describe("sortByAthleteName", () => {
  it("sorts alphabetically ignoring accents and case, without mutating the input", () => {
    const input = [
      registration(1, "Zoe Rojas"),
      registration(2, "álvaro Pérez"),
      registration(3, "Ana Mamani"),
      registration(4, "Ñusta Quispe"),
      registration(5, "Nina Flores"),
    ];
    expect(sortByAthleteName(input).map((r) => r.id)).toEqual([2, 3, 5, 4, 1]);
    expect(input[0].id).toBe(1);
  });
});

describe("canWithdraw", () => {
  it("only allows withdrawing while enrollment is open", () => {
    expect(canWithdraw("draft")).toBe(true);
    expect(canWithdraw("in_progress")).toBe(false);
    expect(canWithdraw("finished")).toBe(false);
  });
});
