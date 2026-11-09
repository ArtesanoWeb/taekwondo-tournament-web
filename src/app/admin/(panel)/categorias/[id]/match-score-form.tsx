"use client";

import { useActionState, useRef, useState } from "react";

import { primaryButtonClass } from "@/components/button-classes";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DigitsInput } from "@/components/digits-input";
import { FormError } from "@/components/form-error";
import type { Match } from "@/lib/api/types";
import { roundsWon } from "@/lib/bracket";
import { parseRoundPoints, type RoundPoints } from "@/lib/scoring";

import { addRound, type RoundState } from "./actions";

type MatchScoreFormProps = {
  match: Match;
  roundName: string;
  roundsToWin: number;
};

export function MatchScoreForm({
  match,
  roundName,
  roundsToWin,
}: MatchScoreFormProps) {
  const [state, formAction, isPending] = useActionState<RoundState, FormData>(
    addRound,
    {},
  );
  const [localError, setLocalError] = useState<string>();
  const [preview, setPreview] = useState<RoundPoints>();
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const redName = match.athlete_red_name ?? "Rojo";
  const blueName = match.athlete_blue_name ?? "Azul";
  const won = roundsWon(match);
  const nextRound = match.round_scores.length + 1;

  const review = () => {
    const data = new FormData(formRef.current!);
    const parsed = parseRoundPoints(data.get("red"), data.get("blue"));
    if (!parsed.ok) {
      setLocalError(parsed.error);
      return;
    }
    setLocalError(undefined);
    setPreview(parsed.points);
    dialogRef.current?.showModal();
  };

  const winnerOfRound =
    preview && (preview.red > preview.blue ? redName : blueName);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <input type="hidden" name="matchId" value={match.id} />
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <h3 className="font-semibold">
          {roundName} · Combate {match.slot + 1}
        </h3>
        <span className="text-zinc-500">Al mejor de {roundsToWin * 2 - 1}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <PointsInput
          color="red"
          name={redName}
          roundsWon={won.red}
          defaultValue={state.red}
        />
        <PointsInput
          color="blue"
          name={blueName}
          roundsWon={won.blue}
          defaultValue={state.blue}
        />
      </div>

      {match.round_scores.length > 0 && (
        <ol className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          {match.round_scores.map((score) => (
            <li key={score.id} className="tabular-nums">
              Round {score.round_number}: {score.red_points} –{" "}
              {score.blue_points}
            </li>
          ))}
        </ol>
      )}

      <FormError message={localError ?? state.error} />

      <button
        type="button"
        onClick={review}
        disabled={isPending}
        className={`${primaryButtonClass} py-3 text-base`}
      >
        {isPending ? "Guardando…" : `Guardar round ${nextRound}`}
      </button>

      <ConfirmDialog
        dialogRef={dialogRef}
        title={`¿Guardar el round ${nextRound}?`}
        confirmLabel="Sí, guardar"
      >
        {preview && (
          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-base text-zinc-950 dark:text-zinc-50">
              <dt className="truncate">
                <ColorMark color="red" /> {redName}
              </dt>
              <dd className="font-semibold tabular-nums">{preview.red}</dd>
              <dt className="truncate">
                <ColorMark color="blue" /> {blueName}
              </dt>
              <dd className="font-semibold tabular-nums">{preview.blue}</dd>
            </dl>
            <p>
              Gana el round <strong>{winnerOfRound}</strong>. Quien llegue a{" "}
              {roundsToWin} rounds ganados gana el combate y pasa a la siguiente
              ronda.{" "}
              <strong className="text-zinc-950 dark:text-zinc-50">
                El round no se puede editar después.
              </strong>
            </p>
          </div>
        )}
      </ConfirmDialog>
    </form>
  );
}

function ColorMark({ color }: { color: "red" | "blue" }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-3 w-1.5 rounded-sm align-middle ${color === "red" ? "bg-hong" : "bg-chung"}`}
    />
  );
}

type PointsInputProps = {
  color: "red" | "blue";
  name: string;
  roundsWon: number;
  defaultValue?: string;
};

function PointsInput({
  color,
  name,
  roundsWon,
  defaultValue,
}: PointsInputProps) {
  return (
    <label className="flex min-w-0 flex-col justify-between gap-2">
      <span className="flex items-center gap-2 text-sm">
        <span
          aria-hidden
          className={`h-8 w-1.5 shrink-0 rounded-sm ${color === "red" ? "bg-hong" : "bg-chung"}`}
        />
        <span className="flex min-w-0 flex-col">
          <span className="line-clamp-2 font-medium break-words">{name}</span>
          <span className="text-xs text-zinc-500">
            {color === "red" ? "Rojo" : "Azul"} · {roundsWon}{" "}
            {roundsWon === 1 ? "round ganado" : "rounds ganados"}
          </span>
        </span>
      </span>
      <DigitsInput
        name={color}
        pattern="[0-9]*"
        autoComplete="off"
        placeholder="0"
        defaultValue={defaultValue}
        aria-label={`Puntos de ${name} (${color === "red" ? "rojo" : "azul"})`}
        className="h-14 w-full rounded-md border border-zinc-300 bg-white text-center text-3xl font-semibold tabular-nums outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
      />
    </label>
  );
}
