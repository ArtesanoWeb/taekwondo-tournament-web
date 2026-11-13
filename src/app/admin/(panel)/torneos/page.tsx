import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ErrorNotice } from "@/components/error-notice";
import { LoadingNotice } from "@/components/loading-notice";
import { TournamentStatusBadge } from "@/components/tournament-status-badge";
import { formatDate } from "@/lib/format";
import { countAthletesByTournament } from "@/lib/registrations";
import { adminAttempt, getAdminApi } from "@/lib/session";
import { groupTournamentsByStatus } from "@/lib/tournaments";
import type { Tournament } from "@/lib/api/types";

import { TournamentTabs } from "./tournament-tabs";

export const metadata: Metadata = { title: "Torneos" };

export default function AdminTournamentsPage({
  searchParams,
}: PageProps<"/admin/torneos">) {
  return (
    <div className="flex flex-col gap-6">
      {/* The navigation already says where we are; the heading stays for screen readers. */}
      <h1 className="sr-only">Torneos</h1>
      <div className="hidden justify-end sm:flex">
        <Link
          href="/admin/torneos/nuevo"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Nuevo torneo
        </Link>
      </div>
      {/* Floating button within thumb reach, just above the bottom bar. */}
      <Link
        href="/admin/torneos/nuevo"
        aria-label="Nuevo torneo"
        className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 flex size-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg active:bg-zinc-700 sm:hidden dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300"
      >
        <svg
          aria-hidden
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
      <Suspense fallback={<LoadingNotice label="Cargando torneos…" />}>
        <AdminTournamentList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AdminTournamentList({
  searchParams,
}: Pick<PageProps<"/admin/torneos">, "searchParams">) {
  const api = await getAdminApi();
  const [result, registrations, { creado }] = await Promise.all([
    adminAttempt(api.GET("/api/v1/tournaments")),
    adminAttempt(api.GET("/api/v1/registrations")),
    searchParams,
  ]);
  if (!result.ok) return <ErrorNotice message={result.error.message} />;
  if (!registrations.ok) {
    return <ErrorNotice message={registrations.error.message} />;
  }
  const athleteCounts = countAthletesByTournament(registrations.data);

  // `?creado=<id>` comes from the "Nuevo torneo" form: confirm it and highlight the new one.
  const createdId = Number(creado);
  const created = result.data.find((t) => t.id === createdId);

  if (result.data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Todavía no hay torneos.
      </p>
    );
  }

  const { inProgress, open, finished } = groupTournamentsByStatus(result.data);
  const renderCards = (tournaments: Tournament[]) =>
    tournaments.map((tournament) => (
      <li key={tournament.id}>
        <TournamentCard
          tournament={tournament}
          athletes={athleteCounts.get(tournament.id) ?? 0}
          highlighted={tournament.id === created?.id}
        />
      </li>
    ));

  const groups = [
    {
      key: "in_progress",
      label: "En curso",
      tabLabel: "En curso",
      count: inProgress.length,
      empty: "No hay torneos en curso.",
      cards: renderCards(inProgress),
    },
    {
      key: "open",
      label: "Inscripciones abiertas",
      // The full label doesn't fit in a third of a phone screen.
      tabLabel: "Inscripciones",
      count: open.length,
      empty: "No hay torneos con inscripciones abiertas.",
      cards: renderCards(open),
    },
    {
      key: "finished",
      label: "Finalizados",
      tabLabel: "Finalizados",
      count: finished.length,
      empty: "No hay torneos finalizados.",
      cards: renderCards(finished),
    },
  ];

  // A new tournament has to be visible; otherwise open the first group with something in it.
  const initialIndex = created
    ? groups.findIndex((group) => group.key === "open")
    : Math.max(
        groups.findIndex((group) => group.count > 0),
        0,
      );

  return (
    <div className="flex flex-col gap-4">
      {created && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          Torneo creado: <span className="font-medium">{created.name}</span>. Ya
          puedes preparar sus categorías e inscripciones.
        </p>
      )}
      {/* `key`: coming back from the form has to re-open the right group. */}
      <TournamentTabs
        key={created?.id ?? "list"}
        groups={groups}
        initialIndex={initialIndex}
      />
    </div>
  );
}

function TournamentCard({
  tournament,
  athletes,
  highlighted,
}: {
  tournament: Tournament;
  athletes: number;
  highlighted: boolean;
}) {
  return (
    // The whole card is the link: on a phone there's no hover and small targets are hard to hit.
    <Link
      href={`/admin/torneos/${tournament.id}`}
      className={`flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:hover:bg-zinc-900 dark:active:bg-zinc-800 ${
        highlighted
          ? "border-emerald-400 ring-2 ring-emerald-400/30 dark:border-emerald-600"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-semibold">{tournament.name}</h2>
        <TournamentStatusBadge status={tournament.status} />
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <time dateTime={tournament.date}>{formatDate(tournament.date)}</time>
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {tournament.location}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {formatAthleteCount(athletes)}
      </p>
    </Link>
  );
}

function formatAthleteCount(count: number): string {
  return count === 1 ? "1 atleta" : `${count} atletas`;
}
