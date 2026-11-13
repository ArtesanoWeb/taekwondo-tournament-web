import { Suspense } from "react";

import { fetchApiVersion, webVersion } from "@/lib/versions";

async function ApiVersion() {
  const version = await fetchApiVersion();
  return version ? <> · API v{version}</> : null;
}

export function SiteFooter() {
  return (
    <footer className="hidden border-t border-zinc-200 lg:block dark:border-zinc-800">
      <p className="mx-auto w-full max-w-5xl px-4 py-4 text-xs text-zinc-500">
        Web v{webVersion}
        <Suspense>
          <ApiVersion />
        </Suspense>
      </p>
    </footer>
  );
}
