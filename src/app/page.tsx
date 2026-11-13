import { Suspense } from "react";

import { LoadingNotice } from "@/components/loading-notice";

import { TournamentList } from "./tournament-list";

export default function Home() {
  return (
    // Below `lg`: room for the bottom bar (4rem) plus 1rem of air.
    <div className="flex flex-col gap-6 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pt-8 lg:pb-8">
      {/* The bottom bar already says what's listed; the heading stays for screen readers. */}
      <h1 className="sr-only">Torneos</h1>
      <Suspense fallback={<LoadingNotice label="Cargando torneos…" />}>
        <TournamentList />
      </Suspense>
    </div>
  );
}
