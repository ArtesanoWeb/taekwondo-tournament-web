import { Suspense } from "react";

import { LoadingNotice } from "@/components/loading-notice";

import { TournamentList } from "./tournament-list";

export default function Home() {
  return (
    <div className="flex flex-col gap-6 pt-8 pb-[calc(8rem+env(safe-area-inset-bottom))] lg:pb-8">
      <h1 className="text-3xl font-semibold tracking-tight">Torneos</h1>
      <Suspense fallback={<LoadingNotice label="Cargando torneos…" />}>
        <TournamentList />
      </Suspense>
    </div>
  );
}
