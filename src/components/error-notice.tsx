"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type ErrorNoticeProps = {
  message: string;
  /** Defaults to re-rendering the current route on the server, which repeats its API requests. */
  onRetry?: () => void;
};

export function ErrorNotice({ message, onRetry }: ErrorNoticeProps) {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  const retry = () => startRetry(() => (onRetry ?? router.refresh)());

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40"
    >
      <p className="text-red-800 dark:text-red-200">{message}</p>
      <button
        type="button"
        onClick={retry}
        disabled={isRetrying}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {isRetrying ? "Reintentando…" : "Reintentar"}
      </button>
    </div>
  );
}
