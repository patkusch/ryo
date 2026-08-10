"use client";

// Lightweight inline-SVG charts — no dependency, styled to match the deck.

const GREEN = "#5cb67c";
const MINT = "#57b87a";
const BLUE = "#5b8def";

export function ChartFrame({
  eyebrow,
  title,
  right,
  children,
  caption,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  caption?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-[color:var(--color-surface)]">
      <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
        <div>
          <div className="label">{eyebrow}</div>
          <h3 className="serif mt-1.5 text-xl">{title}</h3>
        </div>
        <div className="pt-1">{right}</div>
      </div>
      <div className="px-4 py-5 sm:px-6">{children}</div>
      {caption && (
        <div className="border-t px-6 py-4 text-sm leading-relaxed text-[color:var(--color-ink-dim)]">{caption}</div>
      )}
    </div>
  );
}

/* ---- Bar chart (revenue by weekday) ---- */
export function BarChart({
  data,
  average,
  format = (n: number) => `£${n}`,
}: {
  data: { day: string; value: number }[];
  average?: number;
  format?: (n: number) => string;
}) {
  const W = 620, H = 260, padL = 52, padB = 28, padT = 12;
  const max = Math.max(...data.map((d) => d.value)) * 1.12;
  const plotH = H - padB - padT;
  const bw = (W - padL) / data.length;
  const y = (v: number) => padT + plotH * (1 - v / max);
  const ticks = [0, max * 0.25, max * 0.5, max * 0.75, max].map((t) => Math.round(t / 50) * 50);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeDasharray="3 5" />
          <text x={padL - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-muted)" className="tnum">
            {format(t)}
          </text>
        </g>
      ))}
      {average != null && (
        <>
          <line x1={padL} x2={W} y1={y(average)} y2={y(average)} stroke="var(--color-ink-dim)" strokeDasharray="2 3" />
          <text x={padL + 4} y={y(average) - 6} fontSize="11" fill="var(--color-ink-dim)">week average</text>
        </>
      )}
      {data.map((d, i) => {
        const x = padL + i * bw + bw * 0.22;
        const w = bw * 0.56;
        return (
          <g key={d.day}>
            <rect x={x} y={y(d.value)} width={w} height={padT + plotH - y(d.value)} rx="3" fill={GREEN} opacity="0.92" />
            <text x={x + w / 2} y={H - 8} textAnchor="middle" fontSize="12" fill="var(--color-muted)">{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---- Area/line S-curve (weather sensitivity) ---- */
export function AreaLine({
  data,
}: {
  data: { temp: number; iced: number }[];
}) {
  const W = 620, H = 260, padL = 46, padB = 34, padT = 12;
  const plotH = H - padB - padT, plotW = W - padL - 8;
  const maxY = 60;
  const xs = data.map((d) => d.temp);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const px = (t: number) => padL + ((t - minX) / (maxX - minX)) * plotW;
  const py = (v: number) => padT + plotH * (1 - v / maxY);
  const line = data.map((d, i) => `${i ? "L" : "M"}${px(d.temp)},${py(d.iced)}`).join(" ");
  const area = `${line} L${px(maxX)},${padT + plotH} L${px(minX)},${padT + plotH} Z`;
  const yticks = [0, 15, 30, 45, 60];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      <defs>
        <linearGradient id="wx" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.28" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
      </defs>
      {yticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - 8} y1={py(t)} y2={py(t)} stroke="var(--color-line)" strokeDasharray="3 5" />
          <text x={padL - 10} y={py(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-muted)" className="tnum">{t}%</text>
        </g>
      ))}
      <path d={area} fill="url(#wx)" />
      <path d={line} fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d) => (
        <circle key={d.temp} cx={px(d.temp)} cy={py(d.iced)} r="3" fill={BLUE} />
      ))}
      {data.filter((_, i) => i % 1 === 0).map((d) => (
        <text key={d.temp} x={px(d.temp)} y={H - 12} textAnchor="middle" fontSize="10.5" fill="var(--color-muted)" className="tnum">{d.temp}°C</text>
      ))}
      <text x={(padL + W) / 2} y={H - 1} textAnchor="middle" fontSize="10.5" fill="var(--color-faint)">Daily max temperature</text>
    </svg>
  );
}

/* ---- Sawtooth line (trading history) ---- */
export function SawtoothLine({
  data,
  mean,
}: {
  data: { label: string; value: number }[];
  mean: number;
}) {
  const W = 900, H = 300, padL = 56, padB = 30, padT = 14;
  const plotH = H - padB - padT, plotW = W - padL - 10;
  const max = Math.max(...data.map((d) => d.value)) * 1.08;
  const px = (i: number) => padL + (i / (data.length - 1)) * plotW;
  const py = (v: number) => padT + plotH * (1 - v / max);
  const line = data.map((d, i) => `${i ? "L" : "M"}${px(i)},${py(d.value)}`).join(" ");
  const yticks = [0, max * 0.25, max * 0.5, max * 0.75, max].map((t) => Math.round(t / 350) * 350);
  const labelIdx = data.map((_, i) => i).filter((i) => i % 7 === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      {yticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - 10} y1={py(t)} y2={py(t)} stroke="var(--color-line)" strokeDasharray="3 5" />
          <text x={padL - 10} y={py(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-muted)" className="tnum">£{t.toLocaleString()}</text>
        </g>
      ))}
      <line x1={padL} x2={W - 10} y1={py(mean)} y2={py(mean)} stroke="var(--color-ink-dim)" strokeDasharray="2 3" />
      <text x={padL + 4} y={py(mean) - 6} fontSize="11" fill="var(--color-ink-dim)">mean</text>
      <path d={line} fill="none" stroke={MINT} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {labelIdx.map((i) => (
        <text key={i} x={px(i)} y={H - 10} textAnchor="middle" fontSize="10.5" fill="var(--color-muted)">{data[i].label}</text>
      ))}
    </svg>
  );
}
