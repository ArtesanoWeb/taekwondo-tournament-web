// Where the visitor left a sideways scroll (a tab, how far a bracket was panned), so coming back
// to the screen lands in the same place. Per browser tab (sessionStorage): a new visit starts
// fresh. Storage can be missing or blocked (private mode): then nothing is remembered.

/** Prefix of every stored key (also read by `RestoreScrollScript`, before React). */
export const SCROLL_PREFIX = "scroll:";

export function recall(key: string): number | null {
  try {
    const value = sessionStorage.getItem(SCROLL_PREFIX + key);
    if (value === null) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  } catch {
    return null;
  }
}

export function remember(key: string, value: number): void {
  try {
    sessionStorage.setItem(SCROLL_PREFIX + key, String(Math.round(value)));
  } catch {
    // Nothing to do: the screen just won't come back to this spot.
  }
}
