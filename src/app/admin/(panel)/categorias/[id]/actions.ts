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

export type RegisterState = {
  /** Who was just registered, so the admin sees it and can keep going. */
  registeredId?: number;
  error?: string;
  errorAthleteId?: number;
  /** The tournament may have started meanwhile: the page is stale once the dialog closes. */
  stale?: boolean;
};

/** Registers an athlete in a category. The API enforces gender, weight and duplicates. */
export async function registerAthlete(
  _previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const categoryId = Number(formData.get("categoryId"));
  const athleteId = Number(formData.get("athleteId"));
  if (!Number.isInteger(categoryId) || !Number.isInteger(athleteId)) {
    return { error: "No se pudo identificar la inscripción." };
  }

  const api = await getAdminApi();
  const result = await adminAttempt(
    api.POST("/api/v1/registrations", {
      body: { category_id: categoryId, athlete_id: athleteId },
    }),
  );
  if (!result.ok) {
    // Not refreshed on 409: if the tournament started, the button that owns this dialog would
    // disappear with it, taking the message along before it could be read.
    return {
      error: result.error.message,
      errorAthleteId: athleteId,
      stale: result.error.status === 409,
    };
  }

  refresh();
  return { registeredId: athleteId };
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
export type RoundState = {
  error?: string;
  red?: string;
  blue?: string;
  /** The match changed meanwhile (another phone, or a retry): reload it before going on. */
  stale?: boolean;
};

export async function addRound(
  _previous: RoundState,
  formData: FormData,
): Promise<RoundState> {
  const red = String(formData.get("red") ?? "");
  const blue = String(formData.get("blue") ?? "");
  const matchId = Number(formData.get("matchId"));
  const roundNumber = Number(formData.get("roundNumber"));
  if (!Number.isInteger(matchId) || !Number.isInteger(roundNumber)) {
    return { error: "No se pudo identificar el combate.", red, blue };
  }
  const parsed = parseRoundPoints(red, blue);
  if (!parsed.ok) return { error: parsed.error, red, blue };

  const api = await getAdminApi();
  const result = await adminAttempt(
    api.POST("/api/v1/matches/{match_id}/rounds", {
      params: { path: { match_id: matchId } },
      // The round the admin confirmed: if it was already saved (a retry after a lost
      // response, or another phone), the API answers 409 instead of saving it twice.
      body: {
        round_number: roundNumber,
        red_points: parsed.points.red,
        blue_points: parsed.points.blue,
      },
    }),
  );
  if (!result.ok) {
    if (isRoundOutOfOrder(result.error)) {
      return { error: ROUND_OUT_OF_ORDER, stale: true };
    }
    // 409 when the match already finished (e.g. scored from another phone), 400 if it isn't ready.
    return { error: result.error.message, red, blue };
  }

  refresh();
  return {};
}

const ROUND_OUT_OF_ORDER =
  "Ese round ya estaba guardado (quizá desde otro celular o por un reenvío). Revisa los rounds actualizados antes de cargar el siguiente.";

/** The API rejects a round that isn't the next one with this 409 message. */
function isRoundOutOfOrder(error: { status: number; message: string }) {
  return (
    error.status === 409 && error.message.startsWith("El round que sigue es el")
  );
}
