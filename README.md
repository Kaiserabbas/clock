# World Clock, Timer, Stopwatch & Alarms

A modern, responsive, mobile-first Clock & Precision Time suite built with React 19, Vite, and Capacitor for Android.

![World Clock Preview](public/icon.svg)

## Features

- 🖥️ **Mobile Fullscreen StandBy / Desk Mode (Side-by-Side)**:
  - Analog dial on one side and digital time, weekday, date, and weather on the other side.
  - Interactive "Flip" toggle to swap analog and digital positions.
  - **Screen WakeLock API**: Keeps screen on while docked on desk or bedside table.
  - **Nightstand Dim Mode**: Soft brightness reduction for dark rooms.
  - Auto-hiding controls with tap-to-reveal.
- ⏰ **Alarms Suite**:
  - Set multiple alarms with custom time, labels, and repeat days (weekdays, weekends, custom, or once).
  - Web Audio API alarm melody generator (no external audio assets required).
  - Ringing overlay with **Snooze (5 mins)** and **Dismiss** options.
  - Hardware back button handling on Android.
- ⏱️ **Precision Stopwatch**:
  - Centisecond accuracy (00:00:00.00) with animated radial second sweep.
  - Lap recording with automated **Best Lap** (green) and **Worst Lap** (red) highlighting.
- ⏳ **Countdown Timer**:
  - Circular progress ring with smooth countdown visualization.
  - Quick presets: 1m, 3m, 5m, 10m, 15m, 25m (Pomodoro), 30m, 1h + custom hours/minutes/seconds.
  - +1 minute quick extension button and audio chime alert.
- 🌡️ **Live Temperature & Weather**:
  - Live local weather powered by Open-Meteo with 20-minute local caching.
  - One-tap toggle between **Celsius (°C)** and **Fahrenheit (°F)**.
  - City-level temperatures displayed directly on world clock cards.
- 📅 **Date & Weekday Display**:
  - High-visibility Weekday badge and full Calendar Date.
  - **Luxury Watch Day-Date Aperture**: Beveled window at 3 o'clock on analog dial (`[ SAT | 24 ]`).
- 🌍 **Multi-City World Clocks**: Track multiple time zones with relative day/hour differences (`+4h`, `-5h`, `Tomorrow`, `Yesterday`) and automatic daytime/nighttime sun/moon indicators.
- 🎨 **6 Theme Presets & Customizer**:
  - Classic Light, Midnight Slate, AMOLED Black, Forest Emerald, Warm Sepia, Ocean Navy + granular color pickers.
- 🤖 **Android Native App (Capacitor)**: Installable Android APK with native status bar theming and back button handling.

## Development

```bash
npm install
npm run dev
npm run build
```

## Android APK Build

```bash
npx cap sync android
cd android
./gradlew assembleDebug
```

Built APK is available at `release/clock-debug.apk` and `android/app/build/outputs/apk/debug/app-debug.apk`.

## License

MIT © [Qaisar Abbas](https://github.com/Kaiserabbas)
