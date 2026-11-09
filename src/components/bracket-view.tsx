"use client";

import { useState } from "react";
import { flushSync } from "react-dom";

import type { Bracket, Match } from "@/lib/api/types";
import { currentRoundIndex, groupRounds, roundsWon } from "@/lib/bracket";
import { matchStatusLabels } from "@/lib/labels";

import { useSwipeTabs } from "./use-swipe-tabs";

// Width of a map column (`w-60`) plus the gap between columns (`gap-8`).
const MAP_COLUMN_PX = 240 + 32;

type BracketLayout = "column" | "map";

/**
 * Below `lg` it offers two views: one round at a time (swipe or tap the bar on top), or the map,
 * the whole bracket to pan sideways. From `lg` up there's room for the map, so no choice is shown.
 */
export function BracketView({
  bracket,
  selectableIds,
  onSelectMatch,
}: {
  bracket: Bracket;
  /** Matches that can be tapped, for the admin. Without them the bracket is read-only. */
  selectableIds?: Set<number>;
  onSelectMatch?: (matchId: number) => void;
}) {
  const rounds = groupRounds(bracket.matches);
  const { active, scrollerRef, panelRef, goTo, onScroll } = useSwipeTabs(
    currentRoundIndex(rounds),
  );
  const [layout, setLayout] = useState<BracketLayout>("column");
  const isMap = layout === "map";

  const changeLayout = (next: BracketLayout) => {
    // Synchronous so the scroll position below applies to the new layout: stays on the same round.
    flushSync(() => setLayout(next));
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.scrollLeft =
        active * (next === "map" ? MAP_COLUMN_PX : scroller.clientWidth);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label="Vista de la llave"
        className="flex w-fit rounded-md border border-zinc-300 p-0.5 lg:hidden dark:border-zinc-700"
      >
        {(
          [
            ["column", "Columna"],
            ["map", "Mapa"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={layout === value}
            data-layout={value}
            onClick={() => changeLayout(value)}
            className={`rounded px-4 py-1.5 text-sm ${
              layout === value
                ? "bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!isMap && (
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
      )}

      <ol
        ref={(element) => {
          scrollerRef.current = element;
        }}
        onScroll={isMap ? undefined : onScroll}
        className={
          isMap
            ? "-mx-4 flex items-stretch gap-8 overflow-x-auto px-4 pb-4"
            : "flex h-(--panel-height) snap-x snap-mandatory [scrollbar-width:none] items-start overflow-x-auto overflow-y-hidden lg:-mx-4 lg:h-auto lg:snap-none lg:[scrollbar-width:auto] lg:items-stretch lg:gap-8 lg:px-4 lg:pb-4"
        }
      >
        {rounds.map((round, index) => (
          <li
            key={round.number}
            ref={panelRef(index)}
            className={
              isMap
                ? "flex w-60 shrink-0 flex-col"
                : "flex w-full shrink-0 snap-start flex-col lg:w-60"
            }
          >
            <h3
              className={`mb-1 text-sm font-semibold tracking-wide text-zinc-500 uppercase ${
                isMap ? "" : "hidden lg:block"
              }`}
            >
              {round.name}
            </h3>
            {/* In the map, every round has half the matches of the previous one, so each cell is
                twice as tall and its two feeder matches are centered at 25% and 75% of its height. */}
            <ul className="flex flex-1 flex-col">
              {round.matches.map((match) => (
                <li
                  key={match.id}
                  className="relative flex flex-1 items-center py-2"
                >
                  {index > 0 && <Connector alwaysVisible={isMap} />}
                  <MatchCard
                    match={match}
                    onSelect={
                      selectableIds?.has(match.id)
                        ? () => onSelectMatch?.(match.id)
                        : undefined
                    }
                  />
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
function Connector({ alwaysVisible }: { alwaysVisible: boolean }) {
  const line = `pointer-events-none absolute border-zinc-300 dark:border-zinc-700 ${alwaysVisible ? "" : "hidden lg:block"}`;
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

function MatchCard({
  match,
  onSelect,
}: {
  match: Match;
  onSelect?: () => void;
}) {
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
    <div
      className={`relative w-full overflow-hidden rounded-lg border bg-white text-sm dark:bg-zinc-950 ${
        onSelect
          ? "border-blue-500 ring-1 ring-blue-500/40 dark:border-blue-400"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <Side {...side("red")} />
      <div className="border-t border-zinc-100 dark:border-zinc-800" />
      <Side {...side("blue")} />
      <p
        className={`border-t px-3 py-1 text-xs ${
          onSelect
            ? "border-blue-100 bg-blue-50 font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
            : "border-zinc-100 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
        }`}
      >
        {onSelect ? "Tocar para anotar" : matchStatusLabels[match.status]}
      </p>
      {onSelect && (
        // Laid over the card: a <button> can't contain the card's block markup.
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Anotar: ${match.athlete_red_name} contra ${match.athlete_blue_name}`}
          className="absolute inset-0 active:bg-blue-500/10"
        />
      )}
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
