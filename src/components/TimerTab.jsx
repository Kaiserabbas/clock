import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Plus, Bell, Check } from "lucide-react";
import { pad } from "../utils/time";
import { startAlarmChime, stopAlarmChime } from "../utils/audio";

const PRESETS = [
  { label: "1m", seconds: 60 },
  { label: "3m", seconds: 180 },
  { label: "5m", seconds: 300 },
  { label: "10m", seconds: 600 },
  { label: "15m", seconds: 900 },
  { label: "25m", seconds: 1500 }, // Pomodoro
  { label: "30m", seconds: 1800 },
  { label: "1h", seconds: 3600 },
];

export default function TimerTab() {
  const [totalSeconds, setTotalSeconds] = useState(300); // 5 min default
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Time picker state for setup mode
  const [inputHours, setInputHours] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(5);
  const [inputSeconds, setInputSeconds] = useState(0);

  const timerIntervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsRunning(false);
            setIsFinished(true);
            startAlarmChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, remainingSeconds]);

  const handleStart = () => {
    if (remainingSeconds === 0) {
      const calculated = inputHours * 3600 + inputMinutes * 60 + inputSeconds;
      if (calculated === 0) return;
      setTotalSeconds(calculated);
      setRemainingSeconds(calculated);
    }
    setIsFinished(false);
    stopAlarmChime();
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    stopAlarmChime();
    const calculated = inputHours * 3600 + inputMinutes * 60 + inputSeconds || 300;
    setRemainingSeconds(calculated);
    setTotalSeconds(calculated);
  };

  const handleApplyPreset = (sec) => {
    setIsRunning(false);
    setIsFinished(false);
    stopAlarmChime();
    setTotalSeconds(sec);
    setRemainingSeconds(sec);
    setInputHours(Math.floor(sec / 3600));
    setInputMinutes(Math.floor((sec % 3600) / 60));
    setInputSeconds(sec % 60);
  };

  const handleAddMinute = () => {
    setTotalSeconds((prev) => prev + 60);
    setRemainingSeconds((prev) => prev + 60);
  };

  const handleDismissFinished = () => {
    setIsFinished(false);
    stopAlarmChime();
    handleReset();
  };

  // Format display
  const h = Math.floor(remainingSeconds / 3600);
  const m = Math.floor((remainingSeconds % 3600) / 60);
  const s = remainingSeconds % 60;

  const displayTime = h > 0
    ? `${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(m)}:${pad(s)}`;

  // SVG circular progress calculation
  const circumference = 2 * Math.PI * 135; // ~848.2
  const progressRatio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const strokeOffset = circumference * (1 - progressRatio);

  return (
    <div className="timer-container">
      {/* Finished Ringing Alarm Overlay */}
      {isFinished && (
        <div className="timer-finished-banner">
          <div className="timer-finished-content">
            <Bell size={28} className="ringing-bell" />
            <div className="timer-finished-text">
              <h3 className="timer-finished-title">Timer Finished!</h3>
              <p className="timer-finished-subtitle">Time is up</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary dismiss-timer-btn"
            onClick={handleDismissFinished}
          >
            <Check size={18} />
            <span>Dismiss</span>
          </button>
        </div>
      )}

      {/* Circular Countdown Progress Ring */}
      <div className="timer-dial-wrapper">
        <svg viewBox="0 0 300 300" className="timer-dial-svg">
          <circle
            cx="150"
            cy="150"
            r="135"
            fill="var(--card-bg)"
            stroke="var(--border)"
            strokeWidth="8"
          />
          <circle
            cx="150"
            cy="150"
            r="135"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            transform="rotate(-90 150 150)"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>

        <div className="timer-time-content">
          <span className="timer-time-text">{displayTime}</span>
          <span className="timer-subtext">
            {isRunning ? "Counting Down" : isFinished ? "Time Expired" : "Ready"}
          </span>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="timer-actions">
        <button
          type="button"
          className="sw-btn sw-btn-secondary"
          onClick={handleReset}
          disabled={remainingSeconds === totalSeconds && !isRunning}
        >
          <RotateCcw size={18} />
          <span>Reset</span>
        </button>

        <button
          type="button"
          className={`sw-btn sw-btn-primary ${isRunning ? "sw-btn-stop" : "sw-btn-start"}`}
          onClick={isRunning ? handlePause : handleStart}
        >
          {isRunning ? (
            <>
              <Pause size={20} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={20} />
              <span>Start</span>
            </>
          )}
        </button>

        {isRunning && (
          <button
            type="button"
            className="sw-btn sw-btn-secondary"
            onClick={handleAddMinute}
            title="Add 1 minute"
          >
            <Plus size={18} />
            <span>+1m</span>
          </button>
        )}
      </div>

      {/* Preset Quick Buttons */}
      <div className="timer-presets-section">
        <span className="presets-label">Quick Presets</span>
        <div className="presets-grid">
          {PRESETS.map((p) => (
            <button
              key={p.seconds}
              type="button"
              className={`preset-btn ${totalSeconds === p.seconds && !isRunning ? "active" : ""}`}
              onClick={() => handleApplyPreset(p.seconds)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Duration Adjuster (when paused or reset) */}
      {!isRunning && (
        <div className="custom-timer-setup">
          <span className="presets-label">Custom Duration</span>
          <div className="time-picker-inputs">
            <div className="picker-col">
              <label>Hours</label>
              <input
                type="number"
                min="0"
                max="23"
                value={inputHours}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setInputHours(val);
                  const total = val * 3600 + inputMinutes * 60 + inputSeconds;
                  setTotalSeconds(total);
                  setRemainingSeconds(total);
                }}
              />
            </div>
            <span className="picker-sep">:</span>
            <div className="picker-col">
              <label>Min</label>
              <input
                type="number"
                min="0"
                max="59"
                value={inputMinutes}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                  setInputMinutes(val);
                  const total = inputHours * 3600 + val * 60 + inputSeconds;
                  setTotalSeconds(total);
                  setRemainingSeconds(total);
                }}
              />
            </div>
            <span className="picker-sep">:</span>
            <div className="picker-col">
              <label>Sec</label>
              <input
                type="number"
                min="0"
                max="59"
                value={inputSeconds}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                  setInputSeconds(val);
                  const total = inputHours * 3600 + inputMinutes * 60 + val;
                  setTotalSeconds(total);
                  setRemainingSeconds(total);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
