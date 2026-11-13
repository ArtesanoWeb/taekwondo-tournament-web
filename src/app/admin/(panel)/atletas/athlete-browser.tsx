"use client";

import {
  type FormEvent,
  type PointerEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { secondaryButtonClass } from "@/components/button-classes";
import { SearchShortcut } from "@/components/search-shortcut";
import type { Athlete, Club, Gender } from "@/lib/api/types";
import {
  ALPHABET,
  type AthleteFilters,
  compareNames,
  filterAthletes,
  letterOf,
  NO_FILTERS,
  suggestions,
} from "@/lib/athlete-search";
import { formatDate } from "@/lib/format";
import { genderLabels } from "@/lib/labels";

import { AthleteDialogButton } from "./athlete-dialog";

const SEARCH_ID = "athlete-search";
const inputClass =
  "min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10";
const chipClass = (selected: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm ${
    selected
      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
      : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
  }`;

/**
 * The athletes list, searched and filtered here with the whole list already loaded: suggestions
 * while typing (#92), club and gender filters (#94) and, on phones, an alphabet to jump by
 * letter (#93).
 */
export function AthleteBrowser({
  athletes,
  clubs,
  initialQuery,
}: {
  athletes: Athlete[];
  clubs: Club[];
  initialQuery: string;
}) {
  const [filters, setFilters] = useState<AthleteFilters>({
    ...NO_FILTERS,
    query: initialQuery,
  });
  // Bumped by "Limpiar" so the search box starts over with an empty text.
  const [resets, setResets] = useState(0);
  const sorted = athletes.toSorted((a, b) => compareNames(a.name, b.name));
  const shown = filterAthletes(sorted, filters);
  const filtered =
    filters.query !== "" || filters.clubId !== null || filters.gender !== null;

  const applyQuery = (query: string) => {
    setFilters((current) => ({ ...current, query: query.trim() }));
    // Kept in the address so a reload or a shared link keeps the search.
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  };

  return (
    <>
      <SearchBox
        key={resets}
        athletes={sorted}
        appliedQuery={filters.query}
        onApply={applyQuery}
      />
      <SearchShortcut inputId={SEARCH_ID} />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              [null, "Todos"],
              ["female", genderLabels.female],
              ["male", genderLabels.male],
            ] as [Gender | null, string][]
          ).map(([gender, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={filters.gender === gender}
              onClick={() => setFilters((current) => ({ ...current, gender }))}
              className={chipClass(filters.gender === gender)}
            >
              {label}
            </button>
          ))}
          <select
            aria-label="Filtrar por club"
            value={filters.clubId ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                clubId: event.target.value ? Number(event.target.value) : null,
              }))
            }
            className={`${chipClass(filters.clubId !== null)} max-w-full bg-transparent`}
          >
            <option value="">Todos los clubes</option>
            {clubs
              .toSorted((a, b) => compareNames(a.name, b.name))
              .map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
          </select>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400" role="status">
          {shown.length === 1 ? "1 atleta" : `${shown.length} atletas`}
          {filters.query && ` para «${filters.query}»`}
          {filtered && (
            <>
              {" · "}
              <button
                type="button"
                onClick={() => {
                  setFilters(NO_FILTERS);
                  applyQuery("");
                  setResets((count) => count + 1);
                }}
                className="font-medium underline underline-offset-2"
              >
                Limpiar
              </button>
            </>
          )}
        </p>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {athletes.length === 0
            ? "Todavía no hay atletas."
            : "No hay atletas con esa búsqueda o filtros."}
        </p>
      ) : (
        <>
          <AthleteList athletes={shown} clubs={clubs} />
          <AlphabetIndex athletes={shown} />
        </>
      )}
    </>
  );
}

function SearchBox({
  athletes,
  appliedQuery,
  onApply,
}: {
  athletes: Athlete[];
  appliedQuery: string;
  onApply: (query: string) => void;
}) {
  const [text, setText] = useState(appliedQuery);
  const [open, setOpen] = useState(false);
  const listId = useId();
  // Only while typing something new: once applied, the list itself shows the matches.
  const options =
    open && text.trim() !== appliedQuery ? suggestions(athletes, text) : [];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setOpen(false);
    onApply(text);
  };

  const pick = (athlete: Athlete) => {
    setText(athlete.name);
    setOpen(false);
    onApply(athlete.name);
  };

  return (
    <form role="search" onSubmit={submit} className="relative flex gap-2">
      <input
        id={SEARCH_ID}
        type="search"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setOpen(true);
          if (event.target.value === "") onApply("");
        }}
        onFocus={() => setOpen(true)}
        // Late enough for a tap on a suggestion to land first.
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Buscar por nombre o CI"
        aria-label="Buscar por nombre o CI"
        role="combobox"
        aria-expanded={options.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        className={inputClass}
      />
      <button type="submit" className={secondaryButtonClass}>
        Buscar
      </button>

      {options.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Sugerencias"
          className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          {options.map((athlete) => (
            <li key={athlete.id} role="option" aria-selected={false}>
              <button
                type="button"
                // Before the input's blur, so the tap isn't lost when the list closes.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(athlete)}
                className="flex w-full flex-col items-start px-4 py-2.5 text-left active:bg-zinc-100 dark:active:bg-zinc-800"
              >
                <span className="font-medium">{athlete.name}</span>
                <span className="text-xs text-zinc-500">
                  {athlete.club.name}
                  {athlete.ci && ` · CI ${athlete.ci}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

function AthleteList({
  athletes,
  clubs,
}: {
  athletes: Athlete[];
  clubs: Club[];
}) {
  return (
    <ul className="flex flex-col gap-3">
      {athletes.map((athlete, index) => {
        const letter = letterOf(athlete.name);
        const firstOfLetter =
          index === 0 || letterOf(athletes[index - 1].name) !== letter;
        return (
          <li
            key={athlete.id}
            // The alphabet jumps to the first athlete of each letter.
            id={firstOfLetter ? `letra-${letter}` : undefined}
            className="flex scroll-mt-4 items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="font-semibold">{athlete.name}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {athlete.club.name}
                {" · CI: "}
                {athlete.ci ?? "sin CI"}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {genderLabels[athlete.gender]}
                {" · "}
                {formatDate(athlete.birth_date)}
                {" · "}
                {athlete.belt_rank}
                {" · "}
                {athlete.weight_kg} kg
              </p>
            </div>
            <AthleteDialogButton
              athlete={athlete}
              clubs={clubs}
              className={`${secondaryButtonClass} shrink-0`}
            />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Phones only: the alphabet on the right edge, shown while the list scrolls. Tap or drag over a
 * letter to jump to its first athlete; letters with nobody are dimmed.
 */
function AlphabetIndex({ athletes }: { athletes: Athlete[] }) {
  const present = new Set(athletes.map((athlete) => letterOf(athlete.name)));
  const letters = present.has("#") ? [...ALPHABET, "#"] : ALPHABET;
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setVisible(true);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), 1500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(hideTimer.current);
    };
  }, []);

  const jumpTo = (letter: string) => {
    if (!present.has(letter)) return;
    document
      .getElementById(`letra-${letter}`)
      ?.scrollIntoView({ block: "start" });
  };

  const letterAt = (clientY: number) => {
    const bar = barRef.current;
    if (!bar) return null;
    const { top, height } = bar.getBoundingClientRect();
    const index = Math.floor(((clientY - top) / height) * letters.length);
    return letters[Math.min(letters.length - 1, Math.max(0, index))];
  };

  const onPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.type === "pointerdown") {
      event.currentTarget.setPointerCapture(event.pointerId);
    } else if (dragging === null) {
      return;
    }
    const letter = letterAt(event.clientY);
    if (letter && letter !== dragging) {
      setDragging(letter);
      jumpTo(letter);
    }
    clearTimeout(hideTimer.current);
  };

  const endDrag = () => {
    setDragging(null);
    hideTimer.current = setTimeout(() => setVisible(false), 1500);
  };

  const shown = visible || dragging !== null;

  return (
    <>
      <div
        ref={barRef}
        role="navigation"
        aria-label="Saltar a una letra"
        onPointerDown={onPointer}
        onPointerMove={onPointer}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        // Between the header area and the search shortcut above the "+".
        className={`fixed top-24 right-0.5 bottom-[calc(13rem+env(safe-area-inset-bottom))] z-30 flex w-6 touch-none flex-col items-center justify-between rounded-full bg-white/80 py-1 text-[0.65rem] leading-none font-semibold shadow-sm transition-opacity select-none sm:hidden dark:bg-zinc-900/80 ${
          shown ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {letters.map((letter) => (
          <span
            key={letter}
            aria-hidden
            className={
              present.has(letter)
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-300 dark:text-zinc-700"
            }
          >
            {letter}
          </span>
        ))}
      </div>
      {dragging && (
        <span
          aria-hidden
          className="fixed top-1/2 right-12 z-30 flex size-16 -translate-y-1/2 items-center justify-center rounded-2xl bg-zinc-900/85 text-3xl font-semibold text-white sm:hidden"
        >
          {dragging}
        </span>
      )}
    </>
  );
}
