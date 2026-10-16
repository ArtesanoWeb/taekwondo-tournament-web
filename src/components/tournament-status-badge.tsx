import type { TournamentStatus } from "@/lib/api/types";
import { tournamentStatusLabels } from "@/lib/labels";

const statusStyles: Record<TournamentStatus, string> = {
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  in_progress:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  finished: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export function TournamentStatusBadge({
  status,
}: {
  status: TournamentStatus;
}) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {tournamentStatusLabels[status]}
    </span>
  );
}
