import React from "react";
import { formatDigital } from "../utils/time";
import { formatTemperature } from "../services/weather";
import {
  Calendar,
  Thermometer,
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
} from "lucide-react";

export function WeatherIcon({ condition, size = 16, className = "" }) {
  if (!condition) return <Sun size={size} className={className} />;
  switch (condition.type) {
    case "clear":
      return condition.label === "Sunny" ? (
        <Sun size={size} className={`weather-sun ${className}`} />
      ) : (
        <Moon size={size} className={`weather-moon ${className}`} />
      );
    case "partly-cloudy":
      return <CloudSun size={size} className={`weather-partly ${className}`} />;
    case "cloudy":
      return <Cloud size={size} className={`weather-cloud ${className}`} />;
    case "rain":
      return <CloudRain size={size} className={`weather-rain ${className}`} />;
    case "snow":
      return <Snowflake size={size} className={`weather-snow ${className}`} />;
    case "storm":
      return <CloudLightning size={size} className={`weather-storm ${className}`} />;
    case "fog":
      return <CloudFog size={size} className={`weather-fog ${className}`} />;
    default:
      return <Sun size={size} className={className} />;
  }
}

export default function DigitalDisplay({
  time,
  is24Hour = false,
  showSeconds = true,
  onToggleFormat,
  weather,
  tempUnit = "C",
  onToggleTempUnit,
  subtitle,
}) {
  const { timeStr, ampm } = formatDigital(
    time.h,
    time.m,
    time.s,
    is24Hour,
    showSeconds
  );

  return (
    <div className="digital-display-container">
      {/* Time with Tap to Toggle 12h/24h */}
      <div
        className="digital-time-wrapper"
        onClick={onToggleFormat}
        title="Tap to switch between 12-hour and 24-hour format"
        role="button"
        tabIndex={0}
      >
        <span className="digital-time">{timeStr}</span>
        {ampm && <span className="digital-ampm">{ampm}</span>}
      </div>

      {/* Weekday & Full Date Badge */}
      <div className="date-weekday-strip">
        <span className="weekday-pill">{time.weekdayLong}</span>
        <span className="date-separator">·</span>
        <div className="date-display-wrap">
          <Calendar size={14} className="calendar-icon" />
          <span className="date-text">
            {time.day} {time.monthLong} {time.year}
          </span>
        </div>
      </div>

      {/* Temperature & Weather Pill */}
      {weather && (
        <div
          className="temperature-pill"
          onClick={onToggleTempUnit}
          title="Tap to toggle between °C and °F"
          role="button"
          tabIndex={0}
        >
          <WeatherIcon condition={weather.condition} size={15} />
          <span className="temp-value">
            {formatTemperature(weather.tempC, tempUnit)}
          </span>
          <span className="temp-condition">{weather.condition?.label}</span>
          <span className="temp-unit-hint">{tempUnit === "C" ? "°C" : "°F"}</span>
        </div>
      )}

      {/* Timezone / Location */}
      {subtitle && <p className="digital-subtitle">{subtitle}</p>}
    </div>
  );
}
