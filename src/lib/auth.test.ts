import { describe, expect, it } from "vitest";

import {
  isTokenExpired,
  loginUrl,
  readTokenClaims,
  safeNextPath,
} from "./auth";

const base64url = (value: object) =>
  btoa(JSON.stringify(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const token = (claims: object) =>
  `${base64url({ alg: "HS256" })}.${base64url(claims)}.firma`;

const now = Date.UTC(2026, 10, 2, 12, 0, 0);
const inSeconds = (seconds: number) => Math.floor(now / 1000) + seconds;

describe("readTokenClaims", () => {
  it("reads the subject and expiry of a JWT", () => {
    expect(readTokenClaims(token({ sub: "admin", exp: 123 }))).toEqual({
      sub: "admin",
      exp: 123,
    });
  });

  it("returns undefined for anything that isn't a JWT", () => {
    expect(readTokenClaims("")).toBeUndefined();
    expect(readTokenClaims("abc")).toBeUndefined();
    expect(readTokenClaims("abc.%%%.def")).toBeUndefined();
  });
});

describe("isTokenExpired", () => {
  it("is false before exp and true from exp on", () => {
    expect(isTokenExpired(token({ exp: inSeconds(60) }), now)).toBe(false);
    expect(isTokenExpired(token({ exp: inSeconds(0) }), now)).toBe(true);
    expect(isTokenExpired(token({ exp: inSeconds(-60) }), now)).toBe(true);
  });

  it("treats a token without a readable exp as expired", () => {
    expect(isTokenExpired(token({ sub: "admin" }), now)).toBe(true);
    expect(isTokenExpired("no-es-un-token", now)).toBe(true);
  });
});

describe("safeNextPath", () => {
  it("keeps admin pages, including their query string", () => {
    expect(safeNextPath("/admin")).toBe("/admin");
    expect(safeNextPath("/admin/torneos/3")).toBe("/admin/torneos/3");
    expect(safeNextPath("/admin?pestana=2")).toBe("/admin?pestana=2");
  });

  it("falls back to /admin for anything else", () => {
    for (const value of [
      undefined,
      null,
      "",
      "/",
      "/torneos/1",
      "/administrador",
      "https://evil.example/admin",
      "//evil.example/admin",
      "/admin/login",
      "/admin/login?next=/admin/x",
    ]) {
      expect(safeNextPath(value)).toBe("/admin");
    }
  });
});

describe("loginUrl", () => {
  it("adds the page to return to and the expired notice", () => {
    expect(loginUrl()).toBe("/admin/login");
    expect(loginUrl({ next: "/admin" })).toBe("/admin/login");
    expect(loginUrl({ next: "/admin/torneos/3", expired: true })).toBe(
      "/admin/login?next=%2Fadmin%2Ftorneos%2F3&vencida=1",
    );
  });

  it("drops a next path that isn't an admin page", () => {
    expect(loginUrl({ next: "https://evil.example" })).toBe("/admin/login");
  });
});
