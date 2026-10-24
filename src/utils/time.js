export const pad = (n) => String(n).padStart(2, "0");

export function readTime(date, tz) {
  const options = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };
  if (tz) {
    options.timeZone = tz;
  }

  const parts = new Intl.DateTimeFormat("en-GB", options).formatToParts(date);
  const get = (type) => Number(parts.find((p) => p.type === type)?.value || 0);

  const h = get("hour");
  const m = get("minute");
  const s = get("second");
  const year = get("year");
  const month = get("month");
  const day = get("day");

  return {
    h,
    m,
    s,
    ms: date.getMilliseconds(),
    year,
    month,
    day,
    dayKey: year * 10000 + month * 100 + day,
    isDaytime: h >= 6 && h < 18,
  };
}

export function formatDigital(h, m, s, is24Hour = false, showSeconds = true) {
  if (is24Hour) {
    const timeStr = `${pad(h)}:${pad(m)}${showSeconds ? `:${pad(s)}` : ""}`;
    return { timeStr, ampm: "" };
  }
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? "PM" : "AM";
  const timeStr = `${pad(displayHour)}:${pad(m)}${showSeconds ? `:${pad(s)}` : ""}`;
  return { timeStr, ampm };
}

export function getTimeDifference(now, targetTz) {
  try {
    const localStr = now.toLocaleString("en-US", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    const targetStr = now.toLocaleString("en-US", { timeZone: targetTz });
    const localDate = new Date(localStr);
    const targetDate = new Date(targetStr);
    const diffMs = targetDate.getTime() - localDate.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 30)) / 2; // half-hour precision

    if (diffHours === 0) return "Same time";
    const sign = diffHours > 0 ? "+" : "";
    return `${sign}${diffHours}h`;
  } catch (e) {
    return "";
  }
}
