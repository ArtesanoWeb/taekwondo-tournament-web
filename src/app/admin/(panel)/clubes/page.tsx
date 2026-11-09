import type { Metadata } from "next";
import { Suspense } from "react";

import {
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/button-classes";
import { ErrorNotice } from "@/components/error-notice";
import { LoadingNotice } from "@/components/loading-notice";
import { adminAttempt, getAdminApi } from "@/lib/session";

import { ClubDialogButton } from "./club-dialog";

export const metadata: Metadata = { title: "Clubes" };

export default function AdminClubsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Clubes</h1>
        <ClubDialogButton className={primaryButtonClass} />
      </div>
      <Suspense fallback={<LoadingNotice label="Cargando clubes…" />}>
        <ClubList />
      </Suspense>
    </div>
  );
}

async function ClubList() {
  const api = await getAdminApi();
  const clubs = await adminAttempt(api.GET("/api/v1/clubs"));
  if (!clubs.ok) return <ErrorNotice message={clubs.error.message} />;

  if (clubs.data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Todavía no hay clubes.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {clubs.data.map((club) => (
        <li
          key={club.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <h2 className="min-w-0 font-semibold break-words">{club.name}</h2>
          <ClubDialogButton
            club={club}
            className={`${secondaryButtonClass} shrink-0`}
          />
        </li>
      ))}
    </ul>
  );
}
