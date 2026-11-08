import type { Metadata } from "next";
import Link from "next/link";

import { TournamentForm } from "./tournament-form";

export const metadata: Metadata = { title: "Nuevo torneo" };

export default function NewTournamentPage() {
  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/torneos"
          className="text-sm text-zinc-600 underline-offset-2 hover:text-zinc-950 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Torneos
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo torneo</h1>
      </div>
      <TournamentForm />
    </div>
  );
}
