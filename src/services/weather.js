// Open-Meteo Free Weather API integration with local caching
const CACHE_PREFIX = "clock_weather_";
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes cache

// Timezone to approximate coordinates dictionary
export const TIMEZONE_COORDS = {
  "Asia/Dubai": { lat: 25.2048, lon: 55.2708, city: "Dubai" },
  "Asia/Karachi": { lat: 24.8607, lon: 67.0011, city: "Karachi" },
  "Europe/London": { lat: 51.5074, lon: -0.1278, city: "London" },
  "America/New_York": { lat: 40.7128, lon: -74.006, city: "New York" },
  "Asia/Tokyo": { lat: 35.6762, lon: 139.6503, city: "Tokyo" },
  "Europe/Paris": { lat: 48.8566, lon: 2.3522, city: "Paris" },
  "Australia/Sydney": { lat: -33.8688, lon: 151.2093, city: "Sydney" },
  "Asia/Singapore": { lat: 1.3521, lon: 103.8198, city: "Singapore" },
  "Asia/Riyadh": { lat: 24.7136, lon: 46.6753, city: "Riyadh" },
  "Africa/Cairo": { lat: 30.0444, lon: 31.2357, city: "Cairo" },
  "Asia/Hong_Kong": { lat: 22.3193, lon: 114.1694, city: "Hong Kong" },
  "Europe/Berlin": { lat: 52.52, lon: 13.405, city: "Berlin" },
  "America/Los_Angeles": { lat: 34.0522, lon: -118.2437, city: "Los Angeles" },
  "America/Chicago": { lat: 41.8781, lon: -87.6298, city: "Chicago" },
  "America/Toronto": { lat: 43.6532, lon: -79.3832, city: "Toronto" },
  "Europe/Istanbul": { lat: 41.0082, lon: 28.9784, city: "Istanbul" },
  "Asia/Kolkata": { lat: 19.076, lon: 72.8777, city: "Mumbai" },
  "Asia/Dhaka": { lat: 23.8103, lon: 90.4125, city: "Dhaka" },
  "Asia/Bangkok": { lat: 13.7563, lon: 100.5018, city: "Bangkok" },
  "Asia/Seoul": { lat: 37.5665, lon: 126.978, city: "Seoul" },
  "America/Sao_Paulo": { lat: -23.5505, lon: -46.6333, city: "São Paulo" },
  "Pacific/Auckland": { lat: -36.8485, lon: 174.7633, city: "Auckland" },
  "Africa/Johannesburg": { lat: -26.2041, lon: 28.0473, city: "Johannesburg" },
  "Pacific/Honolulu": { lat: 21.3069, lon: -157.8583, city: "Honolulu" },
  "Europe/Rome": { lat: 41.9028, lon: 12.4964, city: "Rome" },
  "America/Denver": { lat: 39.7392, lon: -104.9903, city: "Denver" },
  "Atlantic/Reykjavik": { lat: 64.1466, lon: -21.9426, city: "Reykjavik" },
  "Asia/Shanghai": { lat: 31.2304, lon: 121.4737, city: "Shanghai" },
};

export function getWeatherCondition(code, isDay = 1) {
  // WMO Weather interpretation codes (WW)
  if (code === 0) {
    return { label: isDay ? "Sunny" : "Clear", type: "clear" };
  }
  if (code === 1 || code === 2) {
    return { label: "Partly Cloudy", type: "partly-cloudy" };
  }
  if (code === 3) {
    return { label: "Overcast", type: "cloudy" };
  }
  if (code === 45 || code === 48) {
    return { label: "Foggy", type: "fog" };
  }
  if (code >= 51 && code <= 67) {
    return { label: "Rainy", type: "rain" };
  }
  if (code >= 71 && code <= 77) {
    return { label: "Snowy", type: "snow" };
  }
  if (code >= 80 && code <= 82) {
    return { label: "Showers", type: "rain" };
  }
  if (code >= 85 && code <= 86) {
    return { label: "Snow Showers", type: "snow" };
  }
  if (code >= 95 && code <= 99) {
    return { label: "Thunderstorm", type: "storm" };
  }
  return { label: "Fair", type: "clear" };
}

export function formatTemperature(celsius, unit = "C") {
  if (celsius === null || celsius === undefined || isNaN(celsius)) {
    return "--";
  }
  if (unit === "F") {
    const fahr = Math.round((celsius * 9) / 5 + 32);
    return `${fahr}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export async function fetchWeather(lat, lon) {
  const cacheKey = `${CACHE_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.data;
      }
    }
  } catch (e) {
    // ignore storage error
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather request failed");
    const json = await res.json();
    const current = json.current;
    const data = {
      tempC: current.temperature_2m,
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      condition: getWeatherCondition(current.weather_code, current.is_day === 1),
    };

    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ timestamp: Date.now(), data })
      );
    } catch (e) {}

    return data;
  } catch (error) {
    console.warn("Could not fetch weather:", error);
    return null;
  }
}

export async function getWeatherForTimezone(tz) {
  let coords = TIMEZONE_COORDS[tz];
  if (!coords) {
    // If not in popular list, try finding by timezone city suffix
    const suffix = tz.split("/").pop()?.replace(/_/g, " ");
    const match = Object.values(TIMEZONE_COORDS).find(
      (c) => c.city.toLowerCase() === suffix?.toLowerCase()
    );
    coords = match || { lat: 25.2048, lon: 55.2708 }; // fallback
  }

  return await fetchWeather(coords.lat, coords.lon);
}
