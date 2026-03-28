const NEPAL_TIME_ZONE = "Asia/Kathmandu";

function getSafeDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDisplayDate(value, locale = "en-NP") {
  const date = getSafeDate(value);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: NEPAL_TIME_ZONE,
  }).format(date);
}

export function formatDisplayDateTime(value, locale = "en-NP") {
  const date = getSafeDate(value);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: NEPAL_TIME_ZONE,
  }).format(date);
}
