import React from "react";
import { Globe, Plus, Trash2, ArrowUpDown, Edit3 } from "lucide-react";
import { readTime, formatDigital } from "../utils/time";

export default function CitySettings({
  cities,
  onUpdateCity,
  onAddCity,
  onRemoveCity,
  onOpenPicker,
  now,
  is24Hour = false,
}) {
  return (
    <div className="city-settings">
      <div className="city-settings-header">
        <div>
          <h3 className="section-title">World Cities Monitored</h3>
          <p className="section-desc">
            Configure the clocks displayed alongside your local time.
          </p>
        </div>

        {cities.length < 6 && (
          <button
            type="button"
            className="btn btn-primary add-city-btn"
            onClick={onAddCity}
          >
            <Plus size={16} />
            Add City
          </button>
        )}
      </div>

      <div className="cities-edit-list">
        {cities.map((city, idx) => {
          let timePreview = "";
          try {
            const t = readTime(now, city.tz);
            const { timeStr, ampm } = formatDigital(t.h, t.m, t.s, is24Hour, false);
            timePreview = `${timeStr} ${ampm}`;
          } catch (e) {
            timePreview = "--:--";
          }

          return (
            <div key={idx} className="city-edit-card">
              <div className="city-edit-left">
                <div className="city-edit-badge">{idx + 1}</div>
                <div className="city-edit-details">
                  <span className="city-edit-name">{city.name}</span>
                  <span className="city-edit-tz">
                    <Globe size={12} className="inline-icon" />
                    {city.tz.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div className="city-edit-right">
                <span className="city-edit-time">{timePreview}</span>
                <div className="city-edit-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onOpenPicker(idx)}
                    title="Change Timezone"
                  >
                    <Edit3 size={15} />
                  </button>

                  {cities.length > 1 && (
                    <button
                      type="button"
                      className="icon-btn delete-btn"
                      onClick={() => onRemoveCity(idx)}
                      title="Remove City"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
