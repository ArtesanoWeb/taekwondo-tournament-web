import type { Metadata } from "next";
import { Suspense } from "react";

import {
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/button-classes";
import { ErrorNotice } from "@/components/error-notice";
import { floatingAddClass, PlusIcon } from "@/components/floating-add";
import { LoadingNotice } from "@/components/loading-notice";
import { adminAttempt, getAdminApi } from "@/lib/session";

import { ClubDialogButton } from "./club-dialog";

export const metadata: Metadata = { title: "Clubes" };

export default function AdminClubsPage() {
  return (
    // Below `sm`, room under the list for the floating button.
    <div className="flex flex-col gap-6 max-sm:pb-20">
      {/* The navigation already says where we are; the heading stays for screen readers. */}
      <h1 className="sr-only">Clubes</h1>
      <div className="hidden justify-end sm:flex">
        <ClubDialogButton className={primaryButtonClass} />
      </div>
      <ClubDialogButton className={floatingAddClass}>
        <PlusIcon />
      </ClubDialogButton>
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
