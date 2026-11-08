"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import {
  parseTournamentForm,
  type TournamentFormValues,
} from "@/lib/tournament-form";
import { adminAttempt, getAdminApi } from "@/lib/session";

/** The typed values come back on error so the form doesn't lose them. */
export type CreateTournamentState = {
  error?: string;
  values?: TournamentFormValues;
};

/** Creates a tournament (the API leaves it in draft) and goes back to the admin list. */
export async function createTournament(
  _previous: CreateTournamentState,
  formData: FormData,
): Promise<CreateTournamentState> {
  const typed = {
    name: String(formData.get("name") ?? ""),
    date: String(formData.get("date") ?? ""),
    location: String(formData.get("location") ?? ""),
  };
  const parsed = parseTournamentForm(typed.name, typed.date, typed.location);
  if (!parsed.ok) return { error: parsed.error, values: typed };

  const api = await getAdminApi();
  const result = await adminAttempt(
    api.POST("/api/v1/tournaments", { body: parsed.values }),
  );
  if (!result.ok) return { error: result.error.message, values: typed };

  // Outside any try/catch: `redirect` works by throwing.
  redirect(`/admin/torneos?creado=${result.data.id}`);
}

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
