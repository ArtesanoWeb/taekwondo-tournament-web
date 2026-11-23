import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ClubRanking } from "@/components/club-ranking";
import { ErrorNotice } from "@/components/error-notice";
import { LoadingNotice } from "@/components/loading-notice";
import { TitleBar } from "@/components/title-bar";
import { getTournament } from "@/lib/api/public";
import { getTournamentRanking } from "@/lib/api/ranking";

export const metadata: Metadata = { title: "Ranking de clubes" };

export default function AdminTournamentRankingPage({
  params,
}: PageProps<"/admin/rankings/[id]">) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<LoadingNotice label="Cargando ranking…" />}>
        <AdminTournamentRanking params={params} />
      </Suspense>
    </div>
  );
}

async function AdminTournamentRanking({
  params,
}: Pick<PageProps<"/admin/rankings/[id]">, "params">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const tournament = await getTournament(Number(id));
  if (!tournament.ok) {
    if (tournament.error.status === 404) notFound();
    return <ErrorNotice message={tournament.error.message} />;
  }
  const ranking = await getTournamentRanking(tournament.data);

  return (
    <>
      <TitleBar
        title={tournament.data.name}
        parentHref="/admin/rankings"
        parentLabel="Rankings"
      />
      {ranking ? (
        <ClubRanking ranking={ranking} />
      ) : (
        <ErrorNotice message="No se pudieron leer las categorías del torneo." />
      )}
    </>
  );
}
