import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";
import { pad } from "../utils/time";

export default function StopwatchTab() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState([]);
  const startTimeRef = useRef(0);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedTime;

      const update = () => {
        setElapsedTime(performance.now() - startTimeRef.current);
        animFrameRef.current = requestAnimationFrame(update);
      };

      animFrameRef.current = requestAnimationFrame(update);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    const previousTotal = laps.reduce((acc, curr) => acc + curr.duration, 0);
    const lapDuration = elapsedTime - previousTotal;
    setLaps([{ id: laps.length + 1, duration: lapDuration, total: elapsedTime }, ...laps]);
  };

  // Format millisecond time
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centis = Math.floor((ms % 1000) / 10);

    const timeMain = hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;

    return { timeMain, centis: pad(centis) };
  };

  const { timeMain, centis } = formatTime(elapsedTime);

  // Determine best and worst laps
  let bestLapId = null;
  let worstLapId = null;
  if (laps.length >= 2) {
    const sorted = [...laps].sort((a, b) => a.duration - b.duration);
    bestLapId = sorted[0].id;
    worstLapId = sorted[sorted.length - 1].id;
  }

  // Calculate rotating indicator angle (one full circle per 60 seconds)
  const dialAngle = ((elapsedTime % 60000) / 60000) * 360;

  return (
    <div className="stopwatch-container">
      {/* Stopwatch Circular Display */}
      <div className="stopwatch-dial-wrapper">
        <svg viewBox="0 0 300 300" className="stopwatch-dial-svg">
          <circle
            cx="150"
            cy="150"
            r="135"
            fill="var(--card-bg)"
            stroke="var(--border)"
            strokeWidth="6"
          />
          {/* Animated Second Sweep Arc */}
          <circle
            cx="150"
            cy="150"
            r="135"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeDasharray="848.2"
            strokeDashoffset={848.2 - (848.2 * ((elapsedTime % 60000) / 60000))}
            strokeLinecap="round"
            transform="rotate(-90 150 150)"
            style={{ transition: isRunning ? "none" : "stroke-dashoffset 0.2s ease" }}
          />
        </svg>

        <div className="stopwatch-time-content">
          <span className="sw-time-main">{timeMain}</span>
          <span className="sw-time-centis">.{centis}</span>
        </div>
      </div>

      {/* Stopwatch Action Buttons */}
      <div className="stopwatch-actions">
        <button
          type="button"
          className="sw-btn sw-btn-secondary"
          onClick={isRunning ? handleLap : handleReset}
          disabled={elapsedTime === 0 && !isRunning}
        >
          {isRunning ? (
            <>
              <Flag size={18} />
              <span>Lap</span>
            </>
          ) : (
            <>
              <RotateCcw size={18} />
              <span>Reset</span>
            </>
          )}
        </button>

        <button
          type="button"
          className={`sw-btn sw-btn-primary ${isRunning ? "sw-btn-stop" : "sw-btn-start"}`}
          onClick={handleStartStop}
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
      </div>

      {/* Laps List */}
      {laps.length > 0 && (
        <div className="stopwatch-laps-wrapper">
          <div className="laps-header">
            <span>Lap</span>
            <span>Split Time</span>
            <span>Total Time</span>
          </div>

          <div className="laps-list">
            {laps.map((lap) => {
              const lapTimeFmt = formatTime(lap.duration);
              const totalTimeFmt = formatTime(lap.total);
              const isBest = lap.id === bestLapId;
              const isWorst = lap.id === worstLapId;

              return (
                <div
                  key={lap.id}
                  className={`lap-row ${isBest ? "lap-best" : isWorst ? "lap-worst" : ""}`}
                >
                  <span className="lap-number">Lap {lap.id}</span>
                  <span className="lap-duration">
                    {lapTimeFmt.timeMain}.{lapTimeFmt.centis}
                  </span>
                  <span className="lap-total">
                    {totalTimeFmt.timeMain}.{totalTimeFmt.centis}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
