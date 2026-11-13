import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BracketView } from "@/components/bracket-view";
import { ErrorNotice } from "@/components/error-notice";
import { LoadingNotice } from "@/components/loading-notice";
import { TitleBar } from "@/components/title-bar";
import { formatAgeRange } from "@/lib/categories";
import { genderLabels } from "@/lib/labels";
import {
  canWithdraw,
  sortByAthleteName,
  toAthleteOptions,
} from "@/lib/registrations";
import { adminAttempt, getAdminApi } from "@/lib/session";

import { GenerateBracket } from "./generate-bracket";
import { RegisterAthleteButton } from "./register-athlete-dialog";
import { RegistrationList } from "./registration-list";
import { RegistrationsButton } from "./registrations-button";
import { ScoringBracket } from "./scoring-bracket";

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
  const roster = sortByAthleteName(registrations.data);
  // The bracket only has names: the club comes from the registrations.
  const clubs = Object.fromEntries(
    registrations.data.map((registration) => [
      registration.athlete_id,
      registration.athlete.club.name,
    ]),
  );

  // The whole roster is only needed while athletes can still be registered.
  const athletes = canWithdraw(status)
    ? await adminAttempt(api.GET("/api/v1/athletes"))
    : null;
  if (athletes && !athletes.ok) {
    return <ErrorNotice message={athletes.error.message} />;
  }

  return (
    <>
      <TitleBar
        title={`${category.data.age_label} · ${category.data.weight_label}`}
        parentHref={`/admin/torneos/${tournament.data.id}`}
        parentLabel={tournament.data.name}
        subtitle={
          <p>
            {genderLabels[category.data.gender]}
            {" · "}
            {formatAgeRange(category.data.min_age, category.data.max_age)}
            {" · "}
            {registered === 1 ? "1 inscrito" : `${registered} inscritos`}
          </p>
        }
      />

      {status === "draft" ? (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Inscritos</h2>
            {athletes?.ok && (
              <RegisterAthleteButton
                categoryId={categoryId}
                options={toAthleteOptions(athletes.data, registrations.data)}
              />
            )}
          </div>
          <RegistrationList registrations={roster} canWithdraw />
        </section>
      ) : (
        <>
          <RegistrationsButton registrations={roster} />
          {status === "finished" && (
            <p
              role="status"
              className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            >
              El torneo está finalizado: los resultados ya no se pueden cambiar.
            </p>
          )}
          {bracket.ok ? (
            status === "in_progress" ? (
              <ScoringBracket
                bracket={bracket.data}
                clubs={clubs}
                roundsToWin={category.data.rounds_to_win}
              />
            ) : (
              <BracketView bracket={bracket.data} clubs={clubs} />
            )
          ) : status === "in_progress" && registered >= 2 ? (
            <GenerateBracket categoryId={categoryId} registered={registered} />
          ) : (
            <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              {registered < 2
                ? `Hacen falta al menos 2 inscritos para generar la llave (hay ${registered}).`
                : "La llave no fue sorteada."}
            </p>
          )}
        </>
      )}
    </>
  );
}
