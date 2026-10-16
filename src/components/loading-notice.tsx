// Server Component on purpose: React doesn't hydrate the fallback of a Suspense boundary that is
// still streaming, so a client-side timer would never start while the API is waking up. The
// "waking up" hint is revealed by a delayed CSS animation instead (see `--animate-reveal-late`).
export function LoadingNotice({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <span
        aria-hidden
        className="border-t-hong mt-0.5 size-5 shrink-0 animate-spin rounded-full border-2 border-zinc-300 dark:border-zinc-700"
      />
      <div className="flex flex-col gap-1">
        <p className="font-medium">{label}</p>
        <p className="animate-reveal-late text-sm text-zinc-600 dark:text-zinc-400">
          Despertando el servidor, puede tardar hasta un minuto…
        </p>
      </div>
    </div>
  );
}
