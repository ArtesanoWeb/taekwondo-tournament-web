import Link from "next/link";

export default function TournamentNotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        Torneo no encontrado
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        El torneo que buscas no existe o ya no está disponible.
      </p>
      <Link
        href="/"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Ver todos los torneos
      </Link>
    </div>
  );
}
