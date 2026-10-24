import React, { useState } from "react";
import { Plus, Bell, Trash2, Clock, Check, X, RotateCcw } from "lucide-react";
import { pad } from "../utils/time";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AlarmTab({
  alarms,
  onSaveAlarms,
  is24Hour = false,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // New alarm form state
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState("AM");
  const [label, setLabel] = useState("");
  const [repeatDays, setRepeatDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri default

  const handleOpenAdd = () => {
    setEditingId(null);
    setHour(7);
    setMinute(0);
    setAmpm("AM");
    setLabel("Morning Alarm");
    setRepeatDays([1, 2, 3, 4, 5]);
    setIsModalOpen(true);
  };

  const handleToggleAlarm = (id) => {
    const updated = alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    onSaveAlarms(updated);
  };

  const handleDeleteAlarm = (id) => {
    const updated = alarms.filter((a) => a.id !== id);
    onSaveAlarms(updated);
  };

  const handleToggleDay = (dayIdx) => {
    if (repeatDays.includes(dayIdx)) {
      setRepeatDays(repeatDays.filter((d) => d !== dayIdx));
    } else {
      setRepeatDays([...repeatDays, dayIdx].sort());
    }
  };

  const handleSaveAlarm = (e) => {
    e.preventDefault();
    let normalizedHour = hour;
    if (!is24Hour) {
      if (ampm === "PM" && hour < 12) normalizedHour = hour + 12;
      if (ampm === "AM" && hour === 12) normalizedHour = 0;
    }

    const newAlarm = {
      id: editingId || Date.now().toString(),
      hour: normalizedHour,
      minute,
      label: label.trim() || "Alarm",
      repeatDays,
      enabled: true,
    };

    if (editingId) {
      onSaveAlarms(alarms.map((a) => (a.id === editingId ? newAlarm : a)));
    } else {
      onSaveAlarms([...alarms, newAlarm]);
    }
    setIsModalOpen(false);
  };

  const formatAlarmTime = (h, m) => {
    if (is24Hour) {
      return { timeStr: `${pad(h)}:${pad(m)}`, period: "" };
    }
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const period = h >= 12 ? "PM" : "AM";
    return { timeStr: `${pad(displayHour)}:${pad(m)}`, period };
  };

  const formatRepeatDays = (days) => {
    if (!days || days.length === 0) return "Once";
    if (days.length === 7) return "Every day";
    if (days.length === 5 && days.every((d) => d >= 1 && d <= 5)) return "Weekdays";
    if (days.length === 2 && days.includes(0) && days.includes(6)) return "Weekends";
    return days.map((d) => DAYS_OF_WEEK[d]).join(", ");
  };

  return (
    <div className="alarm-tab-container">
      {/* Header */}
      <div className="alarm-header-bar">
        <div>
          <h2 className="section-title">Alarms</h2>
          <p className="section-desc">Manage wake-up calls and scheduled reminders</p>
        </div>

        <button
          type="button"
          className="btn btn-primary add-alarm-btn"
          onClick={handleOpenAdd}
        >
          <Plus size={18} />
          <span>Add Alarm</span>
        </button>
      </div>

      {/* Alarms List */}
      <div className="alarms-list">
        {alarms.length === 0 ? (
          <div className="empty-alarms-card">
            <Bell size={36} className="empty-bell-icon" />
            <h3>No Alarms Set</h3>
            <p>Tap "Add Alarm" to schedule reminders or wake-up chimes.</p>
          </div>
        ) : (
          alarms.map((alarm) => {
            const { timeStr, period } = formatAlarmTime(alarm.hour, alarm.minute);
            return (
              <div
                key={alarm.id}
                className={`alarm-card ${alarm.enabled ? "enabled" : "disabled"}`}
              >
                <div className="alarm-card-left">
                  <div className="alarm-time-display">
                    <span className="alarm-time-numbers">{timeStr}</span>
                    {period && <span className="alarm-period">{period}</span>}
                  </div>

                  <div className="alarm-details-row">
                    <span className="alarm-label">{alarm.label}</span>
                    <span className="alarm-dot">·</span>
                    <span className="alarm-repeat">
                      {formatRepeatDays(alarm.repeatDays)}
                    </span>
                  </div>
                </div>

                <div className="alarm-card-right">
                  {/* Custom Toggle Switch */}
                  <label className="alarm-switch">
                    <input
                      type="checkbox"
                      checked={alarm.enabled}
                      onChange={() => handleToggleAlarm(alarm.id)}
                    />
                    <span className="slider round"></span>
                  </label>

                  <button
                    type="button"
                    className="alarm-delete-btn"
                    onClick={() => handleDeleteAlarm(alarm.id)}
                    title="Delete Alarm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Alarm Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Bell size={18} className="modal-icon" />
                <h2 className="modal-title">
                  {editingId ? "Edit Alarm" : "Set New Alarm"}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAlarm} className="modal-content">
              {/* Time Inputs */}
              <div className="alarm-time-selector-wrap">
                <div className="alarm-time-picker">
                  <input
                    type="number"
                    min={is24Hour ? 0 : 1}
                    max={is24Hour ? 23 : 12}
                    className="alarm-time-input"
                    value={hour}
                    onChange={(e) => setHour(parseInt(e.target.value) || 0)}
                  />
                  <span className="alarm-picker-sep">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className="alarm-time-input"
                    value={pad(minute)}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                      setMinute(val);
                    }}
                  />

                  {!is24Hour && (
                    <div className="ampm-toggle-group">
                      <button
                        type="button"
                        className={`ampm-btn ${ampm === "AM" ? "active" : ""}`}
                        onClick={() => setAmpm("AM")}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        className={`ampm-btn ${ampm === "PM" ? "active" : ""}`}
                        onClick={() => setAmpm("PM")}
                      >
                        PM
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Label */}
              <div className="form-group">
                <label className="form-label">Alarm Label</label>
                <input
                  type="text"
                  className="form-input"
                  value={label}
                  maxLength={30}
                  placeholder="e.g. Wake up, Gym, Meeting..."
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>

              {/* Repeat Days */}
              <div className="form-group">
                <label className="form-label">Repeat Days</label>
                <div className="repeat-days-grid">
                  {DAYS_OF_WEEK.map((dayName, idx) => {
                    const isSelected = repeatDays.includes(idx);
                    return (
                      <button
                        key={dayName}
                        type="button"
                        className={`day-chip ${isSelected ? "selected" : ""}`}
                        onClick={() => handleToggleDay(idx)}
                      >
                        {dayName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
