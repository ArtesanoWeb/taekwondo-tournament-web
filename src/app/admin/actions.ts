"use server";

import { redirect } from "next/navigation";

import { api, attempt } from "@/lib/api/client";
import { LOGIN_PATH, safeNextPath } from "@/lib/auth";
import { deleteSession, saveSession } from "@/lib/session";

export type LoginState = { error?: string; username?: string };

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    return { error: "Escribe tu usuario y tu contraseña.", username };
  }

  // The API only accepts the login as a form, not as JSON.
  const result = await attempt(
    api.POST("/api/v1/auth/login", {
      body: { username, password },
      bodySerializer: (body) => new URLSearchParams(body).toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  );
  // A wrong password answers 401 with "Usuario o contraseña incorrectos".
  if (!result.ok) return { error: result.error.message, username };

  await saveSession(result.data.access_token);
  redirect(safeNextPath(formData.get("next")));
}

export async function logout() {
  await deleteSession();
  redirect(LOGIN_PATH);
}
