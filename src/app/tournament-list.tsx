import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { TournamentStatusBadge } from "@/components/tournament-status-badge";
import { api, attempt } from "@/lib/api/client";
import type { Tournament } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { groupPublicTournaments } from "@/lib/tournaments";

export async function TournamentList() {
  const result = await attempt(api.GET("/api/v1/tournaments"));
  if (!result.ok) return <ErrorNotice message={result.error.message} />;

  const { inProgress, finished } = groupPublicTournaments(result.data);

  if (inProgress.length === 0 && finished.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Todavía no hay torneos publicados.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {inProgress.length > 0 && (
        <TournamentGroup title="En curso" tournaments={inProgress} />
      )}
      {inProgress.length > 0 && finished.length > 0 && (
        <hr className="border-zinc-200 dark:border-zinc-800" />
      )}
      {finished.length > 0 && (
        <TournamentGroup title="Finalizados" tournaments={finished} />
      )}
    </div>
  );
}

function TournamentGroup({
  title,
  tournaments,
}: {
  title: string;
  tournaments: Tournament[];
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {tournaments.map((tournament) => (
          <li key={tournament.id}>
            <Link
              href={`/torneos/${tournament.id}`}
              className="flex h-full flex-col gap-2 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{tournament.name}</h3>
                <TournamentStatusBadge status={tournament.status} />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <time dateTime={tournament.date}>
                  {formatDate(tournament.date)}
                </time>
                {" · "}
                {tournament.location}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
