"use client";

import { useLayoutEffect, useRef, useState } from "react";

import type { Bracket, Match } from "@/lib/api/types";
import {
  podium,
  currentRoundIndex,
  groupRounds,
  hasMatchDetail,
  matchesToScore,
  roundsWon,
} from "@/lib/bracket";
import { matchStatusLabels } from "@/lib/labels";
import { recall, remember } from "@/lib/scroll-memory";

import { MatchDetailDialog } from "./match-detail-dialog";
import { Medal } from "./medal";
import { RestoreScrollScript } from "./restore-scroll-script";

// Width of a column (`w-60`) plus the gap between columns (`gap-8`).
const COLUMN_PX = 240 + 32;

/**
 * The bracket as a map: one column per round, joined by lines. On phones it pans sideways and
 * opens on the round being played; from `lg` up it usually fits and starts at the beginning.
 */
export function BracketView({
  bracket,
  selectableIds,
  onSelectMatch,
  clubs = {},
}: {
  bracket: Bracket;
  /** Each athlete's club by athlete id, shown under the names. The bracket only has names. */
  clubs?: Record<number, string>;
  /** Matches that can be tapped, for the admin. Without them the bracket is read-only. */
  selectableIds?: Set<number>;
  onSelectMatch?: (matchId: number) => void;
}) {
  const rounds = groupRounds(bracket.matches);
  // By id, read from the bracket on each render: a refreshed bracket updates the open detail.
  const [detailId, setDetailId] = useState<number | null>(null);
  const detail = bracket.matches.find((match) => match.id === detailId);
  // For visitors, the matches the admin can score now: both athletes known and not fought yet.
  const liveIds = selectableIds
    ? new Set<number>()
    : new Set(matchesToScore(bracket.matches).map((match) => match.id));
  const initialRound = currentRoundIndex(rounds);
  const scrollerRef = useRef<HTMLOListElement>(null);
  const places = podium(bracket.matches);

  const memoryKey = `llave:${bracket.id}`;

  // Only on mount: back where it was left in this browser tab or, the first time, on the current
  // round (below `lg`). Afterwards the map is panned freely.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const stored = recall(memoryKey);
    if (stored !== null) {
      scroller.scrollLeft = stored;
    } else if (!window.matchMedia("(min-width: 64rem)").matches) {
      scroller.scrollLeft = initialRound * COLUMN_PX;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {places && <PodiumCard {...places} clubs={clubs} />}
      {/* The line spans the screen on phones, like the title bar's; on larger screens it lines
          up with the content while the map itself still pans past the edges. */}
      <div className="border-t border-zinc-200 pt-4 max-sm:-mx-4 dark:border-zinc-800">
        <ol
          ref={scrollerRef}
          onScroll={(event) =>
            remember(memoryKey, event.currentTarget.scrollLeft)
          }
          aria-label="Llave"
          className="flex items-stretch gap-8 overflow-x-auto px-4 sm:-mx-4 sm:pb-4"
        >
          {rounds.map((round, index) => (
            <li key={round.number} className="flex w-60 shrink-0 flex-col">
              <h3 className="mb-1 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
                {round.name}
              </h3>
              {/* Every round has half the matches of the previous one, so each cell is twice as tall
                  and its two feeder matches are centered at 25% and 75% of its height. */}
              <ul className="flex flex-1 flex-col">
                {round.matches.map((match) => (
                  <li
                    key={match.id}
                    className="relative flex flex-1 items-center py-2"
                  >
                    {index > 0 && <Connector />}
                    <MatchCard
                      match={match}
                      clubs={clubs}
                      live={liveIds.has(match.id)}
                      onSelect={
                        selectableIds?.has(match.id)
                          ? () => onSelectMatch?.(match.id)
                          : undefined
                      }
                      onOpen={
                        hasMatchDetail(match)
                          ? () => setDetailId(match.id)
                          : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <RestoreScrollScript storageKey={memoryKey} mode="offset" />
      </div>
      {detail && (
        <MatchDetailDialog
          key={detail.id}
          match={detail}
          roundName={
            rounds.find((round) => round.number === detail.round_number)
              ?.name ?? ""
          }
          clubs={clubs}
          live={liveIds.has(detail.id)}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}

/** Lines from the two feeder matches (gap-8 to the left) into this one. */
function Connector() {
  const line =
    "pointer-events-none absolute border-zinc-300 dark:border-zinc-700";
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
  clubs,
  live = false,
  onSelect,
  onOpen,
}: {
  match: Match;
  clubs: Record<number, string>;
  /** Ready to be fought: highlighted for visitors as the match being played. */
  live?: boolean;
  onSelect?: () => void;
  /** Opens the match round by round; scoring (`onSelect`) takes precedence for the admin. */
  onOpen?: () => void;
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
      club: athleteId !== null ? (clubs[athleteId] ?? null) : null,
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
          : live
            ? "border-hong ring-hong/30 ring-1"
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
            : live
              ? "flex items-center gap-1.5 border-red-100 bg-red-50 font-semibold text-red-700 dark:border-red-950 dark:bg-red-950/40 dark:text-red-300"
              : "border-zinc-100 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
        }`}
      >
        {onSelect ? (
          "Tocar para anotar"
        ) : live ? (
          <>
            <span aria-hidden className="relative flex size-2">
              <span className="bg-hong absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none" />
              <span className="bg-hong relative inline-flex size-2 rounded-full" />
            </span>
            Combate en curso
          </>
        ) : (
          matchStatusLabels[match.status]
        )}
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
      {!onSelect && onOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Ver combate: ${match.athlete_red_name ?? "por definir"} contra ${match.athlete_blue_name ?? "por definir"}`}
          className="absolute inset-0 hover:bg-zinc-500/5 active:bg-zinc-500/10"
        />
      )}
    </div>
  );
}

type SideProps = {
  color: "red" | "blue";
  name: string | null;
  club: string | null;
  emptyLabel: string;
  isWinner: boolean;
  isLoser: boolean;
  roundsWon: number | null;
};

function Side({
  color,
  name,
  club,
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
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate" title={name}>
            {name}
          </span>
          {club && (
            <span
              className="truncate text-xs font-normal text-zinc-500"
              title={club}
            >
              {club}
            </span>
          )}
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

type Place = { id: number; name: string } | null;

/**
 * Once the final is over: the champion highlighted, then second and third place (see `podium`).
 * A place nobody earned (no semifinal, or a bye) is left out.
 */
function PodiumCard({
  gold,
  silver,
  bronze,
  clubs,
}: {
  gold: NonNullable<Place>;
  silver: Place;
  bronze: Place;
  clubs: Record<number, string>;
}) {
  return (
    <section
      aria-label="Podio"
      className="overflow-hidden rounded-lg border border-amber-300 dark:border-amber-800"
    >
      <div className="flex items-center gap-3 bg-amber-50 p-4 dark:bg-amber-950/40">
        <span className="flex w-9 justify-center">
          <Medal place={1} className="h-11 w-9" />
        </span>
        <PlaceText
          label="Campeón"
          labelClass="text-amber-800 dark:text-amber-300"
          nameClass="text-lg"
          place={gold}
          club={clubs[gold.id] ?? null}
        />
      </div>
      {(silver || bronze) && (
        <ul className="divide-y divide-zinc-200 border-t border-amber-300 dark:divide-zinc-800 dark:border-amber-800">
          {silver && (
            <li className="flex items-center gap-3 px-4 py-3">
              <span className="flex w-9 justify-center">
                <Medal place={2} className="h-9 w-7" />
              </span>
              <PlaceText
                label="Segundo lugar"
                labelClass="text-zinc-500"
                place={silver}
                club={clubs[silver.id] ?? null}
              />
            </li>
          )}
          {bronze && (
            <li className="flex items-center gap-3 px-4 py-3">
              <span className="flex w-9 justify-center">
                <Medal place={3} className="h-9 w-7" />
              </span>
              <PlaceText
                label="Tercer lugar"
                labelClass="text-orange-700 dark:text-orange-300"
                place={bronze}
                club={clubs[bronze.id] ?? null}
              />
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

function PlaceText({
  label,
  labelClass,
  nameClass = "",
  place,
  club,
}: {
  label: string;
  labelClass: string;
  nameClass?: string;
  place: NonNullable<Place>;
  club: string | null;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <span
        className={`text-xs font-semibold tracking-wide uppercase ${labelClass}`}
      >
        {label}
      </span>
      <span className={`truncate font-semibold ${nameClass}`}>
        {place.name}
      </span>
      {club && (
        <span className="truncate text-sm text-zinc-600 dark:text-zinc-400">
          {club}
        </span>
      )}
    </div>
  );
}
