"use client";

import { useEffect, useId, useRef } from "react";

import type { Match } from "@/lib/api/types";
import { roundRows, roundsWon } from "@/lib/bracket";
import { matchStatusLabels } from "@/lib/labels";

type Side = "red" | "blue";

/**
 * A match round by round, opened from a bracket card: who fought, the points of each round and
 * who won it, and how the match ended. It gets the match from the bracket on screen, so while
 * the page refreshes itself (`LiveRefresh`) a new round shows up here too.
 */
export function MatchDetailDialog({
  match,
  roundName,
  clubs,
  live,
  onClose,
}: {
  match: Match;
  /** «Semifinal», «Final»… */
  roundName: string;
  clubs: Record<number, string>;
  /** Ready to be fought: shown as the match being played. */
  live: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const rows = roundRows(match);
  const won = roundsWon(match);
  const isBye = match.status === "bye";
  const finished = match.status === "finished";
  const sides = (["red", "blue"] as const).map((color) => {
    const id = color === "red" ? match.athlete_red_id : match.athlete_blue_id;
    return {
      color,
      id,
      name: color === "red" ? match.athlete_red_name : match.athlete_blue_name,
      club: id !== null ? clubs[id] : undefined,
      isWinner: match.winner_id !== null && match.winner_id === id,
    };
  });
  const winner = sides.find((side) => side.isWinner);
  const status = live ? "Combate en curso" : matchStatusLabels[match.status];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // A tap on the backdrop (the dialog itself, outside its content) closes it.
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg bg-white text-zinc-950 shadow-xl backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-50"
    >
      <div className="flex flex-col gap-4 p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-lg font-semibold">
              {roundName} · Combate {match.slot + 1}
            </h2>
            <p
              className={`flex items-center gap-1.5 text-sm ${
                live
                  ? "font-semibold text-red-700 dark:text-red-300"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {live && (
                <span aria-hidden className="bg-hong size-2 rounded-full" />
              )}
              {status}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar"
            className="-m-2 rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {sides.map((side) => (
            <li
              key={side.color}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <span
                aria-hidden
                className={`h-8 w-1 shrink-0 rounded-full ${side.color === "red" ? "bg-hong" : "bg-chung"}`}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="sr-only">
                  {side.color === "red" ? "Rojo:" : "Azul:"}
                </span>
                {side.name ? (
                  <span
                    className={`break-words ${side.isWinner ? "font-semibold" : ""}`}
                  >
                    {side.name}
                  </span>
                ) : (
                  <span className="text-zinc-400 italic">
                    {isBye ? "Sin rival" : "Por definir"}
                  </span>
                )}
                {side.club && (
                  <span className="truncate text-xs text-zinc-500">
                    {side.club}
                  </span>
                )}
              </span>
              {side.isWinner && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                  Ganador
                </span>
              )}
              {rows.length > 0 && (
                <span
                  className="w-6 text-right text-xl font-semibold tabular-nums"
                  aria-label={`${won[side.color]} rounds ganados`}
                >
                  {won[side.color]}
                </span>
              )}
            </li>
          ))}
        </ul>

        {isBye ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {(winner ?? sides.find((side) => side.name))?.name ?? "El atleta"}{" "}
            pasa a la siguiente ronda sin combatir.
          </p>
        ) : rows.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            {live
              ? "Todavía no se cargó ningún round."
              : "Este combate todavía no se jugó."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Puntos por round</caption>
            <thead>
              <tr className="text-xs tracking-wide text-zinc-500 uppercase">
                <th scope="col" className="py-1 text-left font-semibold">
                  Round
                </th>
                <th scope="col" className="py-1 text-right font-semibold">
                  <span className="text-hong">Rojo</span>
                </th>
                <th scope="col" className="py-1 text-right font-semibold">
                  <span className="text-chung">Azul</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((row) => (
                <tr key={row.number}>
                  <th scope="row" className="py-2 text-left font-normal">
                    Round {row.number}
                  </th>
                  {(["red", "blue"] as Side[]).map((color) => (
                    <td
                      key={color}
                      className={`py-2 text-right tabular-nums ${
                        row.winner === color
                          ? "font-semibold"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {row.winner === color && (
                        <span className="sr-only">Ganó el round: </span>
                      )}
                      {color === "red" ? row.red : row.blue}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {finished && winner && rows.length > 0 && (
          <p className="text-sm">
            Ganó <strong>{winner.name}</strong>, {Math.max(won.red, won.blue)}{" "}
            rounds a {Math.min(won.red, won.blue)}.
          </p>
        )}
      </div>
    </dialog>
  );
}
