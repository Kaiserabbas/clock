# World Clock & Precision Time

A modern, responsive, mobile-first World Clock application built with React, Vite, and Capacitor for Android.

![World Clock Preview](public/icon.svg)

## Features

- ⏱ **Precision Analog Clock**: Fluid vector SVG rendering with smooth sweep or discrete second ticking.
- 📱 **Mobile First & Responsive**: Optimized for phones and tablets with safe-area insets, mobile bottom navigation, and touch-optimized cards.
- 🌍 **Multi-City World Clocks**: Track up to 6 time zones simultaneously with relative day/hour differences (`+4h`, `-5h`, `Tomorrow`, `Yesterday`) and automatic daytime/nighttime sun/moon indicators.
- 🔍 **Interactive Timezone Search**: Search over 400+ IANA time zones or pick from popular global hubs with live time previews.
- 🎨 **6 Theme Presets & Customizer**:
  - Classic Light
  - Midnight Slate
  - AMOLED Black (battery saver for OLED screens)
  - Forest Emerald
  - Warm Sepia
  - Ocean Navy
  - Granular color picker for dial, markers, numerals, hands, and accent seconds hand.
- 🕒 **12h / 24h Modes**: Instant toggle between 12-hour AM/PM and 24-hour military digital formats.
- 🤖 **Android Native App (Capacitor)**: Built and packaged into installable Android APK with native status bar theming and back button handling.

## Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build production web bundle
npm run build
```

## Android APK Build

```bash
# Sync web build to native Android
npx cap sync android

# Build debug APK using Gradle
cd android
./gradlew assembleDebug
```

Built APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

## License

MIT © [Qaisar Abbas](https://github.com/Kaiserabbas)
