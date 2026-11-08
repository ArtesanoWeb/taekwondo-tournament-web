import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";

import {
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/button-classes";
import { ErrorNotice } from "@/components/error-notice";
import { LoadingNotice } from "@/components/loading-notice";
import { formatDate } from "@/lib/format";
import { genderLabels } from "@/lib/labels";
import { adminAttempt, getAdminApi } from "@/lib/session";

import { AthleteDialogButton } from "./athlete-dialog";

export const metadata: Metadata = { title: "Atletas" };

export default function AdminAthletesPage({
  searchParams,
}: PageProps<"/admin/atletas">) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<LoadingNotice label="Cargando atletas…" />}>
        <AthletesSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AthletesSection({
  searchParams,
}: Pick<PageProps<"/admin/atletas">, "searchParams">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const api = await getAdminApi();
  const [athletes, clubs] = await Promise.all([
    adminAttempt(
      api.GET("/api/v1/athletes", {
        params: { query: query ? { q: query } : {} },
      }),
    ),
    adminAttempt(api.GET("/api/v1/clubs")),
  ]);
  if (!athletes.ok) return <ErrorNotice message={athletes.error.message} />;
  if (!clubs.ok) return <ErrorNotice message={clubs.error.message} />;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Atletas</h1>
        <AthleteDialogButton
          clubs={clubs.data}
          className={primaryButtonClass}
        />
      </div>

      <Form action="/admin/atletas" role="search" className="flex gap-2">
        <input
          key={query}
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Buscar por nombre o CI"
          aria-label="Buscar por nombre o CI"
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
        />
        <button type="submit" className={secondaryButtonClass}>
          Buscar
        </button>
      </Form>

      {athletes.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {query
            ? `No se encontraron atletas para «${query}».`
            : "Todavía no hay atletas."}
        </p>
      ) : (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400" role="status">
            {athletes.data.length === 1
              ? "1 atleta"
              : `${athletes.data.length} atletas`}
            {query && (
              <>
                {" para «"}
                {query}
                {"» · "}
                <Link
                  href="/admin/atletas"
                  className="font-medium underline underline-offset-2"
                >
                  Ver todos
                </Link>
              </>
            )}
          </p>
          <ul className="flex flex-col gap-3">
            {athletes.data.map((athlete) => (
              <li
                key={athlete.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <h2 className="font-semibold">{athlete.name}</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {athlete.club.name}
                    {" · CI: "}
                    {athlete.ci ?? "sin CI"}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {genderLabels[athlete.gender]}
                    {" · "}
                    {formatDate(athlete.birth_date)}
                    {" · "}
                    {athlete.belt_rank}
                    {" · "}
                    {athlete.weight_kg} kg
                  </p>
                </div>
                <AthleteDialogButton
                  athlete={athlete}
                  clubs={clubs.data}
                  className={`${secondaryButtonClass} shrink-0`}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
