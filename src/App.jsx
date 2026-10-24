import React, { useState, useEffect, useMemo, useCallback } from "react";
import AnalogClock from "./components/AnalogClock";
import DigitalDisplay from "./components/DigitalDisplay";
import WorldClockCard from "./components/WorldClockCard";
import AppearanceSettings from "./components/AppearanceSettings";
import CitySettings from "./components/CitySettings";
import TimezonePickerModal from "./components/TimezonePickerModal";
import { THEMES, FONTS, STORAGE_KEY, DEFAULT_SETTINGS } from "./constants/themes";
import { readTime } from "./utils/time";
import { Clock as ClockIcon, Globe, Palette, Settings } from "lucide-react";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";

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

export default function App() {
  const [activeTab, setActiveTab] = useState("clock"); // 'clock' | 'cities' | 'appearance'
  const [settings, setSettings] = useState(loadSettings);
  const [now, setNow] = useState(() => new Date());
  const [editingCityIndex, setEditingCityIndex] = useState(null);

  // High precision timer for clock hands
  useEffect(() => {
    const intervalMs = settings.smoothSweep ? 50 : 250;
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    return () => clearInterval(intervalId);
  }, [settings.smoothSweep]);

  // Capacitor Native Status Bar & Back Button Integration
  useEffect(() => {
    const theme = THEMES[settings.theme] || THEMES.midnight;
    try {
      // Sync status bar color on mobile
      StatusBar.setBackgroundColor({ color: theme.bg }).catch(() => {});
      const isDark = theme.bg === "#000000" || theme.bg === "#0f172a" || theme.bg === "#0a1f18" || theme.bg === "#0b2038";
      StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
    } catch (e) {
      // Not on native device
    }
  }, [settings.theme]);

  useEffect(() => {
    let removeListener = null;
    try {
      const backListener = CapApp.addListener("backButton", ({ canGoBack }) => {
        if (editingCityIndex !== null) {
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
  }, [activeTab, editingCityIndex]);

  const saveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      // ignore
    }
  }, []);

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
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";
  const dateFormatted = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
      {/* Top Header / Brand */}
      <header className="app-header">
        <div className="header-brand">
          <ClockIcon size={20} className="brand-icon" />
          <h1 className="brand-title">World Clock</h1>
        </div>

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
            <span>Theme & Style</span>
          </button>
        </nav>
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
                />
              </div>

              {/* Digital readout & location */}
              <DigitalDisplay
                time={localTime}
                is24Hour={settings.is24Hour}
                showSeconds={settings.showSeconds}
                onToggleFormat={() =>
                  saveSettings({ ...settings, is24Hour: !settings.is24Hour })
                }
                subtitle={`${dateFormatted} · ${localTz.replace(/_/g, " ")}`}
              />
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
                    onEdit={() => setEditingCityIndex(index)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

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
          <ClockIcon size={20} />
          <span>Clock</span>
        </button>
        <button
          type="button"
          className={`bottom-nav-item ${activeTab === "cities" ? "active" : ""}`}
          onClick={() => setActiveTab("cities")}
        >
          <Globe size={20} />
          <span>Cities</span>
        </button>
        <button
          type="button"
          className={`bottom-nav-item ${activeTab === "appearance" ? "active" : ""}`}
          onClick={() => setActiveTab("appearance")}
        >
          <Palette size={20} />
          <span>Appearance</span>
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
    </div>
  );
}
