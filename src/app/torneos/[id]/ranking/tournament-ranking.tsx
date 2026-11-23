import { notFound } from "next/navigation";

import { ClubRanking } from "@/components/club-ranking";
import { ErrorNotice } from "@/components/error-notice";
import { LiveRefresh } from "@/components/live-refresh";
import { TitleBar } from "@/components/title-bar";
import { getTournament } from "@/lib/api/public";
import { getTournamentRanking } from "@/lib/api/ranking";

export async function TournamentRankingView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
        title="Ranking de clubes"
        parentHref={`/torneos/${tournament.data.id}`}
        parentLabel={tournament.data.name}
        subtitle={
          <div className="flex flex-col gap-2">
            <p>{tournament.data.name}</p>
            {tournament.data.status === "in_progress" && (
              <LiveRefresh updatedAt={tournament.fetchedAt} />
            )}
          </div>
        }
      />
      {ranking ? (
        <ClubRanking ranking={ranking} showTitle={false} />
      ) : (
        <ErrorNotice message="No se pudieron leer las categorías del torneo." />
      )}
    </>
  );
}
