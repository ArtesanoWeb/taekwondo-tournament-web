import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { api, attempt } from "./client";
import type { Bracket, Category, Registrant, Tournament } from "./types";
import { PUBLIC_TAG, categoryTag } from "./tags";

/**
 * The public site's reads, cached for a few seconds and shared by every visitor the same server
 * instance serves. While a tournament is being played every open page asks again every 5 s
 * (`LiveRefresh`), and Render's free plan shouldn't take each of those requests: with the cache
 * it gets about one per resource every few seconds, however many people are watching.
 *
 * The admin's server actions expire these entries (`updateTag`) when they change something, so
 * whoever saved sees it right away. Another Vercel instance may still show the previous data for
 * up to `revalidate` seconds.
 *
 * Failures come back as values (a cached function's thrown error doesn't keep its class) and
 * are kept for a second only, so a Render hiccup isn't repeated to everyone.
 */
export type Loaded<T> =
  | { ok: true; data: T; fetchedAt: string }
  | { ok: false; error: { status: number; message: string } };

async function load<T>(
  request: Parameters<typeof attempt<T>>[0],
): Promise<Loaded<T>> {
  const result = await attempt(request);
  if (!result.ok) {
    cacheLife({ stale: 30, revalidate: 1, expire: 2 });
    return {
      ok: false,
      error: { status: result.error.status, message: result.error.message },
    };
  }
  // `expire` under the 5 s of `LiveRefresh`: a lone visitor's next check finds the entry expired
  // and waits for fresh data, instead of getting the old one once while it renews in the
  // background (that doubled the delay to ~10 s). With many visitors checking, entries are
  // renewed in the background before they expire and Render still gets one request per 2 s.
  cacheLife({ stale: 30, revalidate: 2, expire: 4 });
  return { ok: true, data: result.data, fetchedAt: new Date().toISOString() };
}

export async function getTournaments(): Promise<Loaded<Tournament[]>> {
  "use cache";
  cacheTag(PUBLIC_TAG);
  return load(api.GET("/api/v1/tournaments"));
}

export async function getTournament(id: number): Promise<Loaded<Tournament>> {
  "use cache";
  cacheTag(PUBLIC_TAG);
  return load(
    api.GET("/api/v1/tournaments/{tournament_id}", {
      params: { path: { tournament_id: id } },
    }),
  );
}

export async function getCategories(
  tournamentId: number,
): Promise<Loaded<Category[]>> {
  "use cache";
  cacheTag(PUBLIC_TAG);
  return load(
    api.GET("/api/v1/categories", {
      params: { query: { tournament_id: tournamentId } },
    }),
  );
}

export async function getCategory(id: number): Promise<Loaded<Category>> {
  "use cache";
  cacheTag(PUBLIC_TAG, categoryTag(id));
  return load(
    api.GET("/api/v1/categories/{category_id}", {
      params: { path: { category_id: id } },
    }),
  );
}

export async function getBracket(categoryId: number): Promise<Loaded<Bracket>> {
  "use cache";
  cacheTag(PUBLIC_TAG, categoryTag(categoryId));
  return load(
    api.GET("/api/v1/categories/{category_id}/bracket", {
      params: { path: { category_id: categoryId } },
    }),
  );
}

export async function getRegistrants(
  categoryId: number,
): Promise<Loaded<Registrant[]>> {
  "use cache";
  cacheTag(PUBLIC_TAG, categoryTag(categoryId));
  return load(
    api.GET("/api/v1/categories/{category_id}/registrants", {
      params: { path: { category_id: categoryId } },
    }),
  );
}
