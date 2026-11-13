"use client";

import { useEffect, useState } from "react";

/**
 * On phones, a small magnifier floating just above the "+" (see `floating-add`). It shows up only
 * once the search field has scrolled out of view, and takes the admin back to it: from deep in a
 * long list, one tap to search again.
 */
export function SearchShortcut({ inputId }: { inputId: string }) {
  const [searchVisible, setSearchVisible] = useState(true);

  useEffect(() => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const observer = new IntersectionObserver(([entry]) =>
      setSearchVisible(entry.isIntersecting),
    );
    observer.observe(input);
    return () => observer.disconnect();
  }, [inputId]);

  const goToSearch = () => {
    const input = document.getElementById(inputId);
    if (!input) return;
    // Focus within the tap itself, or phones won't open the keyboard; the scroll then brings it up.
    input.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={goToSearch}
      aria-label="Ir a la búsqueda"
      aria-hidden={searchVisible}
      tabIndex={searchVisible ? -1 : 0}
      // Centered over the "+" (size-14 at right-4) and 0.75rem above it.
      className={`fixed right-[1.375rem] bottom-[calc(9.25rem+env(safe-area-inset-bottom))] z-30 flex size-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-lg transition-opacity active:bg-zinc-100 sm:hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:active:bg-zinc-800 ${
        searchVisible ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <svg
        aria-hidden
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    </button>
  );
}
