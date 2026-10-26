import Link from "next/link";
import { Suspense } from "react";

import { LoadingNotice } from "@/components/loading-notice";

import { TournamentDetail } from "./tournament-detail";

export default function TournamentPage({ params }: PageProps<"/torneos/[id]">) {
  return (
    <div className="flex flex-col gap-6 py-8">
      <Link
        href="/"
        className="w-fit text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Torneos
      </Link>
      <Suspense fallback={<LoadingNotice label="Cargando torneo…" />}>
        <TournamentDetail params={params} />
      </Suspense>
    </div>
  );
}
