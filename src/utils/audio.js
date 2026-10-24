// Web Audio API Synthesizer for Alarms and Timers (Zero external dependencies)
let audioCtx = null;
let alarmOscillatorInterval = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTimerBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.warn("Audio playback not allowed:", e);
  }
}

export function startAlarmChime() {
  stopAlarmChime();
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playChimeNote = (freq, startOffset, duration = 0.25) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);

      gain.gain.setValueAtTime(0.35, ctx.currentTime + startOffset);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + startOffset + duration
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startOffset);
      osc.stop(ctx.currentTime + startOffset + duration);
    };

    const triggerCycle = () => {
      playChimeNote(659.25, 0.0, 0.2); // E5
      playChimeNote(783.99, 0.15, 0.2); // G5
      playChimeNote(987.77, 0.3, 0.25); // B5
      playChimeNote(1318.51, 0.45, 0.4); // E6
    };

    triggerCycle();
    alarmOscillatorInterval = setInterval(triggerCycle, 1800);
  } catch (e) {
    console.warn("Alarm chime error:", e);
  }
}

export function stopAlarmChime() {
  if (alarmOscillatorInterval) {
    clearInterval(alarmOscillatorInterval);
    alarmOscillatorInterval = null;
  }
}
