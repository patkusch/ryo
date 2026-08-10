import type { MoveType, Decision } from "@/lib/ryo";

export const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

export const moveMeta: Record<
  MoveType,
  { label: string; glyph: string; color: string; tint: string }
> = {
  stock_up: { label: "Stock Up", glyph: "↑", color: "var(--color-mint)", tint: "#6fb48818" },
  promote: { label: "Promote", glyph: "◎", color: "var(--color-blue)", tint: "#93a9dd18" },
  cut: { label: "Cut", glyph: "↓", color: "var(--color-clay)", tint: "#cd8a6218" },
  experiment: { label: "Experiment", glyph: "◇", color: "var(--color-amber)", tint: "#ccab6818" },
};

export const decisionMeta: Record<Decision, { label: string; color: string }> = {
  pending: { label: "Pending", color: "var(--color-muted)" },
  actioned: { label: "Actioned", color: "var(--color-mint)" },
  modified: { label: "Modified", color: "var(--color-amber)" },
  ignored: { label: "Ignored", color: "var(--color-muted)" },
};

export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`label ${className}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border bg-[color:var(--color-surface)] ${className}`}>{children}</div>
  );
}

export function Pill({ type }: { type: MoveType }) {
  const m = moveMeta[type];
  return (
    <span
      className="label inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{ color: m.color, background: m.tint, fontSize: "0.62rem" }}
    >
      <span aria-hidden style={{ fontSize: "0.8rem" }}>{m.glyph}</span>
      {m.label}
    </span>
  );
}

export function Confidence({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2" title={`Confidence ${pct}%`}>
      <div className="h-1 w-16 overflow-hidden rounded-full bg-[color:var(--color-line)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--color-mint-bright)" }} />
      </div>
      <span className="tnum text-xs text-[color:var(--color-muted)]">{pct}%</span>
    </div>
  );
}

/** Big serif stat, à la the reference "175 units / 69%". */
export function BigStat({
  label,
  value,
  unit,
  sub,
  accent = "ink",
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  accent?: "ink" | "mint" | "blue" | "clay";
}) {
  const color =
    accent === "mint" ? "var(--color-mint)" : accent === "blue" ? "var(--color-blue)" : accent === "clay" ? "var(--color-clay)" : "var(--color-ink)";
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex items-baseline gap-1.5">
        <span className="serif tnum text-4xl leading-none" style={{ color }}>{value}</span>
        {unit && <span className="text-sm text-[color:var(--color-muted)]">{unit}</span>}
      </div>
      {sub && <span className="text-sm text-[color:var(--color-ink-dim)]">{sub}</span>}
    </div>
  );
}
