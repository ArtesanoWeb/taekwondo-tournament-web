import Link from "next/link";

/** The way into a tournament's club ranking, from the tournament page. */
export function RankingLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 active:bg-zinc-100 dark:border-zinc-800 dark:hover:border-zinc-600 dark:active:bg-zinc-800"
    >
      <span className="flex flex-col gap-0.5">
        <span className="font-semibold">Ranking de clubes</span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Medallas y puntos de cada club en este torneo
        </span>
      </span>
      <span aria-hidden className="text-xl text-zinc-400">
        →
      </span>
    </Link>
  );
}
