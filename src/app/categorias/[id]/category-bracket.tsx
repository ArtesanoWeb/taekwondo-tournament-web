import { notFound } from "next/navigation";

import { BracketView } from "@/components/bracket-view";
import { ErrorNotice } from "@/components/error-notice";
import { TitleBar } from "@/components/title-bar";
import { api, attempt } from "@/lib/api/client";
import { formatAgeRange } from "@/lib/categories";
import { formatDateTime } from "@/lib/format";
import { beltGroupLabels, genderLabels } from "@/lib/labels";
import type { Registrant } from "@/lib/api/types";

export async function CategoryBracket({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const path = { params: { path: { category_id: Number(id) } } };

  // Registrants are fetched together: they're what's shown while there's no bracket.
  const [category, bracket, registrants] = await Promise.all([
    attempt(api.GET("/api/v1/categories/{category_id}", path)),
    attempt(api.GET("/api/v1/categories/{category_id}/bracket", path)),
    attempt(api.GET("/api/v1/categories/{category_id}/registrants", path)),
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
  const enrollmentOpen = tournament.ok && tournament.data.status === "draft";

  return (
    <>
      <TitleBar
        title={`${category.data.age_label} · ${category.data.weight_label}`}
        parentHref={`/torneos/${category.data.tournament_id}`}
        parentLabel={tournament.ok ? tournament.data.name : "Torneo"}
        subtitle={
          <p>
            {genderLabels[category.data.gender]}
            {" · "}
            {formatAgeRange(category.data.min_age, category.data.max_age)}
            {" · "}
            {beltGroupLabels[category.data.belt_group]}
          </p>
        }
      />

      {category.data.has_bracket ? (
        bracket.ok ? (
          <section className="flex flex-col gap-4">
            <p className="text-sm text-zinc-500">
              {bracket.data.size} lugares · Sorteada el{" "}
              <time dateTime={bracket.data.generated_at}>
                {formatDateTime(bracket.data.generated_at)}
              </time>
            </p>
            <BracketView bracket={bracket.data} />
          </section>
        ) : (
          <ErrorNotice message={bracket.error.message} />
        )
      ) : (
        <section className="flex flex-col gap-4">
          <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            {enrollmentOpen
              ? "Las inscripciones están abiertas. La llave se sortea cuando empiece el torneo."
              : "La llave todavía no fue sorteada."}
          </p>
          {/* The API decides whether the list is public (it may hide it until the weigh-in):
              without it, the notice above is all there is. */}
          {registrants.ok && <RegistrantList registrants={registrants.data} />}
        </section>
      )}
    </>
  );
}

function RegistrantList({ registrants }: { registrants: Registrant[] }) {
  if (registrants.length === 0) {
    return (
      <p className="text-center text-zinc-600 dark:text-zinc-400">
        Todavía no hay inscritos.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">
        {registrants.length === 1
          ? "1 inscrito"
          : `${registrants.length} inscritos`}
      </h2>
      <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {registrants.map((registrant) => (
          <li key={registrant.athlete_id} className="flex flex-col px-4 py-3">
            <span className="font-medium">{registrant.name}</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {registrant.club}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
