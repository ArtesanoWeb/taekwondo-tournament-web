"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { formatTime } from "@/lib/format";

/** Often enough to follow a match round by round, without hammering Render's free plan. */
const REFRESH_INTERVAL_MS = 20_000;

/**
 * Keeps a public page up to date while its tournament is being played: it asks the server for
 * the page again every few seconds, only while the browser tab is visible, and right away when
 * the visitor comes back to it. `router.refresh()` keeps the client state (the bracket's scroll,
 * the open tab); if the request fails, Next keeps showing the last page.
 *
 * `updatedAt` is when the server fetched the data on screen, so the time only moves when a
 * refresh actually brought new data.
 */
export function LiveRefresh({ updatedAt }: { updatedAt: string }) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(timer);
      } else {
        router.refresh();
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return (
    <p className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <span aria-hidden className="relative flex size-2.5">
        <span className="bg-hong absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none" />
        <span className="bg-hong relative inline-flex size-2.5 rounded-full" />
      </span>
      <span>
        <span className="text-hong font-semibold">En vivo</span>
        {" · "}
        Actualizado a las{" "}
        <time dateTime={updatedAt}>{formatTime(updatedAt)}</time>
      </span>
    </p>
  );
}
