export const THEMES = {
  classic: {
    label: "Classic Light",
    bg: "#f8fafc",
    cardBg: "#ffffff",
    face: "#ffffff",
    ink: "#0f172a",
    muted: "#64748b",
    border: "#e2e8f0",
    accent: "#c0392b"
  },
  midnight: {
    label: "Midnight Slate",
    bg: "#0f172a",
    cardBg: "#1e293b",
    face: "#1e293b",
    ink: "#f1f5f9",
    muted: "#94a3b8",
    border: "#334155",
    accent: "#ff7a59"
  },
  amoled: {
    label: "AMOLED Black",
    bg: "#000000",
    cardBg: "#111111",
    face: "#0a0a0a",
    ink: "#ffffff",
    muted: "#888888",
    border: "#222222",
    accent: "#38bdf8"
  },
  forest: {
    label: "Forest Emerald",
    bg: "#0a1f18",
    cardBg: "#123328",
    face: "#163a2d",
    ink: "#e8f3dc",
    muted: "#86af96",
    border: "#1d4738",
    accent: "#f2c14e"
  },
  paper: {
    label: "Warm Sepia",
    bg: "#f4ede0",
    cardBg: "#fcf8f0",
    face: "#fbf6ea",
    ink: "#2c221a",
    muted: "#7d6b5b",
    border: "#decbb5",
    accent: "#2d6a4f"
  },
  ocean: {
    label: "Ocean Navy",
    bg: "#0b2038",
    cardBg: "#133152",
    face: "#183b63",
    ink: "#f0f6fc",
    muted: "#8ba7c7",
    border: "#1f4773",
    accent: "#38bdf8"
  }
};

export const FONTS = {
  din: {
    label: "Technical / Modern",
    stack: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Bahnschrift", sans-serif'
  },
  rounded: {
    label: "Soft Rounded",
    stack: 'ui-rounded, "SF Pro Rounded", "Nunito", "Quicksand", system-ui, sans-serif'
  },
  serif: {
    label: "Editorial Serif",
    stack: '"Iowan Old Style", "Palatino Linotype", "Georgia", serif'
  },
  mono: {
    label: "Digital Mono",
    stack: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace'
  }
};

export const PART_DEFS = [
  { key: "face", label: "Clock Face Dial", from: (t) => t.face },
  { key: "ring", label: "Hour Markers & Ticks", from: (t) => t.ink },
  { key: "num", label: "Numerals", from: (t) => t.ink },
  { key: "hands", label: "Hour & Minute Hands", from: (t) => t.ink },
  { key: "sec", label: "Seconds Hand", from: (t) => t.accent },
  { key: "hub", label: "Center Hub Pin", from: (t) => t.accent }
];

export const STORAGE_KEY = "kaiserabbas-clock-v2";

export const DEFAULT_SETTINGS = {
  cities: [
    { name: "Dubai", tz: "Asia/Dubai" },
    { name: "London", tz: "Europe/London" },
    { name: "New York", tz: "America/New_York" }
  ],
  showSeconds: true,
  smoothSweep: true,
  is24Hour: false,
  tempUnit: "C",
  showDayDate: true,
  theme: "midnight",
  font: "din",
  parts: {}
};
