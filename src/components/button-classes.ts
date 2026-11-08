// In a plain module, not in a "use client" one: a Server Component that imports a constant from a
// client module gets a reference instead of the string, which breaks when it's concatenated.
const buttonClass =
  "rounded-md px-4 py-2.5 text-sm font-medium disabled:opacity-60";
export const primaryButtonClass = `${buttonClass} bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300`;
export const secondaryButtonClass = `${buttonClass} border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800`;
