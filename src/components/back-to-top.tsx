"use client";

import { useEffect, useRef, useState } from "react";

/** How far down, in px, before the button can show. */
const SHOW_AFTER = 400;

/** Scroll changes smaller than this (momentum, the address bar) don't change the direction. */
const JITTER = 6;

/**
 * On phones, a round arrow that drops in at the top of the screen while scrolling back up a long
 * page, and hides again when scrolling down: one tap back to the top.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y <= SHOW_AFTER) {
        setShow(false);
      } else if (Math.abs(y - lastY.current) >= JITTER) {
        setShow(y < lastY.current);
      } else {
        return;
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Volver arriba"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`fixed top-3 left-1/2 z-30 flex size-11 -translate-x-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-lg transition duration-200 active:bg-zinc-100 sm:hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:active:bg-zinc-800 ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-4 opacity-0"
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
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
