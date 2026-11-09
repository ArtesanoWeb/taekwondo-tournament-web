import Link from "next/link";
import { notFound } from "next/navigation";

import { BracketStatsSummary } from "@/components/bracket-stats";
import { ErrorNotice } from "@/components/error-notice";
import { TournamentStatusBadge } from "@/components/tournament-status-badge";
import { api, attempt } from "@/lib/api/client";
import type { Category } from "@/lib/api/types";
import { type BracketStats, bracketStats } from "@/lib/bracket";
import { formatAgeRange, groupByGender } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { beltGroupLabels, genderLabels } from "@/lib/labels";

export async function TournamentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const tournamentId = Number(id);

  const [tournament, categories] = await Promise.all([
    attempt(
      api.GET("/api/v1/tournaments/{tournament_id}", {
        params: { path: { tournament_id: tournamentId } },
      }),
    ),
    attempt(
      api.GET("/api/v1/categories", {
        params: { query: { tournament_id: tournamentId } },
      }),
    ),
  ]);

  if (!tournament.ok) {
    if (tournament.error.status === 404) notFound();
    return <ErrorNotice message={tournament.error.message} />;
  }

  // Only while it's being played, and from the brackets: the API doesn't publish registrations.
  const stats =
    tournament.data.status === "in_progress" && categories.ok
      ? await fetchCategoryStats(categories.data)
      : undefined;

  return (
    <>
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
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
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Categorías</h2>
        {categories.ok ? (
          <CategoryGroups categories={categories.data} stats={stats} />
        ) : (
          <ErrorNotice message={categories.error.message} />
        )}
      </section>
    </>
  );
}

async function fetchCategoryStats(
  categories: Category[],
): Promise<Map<number, BracketStats | null>> {
  const entries = await Promise.all(
    categories.map(async (category) => {
      const bracket = await attempt(
        api.GET("/api/v1/categories/{category_id}/bracket", {
          params: { path: { category_id: category.id } },
        }),
      );
      if (bracket.ok) {
        return [category.id, bracketStats(bracket.data.matches)] as const;
      }
      // A 404 is a bracket not drawn yet; any other failure just shows nothing.
      return bracket.error.status === 404
        ? ([category.id, null] as const)
        : null;
    }),
  );
  return new Map(entries.filter((entry) => entry !== null));
}

function CategoryGroups({
  categories,
  stats,
}: {
  categories: Category[];
  stats?: Map<number, BracketStats | null>;
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
        {group.categories.map((category) => {
          const categoryStats = stats?.get(category.id);
          return (
            <li key={category.id}>
              <Link
                href={`/categorias/${category.id}`}
                className="flex h-full items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 active:bg-zinc-100 dark:border-zinc-800 dark:hover:border-zinc-600 dark:active:bg-zinc-800"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-semibold">
                    {category.age_label} · {category.weight_label}
                  </span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {formatAgeRange(category.min_age, category.max_age)}
                    {" · "}
                    {beltGroupLabels[category.belt_group]}
                  </span>
                </div>
                {categoryStats !== undefined && (
                  <BracketStatsSummary
                    stats={categoryStats}
                    emptyLabel="Llave no sorteada"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  ));
}
