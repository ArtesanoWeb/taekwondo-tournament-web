import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingNotice } from "@/components/loading-notice";

import { TournamentRankingView } from "./tournament-ranking";

export const metadata: Metadata = { title: "Ranking de clubes" };

export default function TournamentRankingPage({
  params,
}: PageProps<"/torneos/[id]/ranking">) {
  return (
    <div className="flex flex-col gap-6 pt-6 pb-8 sm:pt-8">
      <Suspense fallback={<LoadingNotice label="Cargando ranking…" />}>
        <TournamentRankingView params={params} />
      </Suspense>
    </div>
  );
}
