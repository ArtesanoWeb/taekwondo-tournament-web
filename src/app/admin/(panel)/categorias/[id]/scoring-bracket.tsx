"use client";

import { useEffect, useRef, useState } from "react";

import { BracketView } from "@/components/bracket-view";
import type { Bracket, Match } from "@/lib/api/types";
import { groupRounds, matchesToScore } from "@/lib/bracket";

import { MatchScoreForm } from "./match-score-form";

type ScoringBracketProps = { bracket: Bracket; roundsToWin: number };

/** The bracket as the main screen of a live category: tapping a ready match opens its scoring. */
export function ScoringBracket({ bracket, roundsToWin }: ScoringBracketProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const ready = matchesToScore(bracket.matches);
  // Derived from the fresh data, so the dialog closes by itself once the match has a winner.
  const selected = ready.find((match) => match.id === selectedId);
  const roundNames = new Map(
    groupRounds(bracket.matches).map((round) => [round.number, round.name]),
  );

  return (
    <div className="flex flex-col gap-3">
      {ready.length > 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {ready.length === 1
            ? "1 combate para anotar"
            : `${ready.length} combates para anotar`}
        </p>
      )}
      <BracketView
        bracket={bracket}
        selectableIds={new Set(ready.map((match) => match.id))}
        onSelectMatch={setSelectedId}
      />
      {selected && (
        <ScoreDialog
          key={selected.id}
          match={selected}
          roundName={roundNames.get(selected.round_number)!}
          roundsToWin={roundsToWin}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function ScoreDialog({
  match,
  roundName,
  roundsToWin,
  onClose,
}: {
  match: Match;
  roundName: string;
  roundsToWin: number;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState<string>();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={(event) => {
        // React bubbles `close`: the confirmation dialog nested in the form must not close this one.
        if (event.target === dialogRef.current) onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-label={`Anotar ${roundName}`}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg bg-white text-zinc-950 shadow-xl backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-50"
    >
      {/* `key`: each saved round starts with empty fields. The padding is on the content so a
          click on the backdrop is the only one that targets the dialog itself. */}
      <div className="p-5">
        <MatchScoreForm
          key={match.round_scores.length}
          match={match}
          roundName={roundName}
          roundsToWin={roundsToWin}
          onCancel={() => dialogRef.current?.close()}
          notice={notice}
          onNoticeChange={setNotice}
        />
      </div>
    </dialog>
  );
}
