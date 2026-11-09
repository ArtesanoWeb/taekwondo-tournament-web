"use client";

import type { Bracket, Match } from "@/lib/api/types";
import { currentRoundIndex, groupRounds, roundsWon } from "@/lib/bracket";
import { matchStatusLabels } from "@/lib/labels";

import { useSwipeTabs } from "./use-swipe-tabs";

/**
 * Below `lg`: one round at a time, swiping or tapping the bar on top, because a full bracket
 * doesn't fit a phone. From `lg` up: the classic bracket, with every round in a column.
 */
export function BracketView({ bracket }: { bracket: Bracket }) {
  const rounds = groupRounds(bracket.matches);
  const { active, scrollerRef, panelRef, goTo, onScroll } = useSwipeTabs(
    currentRoundIndex(rounds),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex border-b border-zinc-200 lg:hidden dark:border-zinc-800">
        {rounds.map((round, index) => (
          <button
            key={round.number}
            type="button"
            aria-pressed={index === active}
            aria-label={round.name}
            onClick={() => goTo(index)}
            className={`-mb-px min-w-0 flex-1 border-b-2 px-1 py-3 text-sm ${
              index === active
                ? "border-blue-600 font-semibold text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {round.shortName}
          </button>
        ))}
      </div>

      <ol
        ref={(element) => {
          scrollerRef.current = element;
        }}
        onScroll={onScroll}
        className="flex h-(--panel-height) snap-x snap-mandatory [scrollbar-width:none] items-start overflow-x-auto overflow-y-hidden lg:-mx-4 lg:h-auto lg:snap-none lg:[scrollbar-width:auto] lg:items-stretch lg:gap-8 lg:px-4 lg:pb-4"
      >
        {rounds.map((round, index) => (
          <li
            key={round.number}
            ref={panelRef(index)}
            className="flex w-full shrink-0 snap-start flex-col lg:w-60"
          >
            <h3 className="mb-1 hidden text-sm font-semibold tracking-wide text-zinc-500 uppercase lg:block">
              {round.name}
            </h3>
            {/* From `lg` up, every round has half the matches of the previous one, so each cell is
                twice as tall and its two feeder matches are centered at 25% and 75% of its height. */}
            <ul className="flex flex-1 flex-col">
              {round.matches.map((match) => (
                <li
                  key={match.id}
                  className="relative flex flex-1 items-center py-2"
                >
                  {index > 0 && <Connector />}
                  <MatchCard match={match} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Lines from the two feeder matches (gap-8 to the left) into this one. */
function Connector() {
  const line =
    "pointer-events-none absolute hidden border-zinc-300 lg:block dark:border-zinc-700";
  return (
    <>
      <span
        aria-hidden
        className={`${line} top-1/4 bottom-1/4 -left-8 w-4 rounded-r-md border-y border-r`}
      />
      <span aria-hidden className={`${line} top-1/2 -left-4 w-4 border-t`} />
    </>
  );
}

function MatchCard({ match }: { match: Match }) {
  const won = roundsWon(match);
  const hasScores = match.round_scores.length > 0;
  const isBye = match.status === "bye";
  const emptySideLabel = isBye ? "Sin rival" : "Por definir";

  const side = (color: "red" | "blue") => {
    const athleteId =
      color === "red" ? match.athlete_red_id : match.athlete_blue_id;
    return {
      color,
      name:
        (color === "red" ? match.athlete_red_name : match.athlete_blue_name) ??
        null,
      emptyLabel: emptySideLabel,
      isWinner: match.winner_id !== null && match.winner_id === athleteId,
      isLoser:
        match.status === "finished" &&
        athleteId !== null &&
        match.winner_id !== athleteId,
      roundsWon: hasScores ? won[color] : null,
    };
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm dark:border-zinc-800 dark:bg-zinc-950">
      <Side {...side("red")} />
      <div className="border-t border-zinc-100 dark:border-zinc-800" />
      <Side {...side("blue")} />
      <p className="border-t border-zinc-100 bg-zinc-50 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        {matchStatusLabels[match.status]}
      </p>
    </div>
  );
}

type SideProps = {
  color: "red" | "blue";
  name: string | null;
  emptyLabel: string;
  isWinner: boolean;
  isLoser: boolean;
  roundsWon: number | null;
};

function Side({
  color,
  name,
  emptyLabel,
  isWinner,
  isLoser,
  roundsWon,
}: SideProps) {
  const tone = isWinner ? "font-semibold" : isLoser ? "text-zinc-500" : "";

  return (
    <div className={`flex items-center gap-2 py-2 pr-3 ${tone}`}>
      <span
        aria-hidden
        className={`h-5 w-1 shrink-0 ${color === "red" ? "bg-hong" : "bg-chung"}`}
      />
      <span className="sr-only">{color === "red" ? "Rojo:" : "Azul:"}</span>
      {name ? (
        <span className="min-w-0 flex-1 truncate" title={name}>
          {name}
        </span>
      ) : (
        <span className="flex-1 text-zinc-400 italic">{emptyLabel}</span>
      )}
      {roundsWon !== null && (
        <span className="tabular-nums" aria-label={`${roundsWon} rounds`}>
          {roundsWon}
        </span>
      )}
    </div>
  );
}
