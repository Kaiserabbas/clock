import React, { useState, useEffect, useRef } from "react";
import AnalogClock from "./AnalogClock";
import { formatDigital } from "../utils/time";
import { formatTemperature } from "../services/weather";
import { WeatherIcon } from "./DigitalDisplay";
import {
  Minimize2,
  Moon,
  Sun,
  Calendar,
  Thermometer,
  Clock,
  ArrowLeftRight,
  Globe,
} from "lucide-react";
import { StatusBar } from "@capacitor/status-bar";

export default function FullscreenDeskClock({
  time,
  now,
  cities,
  settings,
  weather,
  tempUnit = "C",
  onToggleTempUnit,
  onToggle1224,
  onExitFullscreen,
}) {
  const [isDimmed, setIsDimmed] = useState(false);
  const [clockMode, setClockMode] = useState("both"); // 'both' | 'digital' | 'analog'
  const [flipSides, setFlipSides] = useState(false); // false: analog left, digital right | true: digital left, analog right
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef(null);
  const wakeLockRef = useRef(null);

  // Keep screen awake (WakeLock API)
  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch (err) {
        // WakeLock may be rejected or unsupported
      }
    }
    requestWakeLock();

    // Re-request if app comes back to foreground
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Hide mobile native status bar for true immersive mode
    try {
      StatusBar.hide().catch(() => {});
    } catch (e) {}

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
      try {
        StatusBar.show().catch(() => {});
      } catch (e) {}
    };
  }, []);

  // Auto-hide controls after 3.5s of inactivity
  const showControlsTemporarily = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3500);
  };

  useEffect(() => {
    showControlsTemporarily();
    const handleActivity = () => showControlsTemporarily();
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const { timeStr, ampm } = formatDigital(
    time.h,
    time.m,
    time.s,
    settings.is24Hour,
    settings.showSeconds
  );

  return (
    <div
      className={`fullscreen-desk-container ${isDimmed ? "dimmed-mode" : ""}`}
      onClick={showControlsTemporarily}
    >
      {/* Floating Auto-Hiding Controls */}
      <div className={`fullscreen-header-controls ${controlsVisible ? "visible" : "hidden"}`}>
        <div className="fs-controls-left">
          <button
            type="button"
            className={`fs-tool-btn ${isDimmed ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsDimmed(!isDimmed);
            }}
            title={isDimmed ? "Restore Brightness" : "Nightstand Dim Mode"}
          >
            <Moon size={16} />
            <span className="fs-tool-text">{isDimmed ? "Bright" : "Dim"}</span>
          </button>

          <button
            type="button"
            className="fs-tool-btn"
            onClick={(e) => {
              e.stopPropagation();
              setClockMode(
                clockMode === "both"
                  ? "digital"
                  : clockMode === "digital"
                  ? "analog"
                  : "both"
              );
            }}
            title="Toggle Clock Layout"
          >
            <Clock size={16} />
            <span className="fs-tool-text">
              {clockMode === "both"
                ? "Digital Only"
                : clockMode === "digital"
                ? "Analog Only"
                : "Side by Side"}
            </span>
          </button>

          {clockMode === "both" && (
            <button
              type="button"
              className={`fs-tool-btn ${flipSides ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setFlipSides(!flipSides);
              }}
              title="Flip Analog / Digital Sides"
            >
              <ArrowLeftRight size={16} />
              <span className="fs-tool-text">Flip</span>
            </button>
          )}
        </div>

        <div className="fs-controls-right">
          <button
            type="button"
            className="fs-exit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onExitFullscreen();
            }}
            title="Exit Fullscreen (Esc)"
          >
            <Minimize2 size={18} />
            <span className="fs-tool-text">Exit</span>
          </button>
        </div>
      </div>

      {/* Main Clock Stage - Side by Side on Mobile */}
      <div
        className={`fullscreen-stage layout-${clockMode} ${
          flipSides ? "flip-sides" : ""
        }`}
      >
        {/* Analog Dial (on one side) */}
        {(clockMode === "both" || clockMode === "analog") && (
          <div className="fs-analog-wrapper">
            <AnalogClock
              time={time}
              showSeconds={settings.showSeconds}
              smoothSweep={settings.smoothSweep}
              showDayDate={true}
              className="fs-analog-clock"
            />
          </div>
        )}

        {/* Digital Info Block (on the other side) */}
        {(clockMode === "both" || clockMode === "digital") && (
          <div className="fs-info-wrapper">
            {/* Digital Time */}
            <div
              className="fs-digital-time-wrap"
              onClick={(e) => {
                e.stopPropagation();
                onToggle1224();
              }}
              title="Tap to toggle 12h/24h"
            >
              <span className={`fs-digital-time ${clockMode === "digital" ? "ultra-large" : ""}`}>
                {timeStr}
              </span>
              {ampm && <span className="fs-digital-ampm">{ampm}</span>}
            </div>

            {/* Weekday & Full Date */}
            <div className="fs-date-strip">
              <span className="fs-weekday-pill">{time.weekdayLong}</span>
              <div className="fs-date-group">
                <Calendar size={15} className="fs-calendar-icon" />
                <span className="fs-full-date">
                  {time.day} {time.monthShort} {time.year}
                </span>
              </div>
            </div>

            {/* Weather & Temperature */}
            {weather && (
              <div
                className="fs-weather-strip"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTempUnit();
                }}
                title="Tap to switch °C / °F"
              >
                <WeatherIcon condition={weather.condition} size={18} />
                <span className="fs-temp-val">
                  {formatTemperature(weather.tempC, tempUnit)}
                </span>
                <span className="fs-temp-condition">
                  {weather.condition?.label}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Monitored World Cities Ticker */}
      {cities && cities.length > 0 && (
        <div className={`fs-world-ticker ${controlsVisible ? "visible" : "hidden"}`}>
          {cities.map((c, i) => {
            const parts = new Intl.DateTimeFormat("en-GB", {
              timeZone: c.tz,
              hour: "numeric",
              minute: "numeric",
              hourCycle: settings.is24Hour ? "h23" : "h12",
            }).formatToParts(now);
            const getVal = (t) => parts.find((p) => p.type === t)?.value || "";
            const h = getVal("hour");
            const m = getVal("minute");
            const ampmVal = getVal("dayPeriod");

            return (
              <div key={i} className="fs-city-chip">
                <Globe size={12} className="fs-city-icon" />
                <span className="fs-city-name">{c.name}</span>
                <span className="fs-city-time">
                  {h}:{m} {ampmVal}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
