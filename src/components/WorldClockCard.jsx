import React from "react";
import AnalogClock from "./AnalogClock";
import { formatDigital, getTimeDifference, readTime } from "../utils/time";
import { Sun, Moon, Edit3 } from "lucide-react";

export default function WorldClockCard({
  city,
  now,
  localDayKey,
  is24Hour = false,
  smoothSweep = true,
  onEdit,
}) {
  let time;
  let error = null;

  try {
    time = readTime(now, city.tz);
  } catch (err) {
    error = "Invalid Timezone";
  }

  if (error || !time) {
    return (
      <div className="world-clock-card error-card">
        <div className="world-clock-header">
          <span className="world-clock-city">{city.name}</span>
          <button
            type="button"
            className="edit-city-btn"
            onClick={onEdit}
            title="Edit City"
          >
            <Edit3 size={15} />
          </button>
        </div>
        <p className="world-clock-error">{error || "Could not load time"}</p>
      </div>
    );
  }

  const { timeStr, ampm } = formatDigital(time.h, time.m, time.s, is24Hour, false);
  const diff = getTimeDifference(now, city.tz);
  const dayDiff =
    time.dayKey === localDayKey
      ? ""
      : time.dayKey > localDayKey
      ? "Tomorrow"
      : "Yesterday";

  return (
    <div className="world-clock-card" onClick={onEdit} role="button" tabIndex={0}>
      <div className="world-clock-header">
        <div className="world-clock-city-group">
          <div className="world-clock-daytime-icon" title={time.isDaytime ? "Daytime" : "Nighttime"}>
            {time.isDaytime ? (
              <Sun size={15} className="sun-icon" />
            ) : (
              <Moon size={15} className="moon-icon" />
            )}
          </div>
          <span className="world-clock-city">{city.name}</span>
        </div>

        <button
          type="button"
          className="edit-city-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title="Change City"
        >
          <Edit3 size={14} />
        </button>
      </div>

      <div className="world-clock-body">
        <div className="world-clock-dial">
          <AnalogClock
            time={time}
            mini={true}
            showSeconds={false}
            smoothSweep={smoothSweep}
          />
        </div>

        <div className="world-clock-info">
          <div className="world-clock-digital">
            <span className="world-digital-text">{timeStr}</span>
            {ampm && <span className="world-digital-ampm">{ampm}</span>}
          </div>

          <div className="world-clock-subtext">
            {diff && <span className="diff-badge">{diff}</span>}
            {dayDiff && <span className="day-badge">{dayDiff}</span>}
            <span className="tz-label">{city.tz.split("/").pop().replace(/_/g, " ")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
