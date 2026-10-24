export const pad = (n) => String(n).padStart(2, "0");

const WEEKDAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function readTime(date, tz) {
  const options = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "long",
  };
  if (tz) {
    options.timeZone = tz;
  }

  const parts = new Intl.DateTimeFormat("en-GB", options).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value || "";

  const h = Number(get("hour") || 0);
  const m = Number(get("minute") || 0);
  const s = Number(get("second") || 0);
  const year = Number(get("year") || 2026);
  const month = Number(get("month") || 1);
  const day = Number(get("day") || 1);
  const weekdayLong = get("weekday") || "Today";

  // Formatted date representations
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeekIndex = dateObj.getDay();
  const weekdayShort = WEEKDAYS_SHORT[dayOfWeekIndex] || "TODAY";
  const monthShort = MONTHS_SHORT[month - 1] || "MON";

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthLong = monthNames[month - 1] || "";

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
    weekdayLong,
    weekdayShort,
    monthLong,
    monthShort,
    fullDateString: `${weekdayLong}, ${day} ${monthLong} ${year}`,
    shortDateString: `${weekdayShort} ${day} ${monthShort}`,
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
