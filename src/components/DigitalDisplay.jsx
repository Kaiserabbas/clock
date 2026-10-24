import React from "react";
import { formatDigital } from "../utils/time";

export default function DigitalDisplay({
  time,
  is24Hour = false,
  showSeconds = true,
  onToggleFormat,
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

      {subtitle && <p className="digital-subtitle">{subtitle}</p>}
    </div>
  );
}
