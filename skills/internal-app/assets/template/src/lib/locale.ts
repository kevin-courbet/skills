/** One locale and time zone for the whole app. ChartProvider and formatters read these. */
export const appLocale = "en-GB";
export const appTimeZone = "UTC";

const integer = new Intl.NumberFormat(appLocale);
const currency = new Intl.NumberFormat(appLocale, {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const dateTime = new Intl.DateTimeFormat(appLocale, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: appTimeZone,
});
const relative = new Intl.RelativeTimeFormat(appLocale, { numeric: "auto" });

export const formatInteger = (value: number): string => integer.format(value);
export const formatCurrency = (value: number): string => currency.format(value);
export const formatDateTime = (iso: string): string => dateTime.format(new Date(iso));

/** Relative wording for recent dates, exact date otherwise. Pass now for deterministic SSR. */
export function formatRelative(iso: string, now: number): string {
  const diffMinutes = Math.round((new Date(iso).getTime() - now) / 60_000);
  const absMinutes = Math.abs(diffMinutes);
  if (absMinutes < 60) return relative.format(diffMinutes, "minute");
  if (absMinutes < 60 * 24) return relative.format(Math.round(diffMinutes / 60), "hour");
  if (absMinutes < 60 * 24 * 14) return relative.format(Math.round(diffMinutes / (60 * 24)), "day");
  return formatDateTime(iso);
}
