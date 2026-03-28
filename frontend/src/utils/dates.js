import { ADToBS } from "bikram-sambat-js";

const NEPAL_TIME_ZONE = "Asia/Kathmandu";
const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

function getSafeDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getActiveLocale(locale) {
  if (locale) {
    return locale;
  }

  if (typeof document !== "undefined" && document.documentElement.lang === "ne") {
    return "ne-NP";
  }

  return "en-NP";
}

function toNepaliDigits(value) {
  return String(value).replace(/\d/g, (digit) => NEPALI_DIGITS[Number(digit)]);
}

function formatBsDate(value, locale) {
  const bsDate = ADToBS(value);
  return locale === "ne-NP" ? toNepaliDigits(bsDate) : bsDate;
}

export function formatDisplayDate(value, locale) {
  const date = getSafeDate(value);
  const activeLocale = getActiveLocale(locale);

  if (!date) {
    return "-";
  }

  if (activeLocale === "ne-NP") {
    return formatBsDate(date, activeLocale);
  }

  return new Intl.DateTimeFormat(activeLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: NEPAL_TIME_ZONE,
  }).format(date);
}

export function formatDisplayDateTime(value, locale) {
  const date = getSafeDate(value);
  const activeLocale = getActiveLocale(locale);

  if (!date) {
    return "-";
  }

  const timePart = new Intl.DateTimeFormat(activeLocale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: NEPAL_TIME_ZONE,
  }).format(date);

  if (activeLocale === "ne-NP") {
    return `${formatBsDate(date, activeLocale)} ${timePart}`;
  }

  return new Intl.DateTimeFormat(activeLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: NEPAL_TIME_ZONE,
  }).format(date);
}
