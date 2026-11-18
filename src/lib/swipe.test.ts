import { describe, expect, it } from "vitest";

import { swipeStep } from "./swipe";

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
