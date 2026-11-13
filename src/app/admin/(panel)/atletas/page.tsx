import type { Metadata } from "next";
import { Suspense } from "react";

import { primaryButtonClass } from "@/components/button-classes";
import { ErrorNotice } from "@/components/error-notice";
import { floatingAddClass, PlusIcon } from "@/components/floating-add";
import { LoadingNotice } from "@/components/loading-notice";
import { adminAttempt, getAdminApi } from "@/lib/session";

import { AthleteBrowser } from "./athlete-browser";
import { AthleteDialogButton } from "./athlete-dialog";

export const metadata: Metadata = { title: "Atletas" };

export default function AdminAthletesPage({
  searchParams,
}: PageProps<"/admin/atletas">) {
  return (
    // Below `sm`, room under the list for the floating button.
    <div className="flex flex-col gap-6 max-sm:pb-20">
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

  // The whole list, once: searching and filtering happen in the browser (AthleteBrowser).
  const api = await getAdminApi();
  const [athletes, clubs] = await Promise.all([
    adminAttempt(api.GET("/api/v1/athletes")),
    adminAttempt(api.GET("/api/v1/clubs")),
  ]);
  if (!athletes.ok) return <ErrorNotice message={athletes.error.message} />;
  if (!clubs.ok) return <ErrorNotice message={clubs.error.message} />;

  return (
    <>
      {/* The navigation already says where we are; the heading stays for screen readers. */}
      <h1 className="sr-only">Atletas</h1>
      <div className="hidden justify-end sm:flex">
        <AthleteDialogButton
          clubs={clubs.data}
          className={primaryButtonClass}
        />
      </div>
      <AthleteDialogButton clubs={clubs.data} className={floatingAddClass}>
        <PlusIcon />
      </AthleteDialogButton>

      <AthleteBrowser
        athletes={athletes.data}
        clubs={clubs.data}
        initialQuery={query}
      />
    </>
  );
}
