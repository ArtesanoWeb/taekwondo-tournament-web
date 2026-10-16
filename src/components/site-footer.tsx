import { Suspense } from "react";

import { api } from "@/lib/api/client";

import packageJson from "../../package.json";

async function fetchApiVersion(): Promise<string | null> {
  try {
    const { data } = await api.GET("/health");
    const version = (data as { version?: unknown } | undefined)?.version;
    return typeof version === "string" ? version : null;
  } catch {
    return null;
  }
}

async function ApiVersion() {
  const version = await fetchApiVersion();
  return version ? <> · API v{version}</> : null;
}

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <p className="mx-auto w-full max-w-5xl px-4 py-4 text-xs text-zinc-500">
        Web v{packageJson.version}
        <Suspense>
          <ApiVersion />
        </Suspense>
      </p>
    </footer>
  );
}
