import { Suspense } from "react";

import { LoadingNotice } from "@/components/loading-notice";

import { TournamentDetail } from "./tournament-detail";

export default function TournamentPage({ params }: PageProps<"/torneos/[id]">) {
  return (
    <div className="flex flex-col gap-6 pt-6 pb-8 sm:pt-8">
      <Suspense fallback={<LoadingNotice label="Cargando torneo…" />}>
        <TournamentDetail params={params} />
      </Suspense>
    </div>
  );
}
