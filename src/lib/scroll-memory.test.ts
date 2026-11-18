import { afterEach, describe, expect, it, vi } from "vitest";

import { recall, remember } from "./scroll-memory";

function fakeStorage() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("scroll memory", () => {
  it("gives back what was remembered, rounded, per key", () => {
    vi.stubGlobal("sessionStorage", fakeStorage());
    remember("llave:3", 412.6);
    remember("pestañas:inicio", 2);
    expect(recall("llave:3")).toBe(413);
    expect(recall("pestañas:inicio")).toBe(2);
    expect(recall("llave:4")).toBeNull();
  });

  it("ignores a stored value that isn't a number", () => {
    const storage = fakeStorage();
    storage.setItem("scroll:llave:3", "abc");
    vi.stubGlobal("sessionStorage", storage);
    expect(recall("llave:3")).toBeNull();
  });

  it("works without storage (private mode, blocked)", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(() => remember("llave:3", 10)).not.toThrow();
    expect(recall("llave:3")).toBeNull();
  });
});
