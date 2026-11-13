import type { Metadata } from "next";

import { TitleBar } from "@/components/title-bar";

import { TournamentForm } from "./tournament-form";

export const metadata: Metadata = { title: "Nuevo torneo" };

export default function NewTournamentPage() {
  return (
    <div className="flex max-w-lg flex-col gap-6">
      <TitleBar
        title="Nuevo torneo"
        parentHref="/admin/torneos"
        parentLabel="Torneos"
        icon="close"
      />
      <TournamentForm />
    </div>
  );
}
