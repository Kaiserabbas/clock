import React from "react";

const CX = 380;
const CY = 380;

const polar = (r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
};

function Hand({ length, width, tail, angle, color = "var(--c-hands)" }) {
  const pts = [
    [-width / 2, tail],
    [-width / 2, 0],
    [-width / 5, -length],
    [width / 5, -length],
    [width / 2, 0],
    [width / 2, tail],
  ]
    .map(([x, y]) => `${CX + x},${CY + y}`)
    .join(" ");

  return (
    <polygon
      points={pts}
      fill={color}
      transform={`rotate(${angle} ${CX} ${CY})`}
      style={{
        filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.25))",
        transition: "transform 0.05s linear",
      }}
    />
  );
}

export default function AnalogClock({
  time,
  mini = false,
  showSeconds = true,
  smoothSweep = true,
  className = "",
}) {
  const { h, m, s, ms } = time;
  const secValue = smoothSweep ? s + ms / 1000 : s;
  const minAngle = (m + secValue / 60) * 6;
  const hourAngle = ((h % 12) + m / 60 + secValue / 3600) * 30;
  const secAngle = secValue * 6;

  // 12 Major Hour Circles & Marks
  const hourNumbers = [];
  for (let i = 1; i <= 12; i++) {
    const deg = i * 30;
    const [x, y] = polar(255, deg);
    const [mx, my] = polar(342, deg);
    const [lx, ly] = polar(255 + 44, deg);

    hourNumbers.push(
      <g key={`h${i}`}>
        <line
          x1={lx}
          y1={ly}
          x2={mx}
          y2={my}
          stroke="var(--c-ring)"
          strokeWidth={mini ? "3.5" : "2.5"}
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle
          cx={x}
          cy={y}
          r={mini ? "48" : "44"}
          fill="var(--c-face)"
          stroke="var(--c-ring)"
          strokeWidth={mini ? "3" : "2"}
        />
        <text
          x={x}
          y={y}
          className="hour-num"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--c-num)"
          style={{
            fontSize: mini ? "62px" : "56px",
            fontWeight: "700",
            fontFamily: "inherit",
          }}
        >
          {i}
        </text>
      </g>
    );
  }

  // 60 Minute Marks / Numbers
  const minuteNumbers = [];
  for (let i = 1; i <= 60; i++) {
    const deg = i * 6;
    if (i % 5 === 0) {
      const [x, y] = polar(342, deg);
      minuteNumbers.push(
        <g key={`m${i}`}>
          <circle
            cx={x}
            cy={y}
            r="16"
            fill="var(--c-face)"
            stroke="var(--c-ring)"
            strokeWidth="1.5"
          />
          <text
            x={x}
            y={y}
            className="min-five"
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--c-num)"
            style={{
              fontSize: "18px",
              fontWeight: "700",
              fontFamily: "inherit",
            }}
          >
            {i}
          </text>
        </g>
      );
    } else if (!mini) {
      const [tx, ty] = polar(352, deg);
      minuteNumbers.push(
        <text
          key={`m${i}`}
          x={tx}
          y={ty}
          className="min-num"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--c-num)"
          opacity="0.65"
          style={{
            fontSize: "24px",
            fontFamily: "inherit",
          }}
        >
          {i}
        </text>
      );
    }
  }

  return (
    <svg
      viewBox="0 0 760 760"
      className={`analog-clock-svg ${className}`}
      role="img"
      aria-label={`Clock showing ${h}:${m}`}
      style={{
        display: "block",
        maxWidth: "100%",
        height: "auto",
        filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.18))",
      }}
    >
      {/* Outer Dial & Bezel */}
      <circle
        cx={CX}
        cy={CY}
        r="374"
        fill="var(--c-face)"
        stroke="var(--c-ring)"
        strokeWidth="6"
      />
      <circle
        cx={CX}
        cy={CY}
        r="366"
        fill="none"
        stroke="var(--c-ring)"
        strokeWidth="1.5"
        strokeDasharray="2, 4"
        opacity="0.4"
      />

      {/* Markers */}
      {hourNumbers}
      {minuteNumbers}

      {/* Hour Hand */}
      <Hand
        length={mini ? 195 : 185}
        width={mini ? 20 : 16}
        tail={34}
        angle={hourAngle}
        color="var(--c-hands)"
      />

      {/* Minute Hand */}
      <Hand
        length={mini ? 295 : 290}
        width={mini ? 16 : 14}
        tail={44}
        angle={minAngle}
        color="var(--c-hands)"
      />

      {/* Second Hand */}
      {showSeconds && (
        <g transform={`rotate(${secAngle} ${CX} ${CY})`}>
          {/* Counterbalance tail */}
          <line
            x1={CX}
            y1={CY + 55}
            x2={CX}
            y2={CY - 315}
            stroke="var(--c-sec)"
            strokeWidth={mini ? "4.5" : "3.5"}
            strokeLinecap="round"
          />
          <circle
            cx={CX}
            cy={CY + 40}
            r="8"
            fill="var(--c-sec)"
          />
        </g>
      )}

      {/* Center Hub */}
      <circle
        cx={CX}
        cy={CY}
        r={mini ? 15 : 13}
        fill="var(--c-hub)"
        stroke="var(--c-ring)"
        strokeWidth="3.5"
      />
      <circle
        cx={CX}
        cy={CY}
        r="4"
        fill="var(--c-face)"
      />
    </svg>
  );
}
