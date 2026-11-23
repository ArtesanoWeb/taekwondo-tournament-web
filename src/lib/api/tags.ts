// Cache tags of the public site's reads (`./public.ts`), shared with the admin's server actions,
// which expire them with `updateTag` after changing something.

/** Every public read: for changes that may show anywhere (names, statuses, new brackets). */
export const PUBLIC_TAG = "publico";

/** One category's data, bracket and registrants: what a scored round or a registration changes. */
export function categoryTag(categoryId: number): string {
  return `categoria-${categoryId}`;
}
