import type { Category, Gender } from "@/lib/api/types";

const GENDER_ORDER: Gender[] = ["female", "male"];

/** `12, 14` → `12 a 14 años`; without a maximum → `18 años o más`. */
export function formatAgeRange(minAge: number, maxAge?: number | null): string {
  if (maxAge === null || maxAge === undefined) return `${minAge} años o más`;
  if (minAge === maxAge) return `${minAge} años`;
  return `${minAge} a ${maxAge} años`;
}

function byAgeThenWeight(a: Category, b: Category): number {
  const maxWeight = (category: Category) =>
    category.max_weight ?? Number.POSITIVE_INFINITY;
  return a.min_age - b.min_age || maxWeight(a) - maxWeight(b);
}

/** Groups categories by gender (female first), each group sorted by age and then weight. */
export function groupByGender(
  categories: Category[],
): { gender: Gender; categories: Category[] }[] {
  return GENDER_ORDER.map((gender) => ({
    gender,
    categories: categories
      .filter((category) => category.gender === gender)
      .toSorted(byAgeThenWeight),
  })).filter((group) => group.categories.length > 0);
}
