import type { TournamentRanking } from "@/lib/api/ranking";
import { AWARD_POINTS, type Award } from "@/lib/ranking";

const awardLabels: Record<Award, string> = {
  gold: "Oro",
  silver: "Plata",
  bronze: "Bronce",
  walkover: "Sin pelea",
};

const awardClass: Record<Award, string> = {
  gold: "bg-amber-400 text-amber-950",
  silver: "bg-zinc-300 text-zinc-900",
  bronze: "bg-orange-300 text-orange-950",
  walkover:
    "border border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300",
};

const AWARDS = ["gold", "silver", "bronze", "walkover"] as const;

/**
 * A tournament's club ranking: one row per club with its medals and points. `showTitle={false}`
 * when the page's own title already says «Ranking de clubes» (the heading stays for screen
 * readers).
 */
export function ClubRanking({
  ranking,
  showTitle = true,
}: {
  ranking: TournamentRanking;
  showTitle?: boolean;
}) {
  const { standings, decided, total } = ranking;

  return (
    <section aria-labelledby="ranking-clubes" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2
          id="ranking-clubes"
          className={showTitle ? "text-xl font-semibold" : "sr-only"}
        >
          Ranking de clubes
        </h2>
        <span className="text-xs text-zinc-500">
          {AWARDS.map(
            (award) => `${awardLabels[award]} ${AWARD_POINTS[award]}`,
          ).join(" · ")}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {total === 1 && decided === 1
          ? "Con la única categoría del torneo."
          : decided === total
            ? `Con las ${total} categorías del torneo.`
            : `Con ${decided} de ${total} categorías: el resto suma cuando termine su final.`}
      </p>

      {standings.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Todavía no hay medallas. El ranking se arma a medida que terminan las
          finales.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {standings.map((club, index) => (
            <li
              key={club.club}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums ${
                  index === 0
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                <span className="sr-only">Puesto </span>
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate font-semibold">{club.club}</span>
                <div className="flex flex-wrap gap-1.5 text-xs font-medium tabular-nums">
                  {AWARDS.filter(
                    (award) => award !== "walkover" || club.walkover > 0,
                  ).map((award) => (
                    <span
                      key={award}
                      title={awardLabels[award]}
                      className={`rounded-full px-2 py-0.5 ${awardClass[award]}`}
                    >
                      <span className={award === "walkover" ? "" : "sr-only"}>
                        {awardLabels[award]}
                        {award === "walkover" ? " " : ": "}
                      </span>
                      {club[award]}
                    </span>
                  ))}
                </div>
              </div>
              <span className="shrink-0 text-right">
                <span className="block text-xl font-semibold tabular-nums">
                  {club.points}
                </span>
                <span className="text-xs text-zinc-500">puntos</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
