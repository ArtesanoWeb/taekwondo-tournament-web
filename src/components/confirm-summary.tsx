import type { ReactNode } from "react";

import type { SummaryRow } from "@/lib/confirm-summary";

import { Belt } from "./belt";

/**
 * The data a confirmation is about to save, one row per field. A row that changed while editing
 * shows its old value struck through above the new one.
 */
export function ConfirmSummary({
  rows,
  note,
}: {
  rows: SummaryRow[];
  /** A line under the data, such as what happens next. */
  note?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <dl className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 px-3 py-2"
          >
            <dt className="text-zinc-500 dark:text-zinc-400">{row.label}</dt>
            <dd className="flex min-w-0 flex-col text-zinc-950 dark:text-zinc-50">
              {row.previous !== undefined && (
                <span className="text-xs text-zinc-500 line-through dark:text-zinc-400">
                  <span className="sr-only">Antes: </span>
                  {row.previous}
                </span>
              )}
              <span
                className={`flex items-center gap-2 break-words ${row.previous !== undefined ? "font-semibold" : ""}`}
              >
                {row.previous !== undefined && (
                  <span className="sr-only">Ahora: </span>
                )}
                {row.grade && <Belt grade={row.grade} className="h-4 w-10" />}
                {row.value}
              </span>
            </dd>
          </div>
        ))}
      </dl>
      {note && <p>{note}</p>}
    </div>
  );
}
