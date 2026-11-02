import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BracketView } from "@/components/bracket-view";
import { ErrorNotice } from "@/components/error-notice";
import { LoadingNotice } from "@/components/loading-notice";
import type { Bracket, Category, TournamentStatus } from "@/lib/api/types";
import { groupRounds, matchesToScore, pendingMatchCount } from "@/lib/bracket";
import { formatAgeRange } from "@/lib/categories";
import { genderLabels } from "@/lib/labels";
import { adminAttempt, getAdminApi } from "@/lib/session";

import { GenerateBracket } from "./generate-bracket";
import { MatchScoreForm } from "./match-score-form";

export default function AdminCategoryPage({
  params,
}: PageProps<"/admin/categorias/[id]">) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<LoadingNotice label="Cargando categoría…" />}>
        <AdminCategory params={params} />
      </Suspense>
    </div>
  );
}

async function AdminCategory({
  params,
}: Pick<PageProps<"/admin/categorias/[id]">, "params">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const categoryId = Number(id);
  const path = { params: { path: { category_id: categoryId } } };

  const api = await getAdminApi();
  const [category, bracket, registrations] = await Promise.all([
    adminAttempt(api.GET("/api/v1/categories/{category_id}", path)),
    adminAttempt(api.GET("/api/v1/categories/{category_id}/bracket", path)),
    adminAttempt(
      api.GET("/api/v1/registrations", {
        params: { query: { category_id: categoryId } },
      }),
    ),
  ]);

  if (!category.ok) {
    if (category.error.status === 404) notFound();
    return <ErrorNotice message={category.error.message} />;
  }
  if (!bracket.ok && bracket.error.status !== 404) {
    return <ErrorNotice message={bracket.error.message} />;
  }
  if (!registrations.ok) {
    return <ErrorNotice message={registrations.error.message} />;
  }

  const tournament = await adminAttempt(
    api.GET("/api/v1/tournaments/{tournament_id}", {
      params: { path: { tournament_id: category.data.tournament_id } },
    }),
  );
  if (!tournament.ok) return <ErrorNotice message={tournament.error.message} />;

  const status = tournament.data.status;
  const registered = registrations.data.length;

  return (
    <>
      <Link
        href={`/admin/torneos/${tournament.data.id}`}
        className="w-fit text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← {tournament.data.name}
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {category.data.age_label} · {category.data.weight_label}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {genderLabels[category.data.gender]}
          {" · "}
          {formatAgeRange(category.data.min_age, category.data.max_age)}
          {" · "}
          {registered === 1 ? "1 inscrito" : `${registered} inscritos`}
        </p>
      </header>

      <StatusNotice status={status} />

      {bracket.ok ? (
        <>
          {status === "in_progress" && (
            <ScoringSection bracket={bracket.data} category={category.data} />
          )}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Llave</h2>
            <BracketView bracket={bracket.data} />
          </section>
        </>
      ) : status === "in_progress" && registered >= 2 ? (
        <GenerateBracket categoryId={categoryId} registered={registered} />
      ) : (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {registered < 2
            ? `Hacen falta al menos 2 inscritos para generar la llave (hay ${registered}).`
            : "La llave todavía no fue sorteada."}
        </p>
      )}
    </>
  );
}

function StatusNotice({ status }: { status: TournamentStatus }) {
  if (status === "in_progress") return null;
  return (
    <p
      role="status"
      className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
    >
      {status === "draft"
        ? "El torneo todavía no empezó. Inícialo para generar la llave y anotar resultados."
        : "El torneo está finalizado: los resultados ya no se pueden cambiar."}
    </p>
  );
}

function ScoringSection({
  bracket,
  category,
}: {
  bracket: Bracket;
  category: Category;
}) {
  const ready = matchesToScore(bracket.matches);
  const roundNames = new Map(
    groupRounds(bracket.matches).map((round) => [round.number, round.name]),
  );

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Para anotar</h2>
      {ready.length > 0 ? (
        <ul className="grid gap-4 lg:grid-cols-2">
          {ready.map((match) => (
            <li key={match.id}>
              <MatchScoreForm
                match={match}
                roundName={roundNames.get(match.round_number)!}
                roundsToWin={category.rounds_to_win}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {pendingMatchCount(bracket.matches) === 0
            ? "Todos los combates de esta llave están terminados."
            : "No hay combates listos: esperan el resultado de otros combates."}
        </p>
      )}
    </section>
  );
}
