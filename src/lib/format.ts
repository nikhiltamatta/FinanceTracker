import { format as formatFns } from "date-fns";

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  INR: "₹",
};

const LOCALE_BY_CURRENCY: Record<string, string> = {
  EUR: "de-DE",
  USD: "en-US",
  GBP: "en-GB",
  INR: "en-IN",
};

export const DEFAULT_CURRENCY = "EUR";

export function formatMoney(amount: number, currency = DEFAULT_CURRENCY): string {
  const code = currency.toUpperCase();
  const locale = LOCALE_BY_CURRENCY[code] ?? "de-DE";
  const rounded = Math.round(amount * 100) / 100;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(rounded);
  } catch {
    const symbol = CURRENCY_SYMBOLS[code] ?? `${code} `;
    return `${symbol}${rounded.toLocaleString(locale)}`;
  }
}

export function formatDate(date: Date): string {
  return formatFns(date, "EEE d MMM");
}

export function formatDateShort(date: Date): string {
  return formatFns(date, "d MMM");
}

export function formatMonthYear(date: Date): string {
  return formatFns(date, "MMMM yyyy");
}
