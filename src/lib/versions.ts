import "server-only";

import { api } from "@/lib/api/client";

import packageJson from "../../package.json";

export const webVersion = packageJson.version;

/** The API's version from `/health`, or `null` if it can't be reached. */
export async function fetchApiVersion(): Promise<string | null> {
  try {
    const { data } = await api.GET("/health");
    const version = (data as { version?: unknown } | undefined)?.version;
    return typeof version === "string" ? version : null;
  } catch {
    return null;
  }
}
