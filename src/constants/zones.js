export const POPULAR_CITIES = [
  { name: "Dubai", tz: "Asia/Dubai", country: "United Arab Emirates" },
  { name: "Karachi", tz: "Asia/Karachi", country: "Pakistan" },
  { name: "London", tz: "Europe/London", country: "United Kingdom" },
  { name: "New York", tz: "America/New_York", country: "United States" },
  { name: "Tokyo", tz: "Asia/Tokyo", country: "Japan" },
  { name: "Paris", tz: "Europe/Paris", country: "France" },
  { name: "Sydney", tz: "Australia/Sydney", country: "Australia" },
  { name: "Singapore", tz: "Asia/Singapore", country: "Singapore" },
  { name: "Riyadh", tz: "Asia/Riyadh", country: "Saudi Arabia" },
  { name: "Cairo", tz: "Africa/Cairo", country: "Egypt" },
  { name: "Hong Kong", tz: "Asia/Hong_Kong", country: "China" },
  { name: "Berlin", tz: "Europe/Berlin", country: "Germany" },
  { name: "Los Angeles", tz: "America/Los_Angeles", country: "United States" },
  { name: "Chicago", tz: "America/Chicago", country: "United States" },
  { name: "Toronto", tz: "America/Toronto", country: "Canada" },
  { name: "Istanbul", tz: "Europe/Istanbul", country: "Turkey" },
  { name: "Mumbai", tz: "Asia/Kolkata", country: "India" },
  { name: "Dhaka", tz: "Asia/Dhaka", country: "Bangladesh" },
  { name: "Bangkok", tz: "Asia/Bangkok", country: "Thailand" },
  { name: "Seoul", tz: "Asia/Seoul", country: "South Korea" },
  { name: "São Paulo", tz: "America/Sao_Paulo", country: "Brazil" },
  { name: "Auckland", tz: "Pacific/Auckland", country: "New Zealand" },
  { name: "Johannesburg", tz: "Africa/Johannesburg", country: "South Africa" },
  { name: "Honolulu", tz: "Pacific/Honolulu", country: "United States" }
];

export const DEFAULT_CITIES = [
  { name: "London", tz: "Europe/London" },
  { name: "New York", tz: "America/New_York" },
  { name: "Tokyo", tz: "Asia/Tokyo" }
];

export const FALLBACK_ZONES = [
  "Pacific/Honolulu", "America/Los_Angeles", "America/Denver", "America/Chicago",
  "America/New_York", "America/Toronto", "America/Sao_Paulo", "Atlantic/Reykjavik",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Rome", "Europe/Istanbul",
  "Africa/Cairo", "Africa/Johannesburg", "Asia/Riyadh", "Asia/Dubai", "Asia/Karachi",
  "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok", "Asia/Singapore", "Asia/Hong_Kong",
  "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul", "Australia/Sydney", "Pacific/Auckland"
];

export function getAllTimeZones() {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch (e) {
    return FALLBACK_ZONES;
  }
}
