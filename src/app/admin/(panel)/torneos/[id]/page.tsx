import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ErrorNotice } from "@/components/error-notice";
import { LoadingNotice } from "@/components/loading-notice";
import { TournamentStatusBadge } from "@/components/tournament-status-badge";
import type { Category } from "@/lib/api/types";
import { pendingMatchCount } from "@/lib/bracket";
import { formatAgeRange, groupByGender } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { genderLabels } from "@/lib/labels";
import { adminAttempt, getAdminApi } from "@/lib/session";

import { StatusAction } from "../status-action";

export default function AdminTournamentPage({
  params,
}: PageProps<"/admin/torneos/[id]">) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/torneos"
        className="w-fit text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Torneos
      </Link>
      <Suspense fallback={<LoadingNotice label="Cargando torneo…" />}>
        <AdminTournamentDetail params={params} />
      </Suspense>
    </div>
  );
}

async function AdminTournamentDetail({
  params,
}: Pick<PageProps<"/admin/torneos/[id]">, "params">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const tournamentId = Number(id);

  const api = await getAdminApi();
  const [tournament, categories, registrations] = await Promise.all([
    adminAttempt(
      api.GET("/api/v1/tournaments/{tournament_id}", {
        params: { path: { tournament_id: tournamentId } },
      }),
    ),
    adminAttempt(
      api.GET("/api/v1/categories", {
        params: { query: { tournament_id: tournamentId } },
      }),
    ),
    adminAttempt(api.GET("/api/v1/registrations")),
  ]);

  if (!tournament.ok) {
    if (tournament.error.status === 404) notFound();
    return <ErrorNotice message={tournament.error.message} />;
  }
  if (!categories.ok) return <ErrorNotice message={categories.error.message} />;
  if (!registrations.ok) {
    return <ErrorNotice message={registrations.error.message} />;
  }

  const registered = Map.groupBy(
    registrations.data,
    (registration) => registration.category_id,
  );
  const brackets = await Promise.all(
    categories.data.map((category) =>
      adminAttempt(
        api.GET("/api/v1/categories/{category_id}/bracket", {
          params: { path: { category_id: category.id } },
        }),
      ),
    ),
  );
  const failed = brackets.find(
    (bracket) => !bracket.ok && bracket.error.status !== 404,
  );
  if (failed && !failed.ok)
    return <ErrorNotice message={failed.error.message} />;

  const summaries = new Map(
    categories.data.map((category, index) => {
      const bracket = brackets[index];
      const summary: CategorySummary = {
        registered: registered.get(category.id)?.length ?? 0,
        // Any other error was handled above, so a failed request here is a 404: no bracket yet.
        pendingMatches: bracket.ok
          ? pendingMatchCount(bracket.data.matches)
          : null,
      };
      return [category.id, summary];
    }),
  );

  return (
    <>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {tournament.data.name}
            </h1>
            <TournamentStatusBadge status={tournament.data.status} />
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            <time dateTime={tournament.data.date}>
              {formatDate(tournament.data.date)}
            </time>
            {" · "}
            {tournament.data.location}
          </p>
        </div>
        <StatusAction tournament={tournament.data} />
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Categorías</h2>
        <CategoryGroups categories={categories.data} summaries={summaries} />
      </section>
    </>
  );
}

type CategorySummary = { registered: number; pendingMatches: number | null };

function CategoryGroups({
  categories,
  summaries,
}: {
  categories: Category[];
  summaries: Map<number, CategorySummary>;
}) {
  if (categories.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Este torneo todavía no tiene categorías.
      </p>
    );
  }

  return groupByGender(categories).map((group) => (
    <div key={group.gender} className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
        {genderLabels[group.gender]}
      </h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {group.categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/admin/categorias/${category.id}`}
              className="flex h-full flex-col gap-1 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <span className="font-semibold">
                {category.age_label} · {category.weight_label}
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatAgeRange(category.min_age, category.max_age)}
              </span>
              <BracketSummary summary={summaries.get(category.id)!} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ));
}

function BracketSummary({ summary }: { summary: CategorySummary }) {
  const registered =
    summary.registered === 1 ? "1 inscrito" : `${summary.registered} inscritos`;
  const bracket =
    summary.pendingMatches === null
      ? { label: "Sin llave", tone: "text-zinc-500" }
      : summary.pendingMatches === 0
        ? {
            label: "Llave terminada",
            tone: "text-amber-700 dark:text-amber-400",
          }
        : {
            label:
              summary.pendingMatches === 1
                ? "1 combate por jugar"
                : `${summary.pendingMatches} combates por jugar`,
            tone: "text-emerald-700 dark:text-emerald-400",
          };

  return (
    <span className="text-sm">
      {registered}
      {" · "}
      <span className={`font-medium ${bracket.tone}`}>{bracket.label}</span>
    </span>
  );
}
