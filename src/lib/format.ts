const LOCALE = "es-BO";
// Explicit so server-rendered output doesn't depend on the server's timezone (Vercel runs in UTC).
const DISPLAY_TIME_ZONE = "America/La_Paz";

const longDate = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "long",
  timeZone: "UTC",
});
const shortDate = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});
const dateTime = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: DISPLAY_TIME_ZONE,
});

// A bare `YYYY-MM-DD` is parsed as UTC midnight, so it's formatted in UTC to keep the same day.
function parseDate(isoDate: string): Date {
  return new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
}

/** `2026-11-15` → `15 de noviembre de 2026` */
export function formatDate(isoDate: string): string {
  return longDate.format(parseDate(isoDate));
}

/** `2026-11-15` → `15/11/2026` */
export function formatShortDate(isoDate: string): string {
  return shortDate.format(parseDate(isoDate));
}

/** API datetimes are UTC but come without a `Z`; shown in Bolivian time. */
export function formatDateTime(isoDateTime: string): string {
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(isoDateTime);
  return dateTime.format(new Date(hasZone ? isoDateTime : `${isoDateTime}Z`));
}
