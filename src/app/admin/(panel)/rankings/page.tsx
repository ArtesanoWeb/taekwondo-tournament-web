import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rankings" };

// Prototype with sample data: the API publishes rankings from its 0.8.0. Same points as planned
// there: gold 7, silver 3, bronze 1 (one bronze per category).
const POINTS = { gold: 7, silver: 3, bronze: 1 };
const sampleClubs = [
  { name: "Club Cóndor", gold: 4, silver: 2, bronze: 3 },
  { name: "Dojang Illimani", gold: 3, silver: 4, bronze: 1 },
  { name: "Escuela Tunari", gold: 2, silver: 3, bronze: 4 },
  { name: "Club Pumas", gold: 2, silver: 1, bronze: 2 },
  { name: "Academia Sajama", gold: 1, silver: 2, bronze: 3 },
  { name: "Tigres del Sur", gold: 0, silver: 1, bronze: 2 },
];

const ranking = sampleClubs
  .map((club) => ({
    ...club,
    points:
      club.gold * POINTS.gold +
      club.silver * POINTS.silver +
      club.bronze * POINTS.bronze,
  }))
  .toSorted((a, b) => b.points - a.points || b.gold - a.gold);

const medalClass = {
  gold: "bg-amber-400 text-amber-950",
  silver: "bg-zinc-300 text-zinc-900",
  bronze: "bg-orange-300 text-orange-950",
};

export default function RankingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Rankings</h1>

      <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        <strong>Prototipo con datos de ejemplo.</strong> Los clubes y las
        medallas son inventados; el ranking real llegará cuando la API lo
        publique.
      </p>

      <section aria-labelledby="ranking-clubes" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="ranking-clubes" className="text-xl font-semibold">
            Ranking de clubes
          </h2>
          <span className="text-xs text-zinc-500">
            Oro {POINTS.gold} · Plata {POINTS.silver} · Bronce {POINTS.bronze}
          </span>
        </div>

        <ol className="flex flex-col gap-3">
          {ranking.map((club, index) => (
            <li
              key={club.name}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums ${
                  index === 0
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate font-semibold">{club.name}</span>
                <div className="flex gap-1.5 text-xs font-medium tabular-nums">
                  {(["gold", "silver", "bronze"] as const).map((medal) => (
                    <span
                      key={medal}
                      className={`rounded-full px-2 py-0.5 ${medalClass[medal]}`}
                    >
                      <span className="sr-only">
                        {
                          { gold: "Oro", silver: "Plata", bronze: "Bronce" }[
                            medal
                          ]
                        }
                        :{" "}
                      </span>
                      {club[medal]}
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
      </section>
    </div>
  );
}
