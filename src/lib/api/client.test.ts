import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { attempt } = await import("./client");

const response = (status: number) => new Response(null, { status });

describe("attempt", () => {
  it("returns the data of a successful response", async () => {
    const result = await attempt(
      Promise.resolve({ data: { id: 1 }, response: response(200) }),
    );
    expect(result).toEqual({ ok: true, data: { id: 1 } });
  });

  it("treats 204 No Content (e.g. a DELETE) as success, not as an unexpected error", async () => {
    const result = await attempt(
      Promise.resolve({ data: undefined, response: response(204) }),
    );
    expect(result.ok).toBe(true);
  });

  it("returns the API message of an error response", async () => {
    const result = await attempt(
      Promise.resolve({
        error: { detail: "El torneo ya empezó." },
        response: response(409),
      }),
    );
    expect(result).toMatchObject({
      ok: false,
      error: { status: 409, message: "El torneo ya empezó." },
    });
  });

  it("still rejects a 200 without a body", async () => {
    const result = await attempt(
      Promise.resolve({ data: undefined, response: response(200) }),
    );
    expect(result).toMatchObject({ ok: false, error: { status: 200 } });
  });
});
