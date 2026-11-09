"use server";

import { refresh } from "next/cache";

import { adminAttempt, getAdminApi } from "@/lib/session";

/** The typed name comes back on error so the form doesn't lose it. */
export type ClubState = { saved?: boolean; error?: string; name?: string };

/** Creates a club, or renames it when the form carries a `clubId`. */
export async function saveClub(
  _previous: ClubState,
  formData: FormData,
): Promise<ClubState> {
  const typed = String(formData.get("name") ?? "");
  const name = typed.trim();
  if (!name) return { error: "Falta el nombre.", name: typed };

  const rawId = String(formData.get("clubId") ?? "");
  const api = await getAdminApi();
  const result = await adminAttempt(
    rawId
      ? api.PATCH("/api/v1/clubs/{club_id}", {
          params: { path: { club_id: Number(rawId) } },
          body: { name },
        })
      : api.POST("/api/v1/clubs", { body: { name } }),
  );
  // 409 when another club already has that name.
  if (!result.ok) return { error: result.error.message, name: typed };

  refresh();
  return { saved: true };
}
