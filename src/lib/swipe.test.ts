import { describe, expect, it } from "vitest";

import { sectionIndex, swipeStep } from "./swipe";

describe("swipeStep", () => {
  it("goes to the next item when the finger moves left, and back when it moves right", () => {
    expect(swipeStep(-80, 10)).toBe(1);
    expect(swipeStep(80, -10)).toBe(-1);
  });

  it("ignores short or mostly vertical gestures", () => {
    expect(swipeStep(-40, 0)).toBe(0);
    expect(swipeStep(-80, 70)).toBe(0);
    expect(swipeStep(0, 200)).toBe(0);
  });
});

describe("sectionIndex", () => {
  it("follows the bottom bar's order", () => {
    expect(sectionIndex("/admin/atletas")).toBe(0);
    expect(sectionIndex("/admin/torneos")).toBe(2);
    expect(sectionIndex("/admin/mas")).toBe(4);
  });

  it("is -1 off a section's own screen", () => {
    expect(sectionIndex("/admin/torneos/5")).toBe(-1);
    expect(sectionIndex("/admin/torneos/nuevo")).toBe(-1);
    expect(sectionIndex("/admin/categorias/3")).toBe(-1);
  });
});
