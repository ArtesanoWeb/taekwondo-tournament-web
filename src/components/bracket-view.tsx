import type { Bracket, Match } from "@/lib/api/types";
import { groupRounds, roundsWon } from "@/lib/bracket";
import { matchStatusLabels } from "@/lib/labels";

export function BracketView({ bracket }: { bracket: Bracket }) {
  const rounds = groupRounds(bracket.matches);

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-4">
      <ol className="flex min-w-max gap-8">
        {rounds.map((round, index) => (
          <li key={round.number} className="flex w-60 flex-col">
            <h3 className="mb-1 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
              {round.name}
            </h3>
            {/* Every round has half the matches of the previous one, so each cell is twice as
                tall and its two feeder matches are centered at 25% and 75% of its height. */}
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
