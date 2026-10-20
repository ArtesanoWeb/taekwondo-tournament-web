import Link from "next/link";
import { notFound } from "next/navigation";

import { BracketView } from "@/components/bracket-view";
import { ErrorNotice } from "@/components/error-notice";
import { api, attempt } from "@/lib/api/client";
import { formatAgeRange } from "@/lib/categories";
import { formatDateTime } from "@/lib/format";
import { beltGroupLabels, genderLabels } from "@/lib/labels";

export async function CategoryBracket({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const path = { params: { path: { category_id: Number(id) } } };

  const [category, bracket] = await Promise.all([
    attempt(api.GET("/api/v1/categories/{category_id}", path)),
    attempt(api.GET("/api/v1/categories/{category_id}/bracket", path)),
  ]);

  if (!category.ok) {
    if (category.error.status === 404) notFound();
    return <ErrorNotice message={category.error.message} />;
  }

  const tournament = await attempt(
    api.GET("/api/v1/tournaments/{tournament_id}", {
      params: { path: { tournament_id: category.data.tournament_id } },
    }),
  );

  return (
    <>
      <Link
        href={`/torneos/${category.data.tournament_id}`}
        className="w-fit text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← {tournament.ok ? tournament.data.name : "Volver al torneo"}
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {category.data.age_label} · {category.data.weight_label}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {genderLabels[category.data.gender]}
          {" · "}
          {formatAgeRange(category.data.min_age, category.data.max_age)}
          {" · "}
          {beltGroupLabels[category.data.belt_group]}
        </p>
      </header>

      {bracket.ok ? (
        <section className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500">
            {bracket.data.size} lugares · Sorteada el{" "}
            <time dateTime={bracket.data.generated_at}>
              {formatDateTime(bracket.data.generated_at)}
            </time>
          </p>
          <BracketView bracket={bracket.data} />
        </section>
      ) : bracket.error.status === 404 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          La llave todavía no fue sorteada.
        </p>
      ) : (
        <ErrorNotice message={bracket.error.message} />
      )}
    </>
  );
}
