import type { Bracket, Match } from "@/lib/api/types";
import { groupRounds, roundsWon } from "@/lib/bracket";

export function BracketView({ bracket }: { bracket: Bracket }) {
  const rounds = groupRounds(bracket.matches);

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-4">
      <ol className="flex min-w-max gap-6">
        {rounds.map((round) => (
          <li key={round.number} className="flex w-60 flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
              {round.name}
            </h3>
            <ul className="flex flex-1 flex-col justify-around gap-4">
              {round.matches.map((match) => (
                <li key={match.id}>
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

function MatchCard({ match }: { match: Match }) {
  const won = roundsWon(match);
  const showScore = match.round_scores.length > 0;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm dark:border-zinc-800 dark:bg-zinc-950">
      <Side
        side="red"
        name={match.athlete_red_name}
        isWinner={
          match.winner_id !== null && match.winner_id === match.athlete_red_id
        }
        isDecided={match.winner_id !== null}
        roundsWon={showScore ? won.red : null}
      />
      <div className="border-t border-zinc-100 dark:border-zinc-800" />
      <Side
        side="blue"
        name={match.athlete_blue_name}
        isWinner={
          match.winner_id !== null && match.winner_id === match.athlete_blue_id
        }
        isDecided={match.winner_id !== null}
        roundsWon={showScore ? won.blue : null}
      />
    </div>
  );
}

type SideProps = {
  side: "red" | "blue";
  name: string | null | undefined;
  isWinner: boolean;
  isDecided: boolean;
  roundsWon: number | null;
};

function Side({ side, name, isWinner, isDecided, roundsWon }: SideProps) {
  const tone = isWinner
    ? "font-semibold"
    : isDecided
      ? "text-zinc-500 dark:text-zinc-500"
      : "";

  return (
    <div className={`flex items-center gap-2 py-2 pr-3 ${tone}`}>
      <span
        aria-hidden
        className={`h-5 w-1 shrink-0 ${side === "red" ? "bg-hong" : "bg-chung"}`}
      />
      <span className="sr-only">{side === "red" ? "Rojo:" : "Azul:"}</span>
      <span className="min-w-0 flex-1 truncate" title={name ?? undefined}>
        {name ?? <span className="text-zinc-400">—</span>}
      </span>
      {roundsWon !== null && (
        <span className="tabular-nums" aria-label={`${roundsWon} rounds`}>
          {roundsWon}
        </span>
      )}
    </div>
  );
}
