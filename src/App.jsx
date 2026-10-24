import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import AnalogClock from "./components/AnalogClock";
import DigitalDisplay from "./components/DigitalDisplay";
import WorldClockCard from "./components/WorldClockCard";
import AppearanceSettings from "./components/AppearanceSettings";
import CitySettings from "./components/CitySettings";
import TimezonePickerModal from "./components/TimezonePickerModal";
import FullscreenDeskClock from "./components/FullscreenDeskClock";
import AlarmTab from "./components/AlarmTab";
import StopwatchTab from "./components/StopwatchTab";
import TimerTab from "./components/TimerTab";
import { THEMES, FONTS, STORAGE_KEY, DEFAULT_SETTINGS } from "./constants/themes";
import { readTime } from "./utils/time";
import { getWeatherForTimezone } from "./services/weather";
import { startAlarmChime, stopAlarmChime } from "./utils/audio";
import {
  Clock as ClockIcon,
  Globe,
  Palette,
  Settings,
  Maximize2,
  Bell,
  Timer as TimerIcon,
  Hourglass,
  Check,
  RotateCcw,
} from "lucide-react";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";

const ALARMS_STORAGE_KEY = "clock_alarms_v1";

const DEFAULT_ALARMS = [
  {
    id: "1",
    hour: 7,
    minute: 0,
    label: "Wake Up Routine",
    repeatDays: [1, 2, 3, 4, 5],
    enabled: true,
  },
  {
    id: "2",
    hour: 22,
    minute: 30,
    label: "Evening Wind Down",
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    enabled: false,
  },
];

function loadSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.cities) && parsed.cities.length > 0) {
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    }
  } catch (e) {
    console.warn("Storage unavailable, using defaults");
  }
  return DEFAULT_SETTINGS;
}

function loadAlarms() {
  try {
    const raw = window.localStorage.getItem(ALARMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return DEFAULT_ALARMS;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("clock"); // 'clock' | 'alarm' | 'stopwatch' | 'timer' | 'cities' | 'appearance'
  const [settings, setSettings] = useState(loadSettings);
  const [alarms, setAlarms] = useState(loadAlarms);
  const [now, setNow] = useState(() => new Date());
  const [editingCityIndex, setEditingCityIndex] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localWeather, setLocalWeather] = useState(null);
  const [ringingAlarm, setRingingAlarm] = useState(null);

  const lastTriggeredMinuteRef = useRef(null);

  // High precision timer for clock hands
  useEffect(() => {
    const intervalMs = settings.smoothSweep ? 50 : 250;
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    return () => clearInterval(intervalId);
  }, [settings.smoothSweep]);

  // Alarms Monitor
  useEffect(() => {
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentS = now.getSeconds();
    const dayOfWeek = now.getDay();
    const currentKey = `${currentH}:${currentM}`;

    if (currentS <= 1 && lastTriggeredMinuteRef.current !== currentKey) {
      const matching = alarms.find((a) => {
        if (!a.enabled) return false;
        if (a.hour !== currentH || a.minute !== currentM) return false;
        if (!a.repeatDays || a.repeatDays.length === 0) return true; // once
        return a.repeatDays.includes(dayOfWeek);
      });

      if (matching) {
        lastTriggeredMinuteRef.current = currentKey;
        setRingingAlarm(matching);
        startAlarmChime();
      }
    }
  }, [now, alarms]);

  // Fetch local weather
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dubai";
  useEffect(() => {
    let isMounted = true;
    getWeatherForTimezone(localTz).then((data) => {
      if (isMounted && data) {
        setLocalWeather(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [localTz]);

  // Capacitor Native Status Bar & Back Button Integration
  useEffect(() => {
    if (isFullscreen) return;
    const theme = THEMES[settings.theme] || THEMES.midnight;
    try {
      StatusBar.setBackgroundColor({ color: theme.bg }).catch(() => {});
      const isDark =
        theme.bg === "#000000" ||
        theme.bg === "#0f172a" ||
        theme.bg === "#0a1f18" ||
        theme.bg === "#0b2038";
      StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
    } catch (e) {
      // Not on native device
    }
  }, [settings.theme, isFullscreen]);

  // Sync fullscreen change with document events (e.g. Esc key pressed)
  useEffect(() => {
    const handleFsChange = () => {
      const isDocFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      );
      if (!isDocFs && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, [isFullscreen]);

  // Hardware Back Button (Capacitor)
  useEffect(() => {
    let removeListener = null;
    try {
      const backListener = CapApp.addListener("backButton", ({ canGoBack }) => {
        if (ringingAlarm) {
          handleDismissRingingAlarm();
        } else if (isFullscreen) {
          exitFullscreenMode();
        } else if (editingCityIndex !== null) {
          setEditingCityIndex(null);
        } else if (activeTab !== "clock") {
          setActiveTab("clock");
        } else if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });
      removeListener = () => backListener.then((h) => h.remove());
    } catch (e) {
      // Not on native device
    }
    return () => {
      if (removeListener) removeListener();
    };
  }, [activeTab, editingCityIndex, isFullscreen, ringingAlarm]);

  const saveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {}
  }, []);

  const saveAlarms = useCallback((newAlarms) => {
    setAlarms(newAlarms);
    try {
      window.localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(newAlarms));
    } catch (e) {}
  }, []);

  const handleDismissRingingAlarm = () => {
    stopAlarmChime();
    if (ringingAlarm && (!ringingAlarm.repeatDays || ringingAlarm.repeatDays.length === 0)) {
      // Turn off if it was a one-time alarm
      saveAlarms(alarms.map((a) => (a.id === ringingAlarm.id ? { ...a, enabled: false } : a)));
    }
    setRingingAlarm(null);
  };

  const handleSnoozeAlarm = () => {
    stopAlarmChime();
    setRingingAlarm(null);
    // Snooze 5 minutes
    const snoozeDate = new Date(Date.now() + 5 * 60 * 1000);
    const snoozedAlarm = {
      id: `snooze_${Date.now()}`,
      hour: snoozeDate.getHours(),
      minute: snoozeDate.getMinutes(),
      label: `Snooze: ${ringingAlarm?.label || "Alarm"}`,
      repeatDays: [],
      enabled: true,
    };
    saveAlarms([...alarms, snoozedAlarm]);
  };

  const enterFullscreenMode = () => {
    setIsFullscreen(true);
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } catch (e) {}
  };

  const exitFullscreenMode = () => {
    setIsFullscreen(false);
    try {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      ) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch (e) {}
  };

  const toggleTempUnit = () => {
    const nextUnit = settings.tempUnit === "F" ? "C" : "F";
    saveSettings({ ...settings, tempUnit: nextUnit });
  };

  const currentTheme = THEMES[settings.theme] || THEMES.midnight;
  const parts = settings.parts || {};

  // Dynamic CSS variables injected on root container
  const cssVariables = useMemo(() => {
    return {
      "--bg": currentTheme.bg,
      "--card-bg": currentTheme.cardBg,
      "--face": currentTheme.face,
      "--ink": currentTheme.ink,
      "--muted": currentTheme.muted,
      "--border": currentTheme.border,
      "--accent": currentTheme.accent,
      "--c-face": parts.face || currentTheme.face,
      "--c-ring": parts.ring || currentTheme.ink,
      "--c-num": parts.num || currentTheme.ink,
      "--c-hands": parts.hands || currentTheme.ink,
      "--c-sec": parts.sec || currentTheme.accent,
      "--c-hub": parts.hub || currentTheme.accent,
      "--font": (FONTS[settings.font] || FONTS.din).stack,
    };
  }, [currentTheme, parts, settings.font]);

  // Local Time Information
  const localTime = readTime(now);

  // Handlers for City Management
  const handleUpdateCity = (index, patch) => {
    const updated = settings.cities.map((c, i) => (i === index ? { ...c, ...patch } : c));
    saveSettings({ ...settings, cities: updated });
  };

  const handleAddCity = () => {
    const defaultNew = { name: "New York", tz: "America/New_York" };
    saveSettings({ ...settings, cities: [...settings.cities, defaultNew] });
    setEditingCityIndex(settings.cities.length);
  };

  const handleRemoveCity = (index) => {
    const updated = settings.cities.filter((_, i) => i !== index);
    saveSettings({ ...settings, cities: updated });
  };

  const handleSavePickedCity = (cityData) => {
    if (editingCityIndex !== null) {
      handleUpdateCity(editingCityIndex, cityData);
      setEditingCityIndex(null);
    }
  };

  return (
    <div className="clock-app" style={cssVariables}>
      {/* Alarm Ringing Modal Alert */}
      {ringingAlarm && (
        <div className="ringing-alarm-overlay">
          <div className="ringing-alarm-card">
            <Bell size={48} className="ringing-bell-pulse" />
            <h2 className="ringing-alarm-time">
              {pad(ringingAlarm.hour)}:{pad(ringingAlarm.minute)}
            </h2>
            <p className="ringing-alarm-title">{ringingAlarm.label}</p>

            <div className="ringing-alarm-actions">
              <button
                type="button"
                className="btn btn-secondary snooze-btn"
                onClick={handleSnoozeAlarm}
              >
                <RotateCcw size={16} />
                <span>Snooze (5m)</span>
              </button>

              <button
                type="button"
                className="btn btn-primary dismiss-btn"
                onClick={handleDismissRingingAlarm}
              >
                <Check size={18} />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Mobile / Desk Mode Overlay */}
      {isFullscreen ? (
        <FullscreenDeskClock
          time={localTime}
          now={now}
          cities={settings.cities}
          settings={settings}
          weather={localWeather}
          tempUnit={settings.tempUnit || "C"}
          onToggleTempUnit={toggleTempUnit}
          onToggle1224={() =>
            saveSettings({ ...settings, is24Hour: !settings.is24Hour })
          }
          onExitFullscreen={exitFullscreenMode}
        />
      ) : (
        <>
          {/* Top Header / Brand */}
          <header className="app-header">
            <div className="header-brand">
              <ClockIcon size={20} className="brand-icon" />
              <h1 className="brand-title">World Clock</h1>
            </div>

            {/* Top Bar Actions */}
            <div className="header-actions">
              <button
                type="button"
                className="header-fs-btn"
                onClick={enterFullscreenMode}
                title="Enter Fullscreen Desk Mode"
              >
                <Maximize2 size={16} />
                <span className="fs-btn-label">Fullscreen</span>
              </button>

              {/* Desktop / Tablet Navigation Pills */}
              <nav className="desktop-nav">
                <button
                  type="button"
                  className={`nav-pill ${activeTab === "clock" ? "active" : ""}`}
                  onClick={() => setActiveTab("clock")}
                >
                  <ClockIcon size={16} />
                  <span>Clocks</span>
                </button>
                <button
                  type="button"
                  className={`nav-pill ${activeTab === "alarm" ? "active" : ""}`}
                  onClick={() => setActiveTab("alarm")}
                >
                  <Bell size={16} />
                  <span>Alarm</span>
                </button>
                <button
                  type="button"
                  className={`nav-pill ${activeTab === "stopwatch" ? "active" : ""}`}
                  onClick={() => setActiveTab("stopwatch")}
                >
                  <Hourglass size={16} />
                  <span>Stopwatch</span>
                </button>
                <button
                  type="button"
                  className={`nav-pill ${activeTab === "timer" ? "active" : ""}`}
                  onClick={() => setActiveTab("timer")}
                >
                  <TimerIcon size={16} />
                  <span>Timer</span>
                </button>
                <button
                  type="button"
                  className={`nav-pill ${activeTab === "cities" ? "active" : ""}`}
                  onClick={() => setActiveTab("cities")}
                >
                  <Globe size={16} />
                  <span>Cities</span>
                </button>
                <button
                  type="button"
                  className={`nav-pill ${activeTab === "appearance" ? "active" : ""}`}
                  onClick={() => setActiveTab("appearance")}
                >
                  <Palette size={16} />
                  <span>Theme</span>
                </button>
              </nav>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="app-main-content">
            {activeTab === "clock" && (
              <div className="clock-view">
                {/* Primary Local Analog Clock */}
                <section className="primary-clock-section">
                  <div className="primary-analog-wrapper">
                    <AnalogClock
                      time={localTime}
                      showSeconds={settings.showSeconds}
                      smoothSweep={settings.smoothSweep}
                      showDayDate={settings.showDayDate !== false}
                    />
                  </div>

                  {/* Digital readout, Weekday, Date & Temperature */}
                  <DigitalDisplay
                    time={localTime}
                    is24Hour={settings.is24Hour}
                    showSeconds={settings.showSeconds}
                    onToggleFormat={() =>
                      saveSettings({ ...settings, is24Hour: !settings.is24Hour })
                    }
                    weather={localWeather}
                    tempUnit={settings.tempUnit || "C"}
                    onToggleTempUnit={toggleTempUnit}
                    subtitle={`${localTz.replace(/_/g, " ")}`}
                  />

                  {/* Mobile Quick Fullscreen Action Pill */}
                  <div className="fullscreen-quick-action">
                    <button
                      type="button"
                      className="btn btn-secondary fs-stand-btn"
                      onClick={enterFullscreenMode}
                    >
                      <Maximize2 size={15} />
                      <span>StandBy Desk Mode</span>
                    </button>
                  </div>
                </section>

                {/* Monitored World Clocks Section */}
                <section className="world-clocks-section">
                  <div className="world-clocks-bar">
                    <h2 className="world-clocks-heading">World Clocks</h2>
                    <button
                      type="button"
                      className="manage-cities-link"
                      onClick={() => setActiveTab("cities")}
                    >
                      <Settings size={14} />
                      <span>Manage Cities</span>
                    </button>
                  </div>

                  <div className="world-clocks-grid">
                    {settings.cities.map((city, index) => (
                      <WorldClockCard
                        key={`${city.tz}-${index}`}
                        city={city}
                        now={now}
                        localDayKey={localTime.dayKey}
                        is24Hour={settings.is24Hour}
                        smoothSweep={settings.smoothSweep}
                        tempUnit={settings.tempUnit || "C"}
                        onEdit={() => setEditingCityIndex(index)}
                      />
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "alarm" && (
              <AlarmTab
                alarms={alarms}
                onSaveAlarms={saveAlarms}
                is24Hour={settings.is24Hour}
              />
            )}

            {activeTab === "stopwatch" && <StopwatchTab />}

            {activeTab === "timer" && <TimerTab />}

            {activeTab === "cities" && (
              <CitySettings
                cities={settings.cities}
                onUpdateCity={handleUpdateCity}
                onAddCity={handleAddCity}
                onRemoveCity={handleRemoveCity}
                onOpenPicker={(idx) => setEditingCityIndex(idx)}
                now={now}
                is24Hour={settings.is24Hour}
              />
            )}

            {activeTab === "appearance" && (
              <AppearanceSettings
                settings={settings}
                onChange={saveSettings}
                onResetDefaults={() => saveSettings(DEFAULT_SETTINGS)}
              />
            )}
          </main>

          {/* Mobile Friendly Bottom Navigation Bar */}
          <nav className="mobile-bottom-nav">
            <button
              type="button"
              className={`bottom-nav-item ${activeTab === "clock" ? "active" : ""}`}
              onClick={() => setActiveTab("clock")}
            >
              <ClockIcon size={19} />
              <span>Clock</span>
            </button>
            <button
              type="button"
              className={`bottom-nav-item ${activeTab === "alarm" ? "active" : ""}`}
              onClick={() => setActiveTab("alarm")}
            >
              <Bell size={19} />
              <span>Alarm</span>
            </button>
            <button
              type="button"
              className={`bottom-nav-item ${activeTab === "stopwatch" ? "active" : ""}`}
              onClick={() => setActiveTab("stopwatch")}
            >
              <Hourglass size={19} />
              <span>Stopwatch</span>
            </button>
            <button
              type="button"
              className={`bottom-nav-item ${activeTab === "timer" ? "active" : ""}`}
              onClick={() => setActiveTab("timer")}
            >
              <TimerIcon size={19} />
              <span>Timer</span>
            </button>
            <button
              type="button"
              className={`bottom-nav-item ${
                activeTab === "appearance" || activeTab === "cities" ? "active" : ""
              }`}
              onClick={() => setActiveTab("appearance")}
            >
              <Palette size={19} />
              <span>Theme</span>
            </button>
          </nav>

          {/* Timezone & City Search Modal */}
          {editingCityIndex !== null && (
            <TimezonePickerModal
              initialCity={settings.cities[editingCityIndex]}
              onSave={handleSavePickedCity}
              onClose={() => setEditingCityIndex(null)}
              now={now}
              is24Hour={settings.is24Hour}
            />
          )}
        </>
      )}
    </div>
  );
}
