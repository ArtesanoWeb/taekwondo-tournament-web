"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import {
  type CategoryFormValues,
  parseCategoryForm,
} from "@/lib/category-form";
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

/** The typed values come back on error so the form doesn't lose them. */
export type CategoryState = {
  saved?: boolean;
  error?: string;
  /** The tournament started meanwhile: the page is stale once the dialog closes. */
  stale?: boolean;
  values?: CategoryFormValues;
};

/** Adds a category to a tournament. Only while enrollment is open (else the API says 409). */
export async function createCategory(
  _previous: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  const field = (name: string) => String(formData.get(name) ?? "");
  const values: CategoryFormValues = {
    gender: field("gender"),
    ageLabel: field("ageLabel"),
    minAge: field("minAge"),
    maxAge: field("maxAge"),
    beltGroup: field("beltGroup"),
    weightLabel: field("weightLabel"),
    minWeight: field("minWeight"),
    maxWeight: field("maxWeight"),
    roundsToWin: field("roundsToWin"),
  };
  const tournamentId = Number(field("tournamentId"));
  if (!Number.isInteger(tournamentId)) {
    return { error: "No se pudo identificar el torneo.", values };
  }
  const parsed = parseCategoryForm(values);
  if (!parsed.ok) return { error: parsed.error, values };

  const api = await getAdminApi();
  const result = await adminAttempt(
    api.POST("/api/v1/categories", {
      body: {
        ...parsed.fields,
        tournament_id: tournamentId,
        discipline: "sparring",
      },
    }),
  );
  if (!result.ok) {
    // 409 when the tournament was started meanwhile. Not refreshed here: the button that owns this
    // dialog would disappear with it, taking the message along before it could be read.
    return {
      error: result.error.message,
      stale: result.error.status === 409,
      values,
    };
  }

  refresh();
  return { saved: true };
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
