import { describe, expect, it } from "vitest";

import { gradeBelts } from "./belts";
import { gradeLabels } from "./labels";

describe("gradeBelts", () => {
  it("goes from white to black, with the ends the backend describes", () => {
    expect(gradeBelts.kup_10).toEqual({ color: "white" });
    expect(gradeBelts.kup_1).toEqual({ color: "red", half: "black" });
    expect(gradeBelts.dan).toEqual({ color: "black" });
  });

  it("gives the grades in between the next solid color as their lower half", () => {
    const grades = Object.keys(gradeLabels) as (keyof typeof gradeBelts)[];
    grades.forEach((grade, index) => {
      const { half } = gradeBelts[grade];
      if (half) expect(gradeBelts[grades[index + 1]].color).toBe(half);
    });
  });
});
