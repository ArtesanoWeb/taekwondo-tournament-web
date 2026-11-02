"use server";

import { refresh } from "next/cache";

import { adminAttempt, getAdminApi } from "@/lib/session";

export type StatusActionState = { error?: string };

/** Starts (draft → in progress) or finishes (in progress → finished) a tournament. Irreversible. */
export async function changeTournamentStatus(
  _previous: StatusActionState,
  formData: FormData,
): Promise<StatusActionState> {
  const tournamentId = Number(formData.get("tournamentId"));
  const action = formData.get("action");
  if (
    !Number.isInteger(tournamentId) ||
    (action !== "start" && action !== "finish")
  ) {
    return { error: "No se pudo identificar el torneo." };
  }

  const api = await getAdminApi();
  const options = { params: { path: { tournament_id: tournamentId } } };
  const result = await adminAttempt(
    action === "start"
      ? api.POST("/api/v1/tournaments/{tournament_id}/start", options)
      : api.POST("/api/v1/tournaments/{tournament_id}/finish", options),
  );
  // e.g. 409 when finishing with matches still to play: `detail` names the pending categories.
  if (!result.ok) return { error: result.error.message };

  refresh();
  return {};
}
