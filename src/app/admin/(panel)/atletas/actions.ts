"use server";

import { refresh } from "next/cache";

import {
  type AthleteFormValues,
  isWithdrawalWarning,
  parseAthleteForm,
} from "@/lib/athlete-form";
import { adminAttempt, getAdminApi } from "@/lib/session";

/** The typed values come back on error so the form doesn't lose them. */
export type AthleteState = {
  saved?: boolean;
  error?: string;
  /** The API asks to confirm that the change removes the athlete from these categories. */
  withdrawal?: string;
  values?: AthleteFormValues;
};

/** Creates an athlete, or updates it when the form carries an `athleteId`. */
export async function saveAthlete(
  _previous: AthleteState,
  formData: FormData,
): Promise<AthleteState> {
  const field = (name: string) => String(formData.get(name) ?? "");
  const values: AthleteFormValues = {
    name: field("name"),
    ci: field("ci"),
    birthDate: field("birthDate"),
    gender: field("gender"),
    beltRank: field("beltRank"),
    weight: field("weight"),
    clubId: field("clubId"),
  };

  const today = new Date().toISOString().slice(0, 10);
  const parsed = parseAthleteForm(values, today);
  if (!parsed.ok) return { error: parsed.error, values };

  const rawId = field("athleteId");
  const api = await getAdminApi();
  const result = await adminAttempt(
    rawId
      ? api.PATCH("/api/v1/athletes/{athlete_id}", {
          params: {
            path: { athlete_id: Number(rawId) },
            query: {
              confirm_withdrawal: field("confirmWithdrawal") === "true",
            },
          },
          body: parsed.payload,
        })
      : api.POST("/api/v1/athletes", { body: parsed.payload }),
  );

  if (!result.ok) {
    const { message } = result.error;
    return isWithdrawalWarning(message)
      ? { withdrawal: message, values }
      : { error: message, values };
  }

  refresh();
  return { saved: true };
}
