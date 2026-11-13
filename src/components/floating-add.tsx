/**
 * The phone's "new …" button: round, floating within thumb reach just above the bottom bar.
 * Only below `sm`; larger screens show a regular button at the top instead. A page that uses it
 * leaves room under its last item (`pb-20`) so the button doesn't cover it.
 */
export const floatingAddClass =
  "fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 flex size-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg active:bg-zinc-700 sm:hidden dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300";

export function PlusIcon() {
  return (
    <svg
      aria-hidden
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
