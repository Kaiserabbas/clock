import React, { useState, useMemo } from "react";
import { Search, X, Check, Globe } from "lucide-react";
import { POPULAR_CITIES, getAllTimeZones } from "../constants/zones";
import { formatDigital, readTime } from "../utils/time";

export default function TimezonePickerModal({
  initialCity,
  onSave,
  onClose,
  now,
  is24Hour = false,
}) {
  const [cityName, setCityName] = useState(initialCity.name || "");
  const [selectedTz, setSelectedTz] = useState(initialCity.tz || "Europe/London");
  const [searchTerm, setSearchTerm] = useState("");

  const allZones = useMemo(() => getAllTimeZones(), []);

  // Filtered timezone list with priority for popular cities
  const filteredList = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) {
      return POPULAR_CITIES;
    }

    const matchedPopular = POPULAR_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q) ||
        c.tz.toLowerCase().includes(q)
    );

    const matchedZones = allZones
      .filter((tz) => tz.toLowerCase().includes(q))
      .map((tz) => {
        const parts = tz.split("/");
        const name = parts[parts.length - 1].replace(/_/g, " ");
        return { name, tz, country: parts[0]?.replace(/_/g, " ") };
      });

    // Merge and deduplicate by tz
    const map = new Map();
    matchedPopular.forEach((item) => map.set(item.tz, item));
    matchedZones.forEach((item) => {
      if (!map.has(item.tz)) map.set(item.tz, item);
    });

    return Array.from(map.values()).slice(0, 50);
  }, [searchTerm, allZones]);

  const handleSelect = (item) => {
    setSelectedTz(item.tz);
    if (!cityName || cityName === initialCity.name) {
      setCityName(item.name);
    }
  };

  const handleDone = (e) => {
    e.preventDefault();
    onSave({
      name: cityName.trim() || selectedTz.split("/").pop().replace(/_/g, " "),
      tz: selectedTz,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Globe size={18} className="modal-icon" />
            <h2 className="modal-title">Select World City</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleDone} className="modal-content">
          <div className="form-group">
            <label className="form-label">Display City Name</label>
            <input
              type="text"
              className="form-input"
              value={cityName}
              maxLength={26}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="e.g. Dubai, New York, London..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Search Timezone or City</label>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Type city, country, or zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchTerm("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="timezone-list">
            {filteredList.map((item) => {
              const isSelected = selectedTz === item.tz;
              let previewTime = "";
              try {
                const t = readTime(now, item.tz);
                const { timeStr, ampm } = formatDigital(t.h, t.m, t.s, is24Hour, false);
                previewTime = `${timeStr} ${ampm}`;
              } catch (e) {
                previewTime = "--:--";
              }

              return (
                <button
                  key={item.tz}
                  type="button"
                  className={`tz-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(item)}
                >
                  <div className="tz-item-info">
                    <span className="tz-item-name">{item.name}</span>
                    <span className="tz-item-sub">
                      {item.country ? `${item.country} · ` : ""}{item.tz.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="tz-item-side">
                    <span className="tz-item-preview">{previewTime}</span>
                    {isSelected && <Check size={16} className="check-icon" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Apply City
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
