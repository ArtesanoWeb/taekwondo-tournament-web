import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-16">
      <p className="text-hong text-sm font-semibold">Error 404</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Página no encontrada
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Volver a los torneos
      </Link>
    </div>
  );
}
