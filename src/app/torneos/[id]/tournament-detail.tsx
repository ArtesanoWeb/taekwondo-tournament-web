import Link from "next/link";
import { notFound } from "next/navigation";

import { ErrorNotice } from "@/components/error-notice";
import { TournamentStatusBadge } from "@/components/tournament-status-badge";
import { api, attempt } from "@/lib/api/client";
import type { Category } from "@/lib/api/types";
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
          <CategoryGroups categories={categories.data} />
        ) : (
          <ErrorNotice message={categories.error.message} />
        )}
      </section>
    </>
  );
}

function CategoryGroups({ categories }: { categories: Category[] }) {
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
              href={`/categorias/${category.id}`}
              className="flex h-full flex-col gap-1 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <span className="font-semibold">
                {category.age_label} · {category.weight_label}
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatAgeRange(category.min_age, category.max_age)}
                {" · "}
                {beltGroupLabels[category.belt_group]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ));
}
