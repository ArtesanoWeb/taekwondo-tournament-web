"use server";

import { refresh } from "next/cache";

import { parseRoundPoints } from "@/lib/scoring";
import { adminAttempt, getAdminApi } from "@/lib/session";

export type GenerateBracketState = { error?: string };

export async function generateBracket(
  _previous: GenerateBracketState,
  formData: FormData,
): Promise<GenerateBracketState> {
  const categoryId = Number(formData.get("categoryId"));
  if (!Number.isInteger(categoryId)) {
    return { error: "No se pudo identificar la categoría." };
  }

  const api = await getAdminApi();
  const result = await adminAttempt(
    api.POST("/api/v1/categories/{category_id}/bracket", {
      params: { path: { category_id: categoryId } },
    }),
  );
  if (!result.ok) return { error: result.error.message };

  refresh();
  return {};
}

export type WithdrawState = { error?: string };

/** Removes an athlete from a category. Only while the tournament is a draft (else the API says 409). */
export async function withdrawRegistration(
  _previous: WithdrawState,
  formData: FormData,
): Promise<WithdrawState> {
  const registrationId = Number(formData.get("registrationId"));
  if (!Number.isInteger(registrationId)) {
    return { error: "No se pudo identificar la inscripción." };
  }

  const api = await getAdminApi();
  const result = await adminAttempt(
    api.DELETE("/api/v1/registrations/{registration_id}", {
      params: { path: { registration_id: registrationId } },
    }),
  );
  if (!result.ok) {
    // 409 when the tournament was started meanwhile (e.g. from another phone): re-render so the
    // page shows the real status and the "Retirar" buttons go away; the message stays visible.
    if (result.error.status === 409) refresh();
    return { error: result.error.message };
  }

  refresh();
  return {};
}

/** The typed values come back on error so the form doesn't lose them. */
export type RoundState = { error?: string; red?: string; blue?: string };

export async function addRound(
  _previous: RoundState,
  formData: FormData,
): Promise<RoundState> {
  const red = String(formData.get("red") ?? "");
  const blue = String(formData.get("blue") ?? "");
  const matchId = Number(formData.get("matchId"));
  if (!Number.isInteger(matchId)) {
    return { error: "No se pudo identificar el combate.", red, blue };
  }
  const parsed = parseRoundPoints(red, blue);
  if (!parsed.ok) return { error: parsed.error, red, blue };

  const api = await getAdminApi();
  const result = await adminAttempt(
    api.POST("/api/v1/matches/{match_id}/rounds", {
      params: { path: { match_id: matchId } },
      body: { red_points: parsed.points.red, blue_points: parsed.points.blue },
    }),
  );
  // 409 when the match already finished (e.g. scored from another phone), 400 if it isn't ready.
  if (!result.ok) return { error: result.error.message, red, blue };

  refresh();
  return {};
}
