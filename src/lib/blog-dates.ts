import { isValid, parse } from "date-fns";
import { ru } from "date-fns/locale";

/** Publication dates are calendar days, never UTC timestamps. */
export function publicationDate(value: string): Date | undefined {
  const text = value.trim().replace(/\s*г\.?$/, "").trim();
  for (const pattern of ["dd.MM.yyyy", "yyyy-MM-dd", "d MMMM yyyy"]) {
    const date = parse(text, pattern, new Date(2000, 0, 1), { locale: ru });
    if (isValid(date)) return date;
  }
  return undefined;
}

export function samePublicationDay(value: string, day: Date): boolean {
  const date = publicationDate(value);
  return Boolean(date && date.getFullYear() === day.getFullYear() && date.getMonth() === day.getMonth() && date.getDate() === day.getDate());
}