"use client";
import { useState } from "react";

export type SeriesPoint = { day: string } & Record<string, number | string>;

// Dependency-free SVG chart: stacked-free multi-line area chart with a hover readout.
export function AreaChart({
  data,
  keys,
  height = 240,
}: {
  data: SeriesPoint[];
  keys: { key: string; label: string; color: string }[];
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 760;
  const pad = { top: 12, right: 12, bottom: 26, left: 34 };
  const max = Math.max(
    1,
    ...data.flatMap((row) => keys.map((k) => Number(row[k.key]) || 0)),
  );
  const top = Math.ceil(max / 4) * 4 || 4;
  const x = (i: number) =>
    pad.left +
    (data.length > 1
      ? (i / (data.length - 1)) * (width - pad.left - pad.right)
      : 0);
  const y = (v: number) =>
    pad.top + (1 - v / top) * (height - pad.top - pad.bottom);
  const line = (key: string) =>
    data
      .map((row, i) => `${i ? "L" : "M"}${x(i)},${y(Number(row[key]) || 0)}`)
      .join(" ");
  const area = (key: string) =>
    `${line(key)} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(top * f));
  const labelEvery = Math.ceil(data.length / 6);
  return (
    <div className="ac-chart">
      <div className="ac-legend">
        {keys.map((k) => (
          <span key={k.key}>
            <i style={{ background: k.color }} /> {k.label}
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Daily activity chart"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          const px = ((event.clientX - box.left) / box.width) * width;
          const index = Math.round(
            ((px - pad.left) / (width - pad.left - pad.right)) *
              (data.length - 1),
          );
          setHover(Math.min(data.length - 1, Math.max(0, index)));
        }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y(t)}
              y2={y(t)}
              className="ac-grid"
            />
            <text
              x={pad.left - 8}
              y={y(t) + 4}
              textAnchor="end"
              className="ac-axis"
            >
              {t}
            </text>
          </g>
        ))}
        {keys.map((k) => (
          <g key={k.key}>
            <path d={area(k.key)} fill={k.color} opacity="0.08" />
            <path
              d={line(k.key)}
              fill="none"
              stroke={k.color}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </g>
        ))}
        {data.map((row, i) =>
          i % labelEvery === 0 ? (
            <text
              key={row.day}
              x={x(i)}
              y={height - 6}
              textAnchor="middle"
              className="ac-axis"
            >
              {new Date(row.day).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </text>
          ) : null,
        )}
        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={pad.top}
              y2={height - pad.bottom}
              className="ac-cursor"
            />
            {keys.map((k) => (
              <circle
                key={k.key}
                cx={x(hover)}
                cy={y(Number(data[hover][k.key]) || 0)}
                r="4"
                fill={k.color}
              />
            ))}
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="ac-tooltip"
          style={{ left: `${(x(hover) / width) * 100}%` }}
        >
          <strong>
            {new Date(data[hover].day).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </strong>
          {keys.map((k) => (
            <span key={k.key}>
              <i style={{ background: k.color }} /> {k.label}:{" "}
              {String(data[hover][k.key])}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sparkline({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  const w = 96;
  const h = 32;
  const max = Math.max(1, ...values);
  const pts = values.map(
    (v, i) =>
      `${(i / Math.max(1, values.length - 1)) * w},${h - 3 - (v / max) * (h - 6)}`,
  );
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="ac-spark" aria-hidden="true">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
