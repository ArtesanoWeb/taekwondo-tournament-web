import { describe, expect, it } from "vitest";

import { hidesBottomNavOnPhone, hidesHeaderOnPhone } from "./phone-screens";

describe("phone screens", () => {
  it("hides the header on full-screen forms and detail pages", () => {
    expect(hidesHeaderOnPhone("/admin/torneos/nuevo")).toBe(true);
    expect(hidesHeaderOnPhone("/admin/torneos/4")).toBe(true);
    expect(hidesHeaderOnPhone("/admin/categorias/10")).toBe(true);
    expect(hidesHeaderOnPhone("/torneos/4")).toBe(true);
    expect(hidesHeaderOnPhone("/categorias/10")).toBe(true);
  });

  it("keeps the header on lists", () => {
    expect(hidesHeaderOnPhone("/admin/torneos")).toBe(false);
    expect(hidesHeaderOnPhone("/admin/atletas")).toBe(false);
    expect(hidesHeaderOnPhone("/")).toBe(false);
    expect(hidesHeaderOnPhone("/admin/torneos/4/algo")).toBe(false);
  });

  it("hides the bottom bar only on full-screen forms", () => {
    expect(hidesBottomNavOnPhone("/admin/torneos/nuevo")).toBe(true);
    expect(hidesBottomNavOnPhone("/admin/torneos/4")).toBe(false);
    expect(hidesBottomNavOnPhone("/admin/categorias/10")).toBe(false);
  });
});
