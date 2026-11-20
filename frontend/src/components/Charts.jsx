import React, { useState } from 'react';

export function AreaTrendChart({ data, labels, height = 210 }) {
  const [hoverIdx, setHoverIdx] = useState(9);
  const w = 680;
  const h = height;
  const pl = 38;
  const pr = 14;
  const pt = 14;
  const pb = 26;
  const max = 160;
  const iw = w - pl - pr;
  const ih = h - pb - pt;

  const pts = data.map((v, i) => [
    pl + (iw * i) / (data.length - 1),
    pt + ih - (ih * v) / max,
  ]);

  const linePath = pts
    .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
    .join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]} ${pt + ih} L ${pts[0][0]} ${pt + ih} Z`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="rfAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFCC00" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFCC00" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3, 4].map((i) => {
          const y = pt + (ih * i) / 4;
          const val = Math.round(max - (max * i) / 4);
          return (
            <g key={i}>
              <line
                x1={pl}
                y1={y}
                x2={w - pr}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray={i === 4 ? undefined : '3 4'}
              />
              <text x={pl - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
                {val}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#rfAreaGrad)" />
        <path d={linePath} fill="none" stroke="#172033" strokeWidth="2.2" strokeLinejoin="round" />

        {labels.map((lb, i) =>
          lb ? (
            <text
              key={i}
              x={pts[i][0]}
              y={h - 6}
              textAnchor="middle"
              className="fill-slate-400 text-[11px]"
            >
              {lb}
            </text>
          ) : null
        )}

        {/* Hover points */}
        {pts.map(([cx, cy], i) => {
          const active = i === hoverIdx;
          return (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoverIdx(i)}>
              <circle cx={cx} cy={cy} r={12} fill="transparent" />
              {active && (
                <>
                  <line x1={cx} y1={pt} x2={cx} y2={pt + ih} stroke="#172033" strokeDasharray="3 3" />
                  <circle cx={cx} cy={cy} r={5.5} fill="#FFFFFF" stroke="#172033" strokeWidth={2.5} />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {hoverIdx != null && (
        <div
          className="absolute top-1 bg-[#172033] text-white px-3 py-1.5 rounded-lg text-xs shadow-md pointer-events-none"
          style={{
            left: `${Math.min(72, Math.max(8, (hoverIdx / (data.length - 1)) * 85))}%`,
          }}
        >
          <p className="text-slate-300 text-[10px]">{labels[hoverIdx] || `Hari ke-${hoverIdx + 1}`}</p>
          <p className="font-semibold tabular-nums">{data[hoverIdx]} lamaran masuk</p>
        </div>
      )}
    </div>
  );
}

export function DonutChart({ segments, centerBig, centerSmall, size = 140 }) {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  const r = 52;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const el = (
            <circle
              key={i}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${Math.max(0, dash - 2.5)} ${circ}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display font-bold text-2xl text-[#172033] tabular-nums leading-none">
          {centerBig}
        </span>
        <span className="text-[11px] text-slate-500 mt-1">{centerSmall}</span>
      </div>
    </div>
  );
}
