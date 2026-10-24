import React from "react";
import { THEMES, FONTS, PART_DEFS } from "../constants/themes";
import { Palette, Type, Sliders, RotateCcw } from "lucide-react";

export default function AppearanceSettings({
  settings,
  onChange,
  onResetDefaults,
}) {
  const currentTheme = THEMES[settings.theme] || THEMES.classic;

  const updateSetting = (key, value) => {
    onChange({ ...settings, [key]: value });
  };

  const updatePartColor = (partKey, color) => {
    const parts = { ...(settings.parts || {}), [partKey]: color };
    onChange({ ...settings, parts });
  };

  const resetCustomColors = () => {
    onChange({ ...settings, parts: {} });
  };

  const hasCustomParts = Object.keys(settings.parts || {}).length > 0;

  return (
    <div className="appearance-settings">
      {/* Themes */}
      <section className="settings-section">
        <div className="section-title-wrap">
          <Palette size={18} className="section-icon" />
          <h3 className="section-title">Color Theme</h3>
        </div>

        <div className="themes-grid">
          {Object.entries(THEMES).map(([key, t]) => {
            const isActive = settings.theme === key;
            return (
              <button
                key={key}
                type="button"
                className={`theme-card ${isActive ? "active" : ""}`}
                onClick={() => updateSetting("theme", key)}
              >
                <div
                  className="theme-card-preview"
                  style={{
                    backgroundColor: t.bg,
                    borderColor: t.border || t.ink,
                  }}
                >
                  <div
                    className="preview-dial"
                    style={{
                      backgroundColor: t.face,
                      borderColor: t.ink,
                    }}
                  >
                    <span
                      className="preview-hand"
                      style={{ backgroundColor: t.ink }}
                    />
                    <span
                      className="preview-sec"
                      style={{ backgroundColor: t.accent }}
                    />
                  </div>
                </div>
                <span className="theme-card-label">{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Typography */}
      <section className="settings-section">
        <div className="section-title-wrap">
          <Type size={18} className="section-icon" />
          <h3 className="section-title">Typography & Numerals</h3>
        </div>

        <div className="fonts-grid">
          {Object.entries(FONTS).map(([key, f]) => {
            const isActive = settings.font === key;
            return (
              <button
                key={key}
                type="button"
                className={`font-card ${isActive ? "active" : ""}`}
                style={{ fontFamily: f.stack }}
                onClick={() => updateSetting("font", key)}
              >
                <span className="font-card-preview">12 3 6 9</span>
                <span className="font-card-label">{f.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Functional Preferences */}
      <section className="settings-section">
        <div className="section-title-wrap">
          <Sliders size={18} className="section-icon" />
          <h3 className="section-title">Clock Options</h3>
        </div>

        <div className="toggles-list">
          <label className="toggle-item">
            <div className="toggle-text">
              <span className="toggle-title">Show Seconds Hand</span>
              <span className="toggle-desc">Display the animated seconds hand on the main clock</span>
            </div>
            <input
              type="checkbox"
              className="toggle-checkbox"
              checked={settings.showSeconds}
              onChange={(e) => updateSetting("showSeconds", e.target.checked)}
            />
          </label>

          <label className="toggle-item">
            <div className="toggle-text">
              <span className="toggle-title">Smooth Sweep Movement</span>
              <span className="toggle-desc">Continuous fluid sweep instead of discrete 1-second ticks</span>
            </div>
            <input
              type="checkbox"
              className="toggle-checkbox"
              checked={settings.smoothSweep}
              onChange={(e) => updateSetting("smoothSweep", e.target.checked)}
            />
          </label>

          <label className="toggle-item">
            <div className="toggle-text">
              <span className="toggle-title">24-Hour Digital Format</span>
              <span className="toggle-desc">Display time as 00:00 to 23:59 instead of 12-hour AM/PM</span>
            </div>
            <input
              type="checkbox"
              className="toggle-checkbox"
              checked={settings.is24Hour}
              onChange={(e) => updateSetting("is24Hour", e.target.checked)}
            />
          </label>
        </div>
      </section>

      {/* Custom Part Colors */}
      <section className="settings-section">
        <div className="section-title-wrap">
          <Palette size={18} className="section-icon" />
          <h3 className="section-title">Custom Element Colors</h3>
        </div>
        <p className="section-desc">
          Fine-tune individual clock components to match your exact taste.
        </p>

        <div className="parts-colors-grid">
          {PART_DEFS.map((part) => {
            const currentColor = (settings.parts || {})[part.key] || part.from(currentTheme);
            return (
              <div key={part.key} className="part-color-item">
                <span className="part-color-label">{part.label}</span>
                <div className="part-color-picker-wrap">
                  <input
                    type="color"
                    className="part-color-input"
                    value={currentColor}
                    onChange={(e) => updatePartColor(part.key, e.target.value)}
                  />
                  <span className="part-color-hex">{currentColor.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {hasCustomParts && (
          <button
            type="button"
            className="btn btn-secondary mt-12"
            onClick={resetCustomColors}
          >
            Reset Custom Colors to Theme
          </button>
        )}
      </section>

      {/* Global Reset */}
      <div className="reset-section">
        <button
          type="button"
          className="btn btn-danger"
          onClick={onResetDefaults}
        >
          <RotateCcw size={15} />
          Reset All Settings to Defaults
        </button>
      </div>
    </div>
  );
}
