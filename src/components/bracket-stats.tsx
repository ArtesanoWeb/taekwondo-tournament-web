import type { BracketStats } from "@/lib/bracket";

/** Matches and athletes, for the empty side of a tournament or category card. */
export function BracketStatsSummary({
  stats,
  emptyLabel,
}: {
  /** `null` when no bracket has been drawn yet. */
  stats: BracketStats | null;
  emptyLabel: string;
}) {
  if (!stats) {
    return (
      <p className="shrink-0 text-right text-sm text-zinc-500">{emptyLabel}</p>
    );
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 text-right text-sm text-zinc-600 dark:text-zinc-400">
      <Stat value={stats.matches} one="combate" many="combates" />
      <Stat value={stats.athletes} one="atleta" many="atletas" />
    </div>
  );
}

function Stat({
  value,
  one,
  many,
}: {
  value: number;
  one: string;
  many: string;
}) {
  return (
    <p>
      <span className="font-semibold text-zinc-950 dark:text-zinc-50">
        {value}
      </span>{" "}
      {value === 1 ? one : many}
    </p>
  );
}
