"use client";

import { useState } from "react";
import {
  forecast,
  weather,
  weekdayRevenue,
  weatherCurve,
  dailyRevenue,
  dailyRevenueMean,
  unitEconomics,
  marginAt,
  forwardRisk,
  prepPlan,
  backtest,
  type PrepAction,
} from "@/lib/ryo";
import { Label, BigStat, gbp } from "./ui";
import { ChartFrame, BarChart, AreaLine, SawtoothLine } from "./charts";

export function Dashboard() {
  return (
    <div className="space-y-5">
      <BacktestBand />

      {/* Prep sheet */}
      <div className="overflow-hidden rounded-xl border bg-[color:var(--color-surface)] rise rise-1">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <Label>Prep sheet · next forecast day</Label>
            <div className="serif mt-1 text-lg">{forecast.busiest ? "Tuesday, 11 Aug" : ""}</div>
          </div>
          <Label>generated {forecast.generated} · {forecast.backtestWeeks}-week backtest</Label>
        </div>

        <div className="grid grid-cols-1 gap-6 px-6 py-6 sm:grid-cols-3">
          <BigStat label="Forecast items" value={forecast.totalUnits.toLocaleString()} unit="units" sub="Drinks and food across the trading day" />
          <BigStat label="Iced share" value={`${Math.round(forecast.icedShare * 100)}%`} accent="blue" sub="Of all drinks sold" />
          <BigStat label="Busiest daypart" value={forecast.busiest.name} sub={`${forecast.busiest.units} units · ${forecast.busiest.window}`} />
        </div>

        {/* weather strip */}
        <div className="mx-6 mb-6 rounded-lg border-l-2 bg-[color:var(--color-matcha-100)] px-5 py-4" style={{ borderColor: "var(--color-mint-bright)" }}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
            <span aria-hidden>☀︎</span>
            <span className="tnum font-semibold">30°C</span>
            <span className="text-[color:var(--color-ink-dim)]">{weather.summary}</span>
          </div>
          <div className="mt-1 text-sm text-[color:var(--color-muted)]">
            Iced drinks lift ~{weather.icedLiftPct}%, hot drinks drag {weather.hotDragPct}% — fitted from this shop’s own history.
          </div>
        </div>

        {/* daypart table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-y">
                <th className="label px-6 py-3 text-left font-normal">Daypart</th>
                <th className="label px-3 py-3 text-right font-normal">Drinks</th>
                <th className="label px-3 py-3 text-right font-normal">Seasonal</th>
                <th className="label px-3 py-3 text-right font-normal">Pastry</th>
                <th className="label px-3 py-3 text-right font-normal">Retail</th>
                <th className="label px-3 py-3 text-right font-normal">Total</th>
                <th className="label px-6 py-3 text-right font-normal">Iced</th>
              </tr>
            </thead>
            <tbody>
              {forecast.dayparts.map((d) => {
                const total = d.drinks + d.seasonal + d.pastry + d.retail;
                return (
                  <tr key={d.daypart} className="border-b last:border-0">
                    <td className="px-6 py-3.5">
                      <div className="font-medium">{d.daypart}</div>
                      <div className="label mt-0.5" style={{ letterSpacing: "0.1em" }}>{d.window}</div>
                    </td>
                    <td className="tnum px-3 py-3.5 text-right">{d.drinks}</td>
                    <td className="tnum px-3 py-3.5 text-right">{d.seasonal}</td>
                    <td className="tnum px-3 py-3.5 text-right">{d.pastry}</td>
                    <td className="tnum px-3 py-3.5 text-right">{d.retail}</td>
                    <td className="tnum px-3 py-3.5 text-right font-semibold">{total}</td>
                    <td className="tnum px-6 py-3.5 text-right" style={{ color: "var(--color-blue)" }}>{Math.round(d.icedShare * 100)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <PrepPlanCards />
      </div>

      {/* two-up charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rise rise-2">
          <ChartFrame
            eyebrow="Demand shape"
            title="Revenue by weekday"
            right={<Label>mean daily revenue</Label>}
            caption={<><strong className="font-semibold text-[color:var(--color-ink)]">Thursday and Tuesday</strong> carry the week — 29% and 24% above the {gbp(weekdayRevenue.average)} Mon–Sat average. That’s an anchor-day office pattern, not noise: model it as a fixed shape rather than smoothing it away.</>}
          >
            <BarChart data={weekdayRevenue.days} average={weekdayRevenue.average} />
          </ChartFrame>
        </div>
        <div className="rise rise-3">
          <ChartFrame
            eyebrow="Weather sensitivity"
            title="Iced mix vs. max temperature"
            right={<Label>iced share of drinks</Label>}
            caption={<>Iced share climbs <strong className="font-semibold text-[color:var(--color-ink)]">49pp</strong> between the coldest and warmest buckets. Weather is a real prep input here, not a talking point — and it compounds with the midweek peak rather than cancelling it.</>}
          >
            <AreaLine data={weatherCurve} />
          </ChartFrame>
        </div>
      </div>

      {/* trading history */}
      <div className="rise rise-4">
        <ChartFrame
          eyebrow="Trading history"
          title="Daily revenue"
          right={<Label>12 weeks</Label>}
          caption={<>Daily totals across the last 12 weeks, against a {gbp(dailyRevenueMean)} mean. The saw-tooth is the week shape repeating — the level, not the wobble, is what a trading decision should react to.</>}
        >
          <SawtoothLine data={dailyRevenue} mean={dailyRevenueMean} />
        </ChartFrame>
      </div>

      {/* unit economics + forward risk */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UnitEconomics />
        <ForwardRisk />
      </div>
    </div>
  );
}

function BacktestBand() {
  return (
    <div className="rounded-xl border bg-[color:var(--color-surface)] px-6 py-5 rise">
      <div className="flex flex-wrap items-center gap-3">
        <Label>Backtest · {backtest.window}</Label>
        <span className="label inline-flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ color: "var(--color-mint)", borderColor: "#3a6b47", background: "#1a2b1f" }}>
          ✓ Matcha Drinks ±{backtest.matchaError}%
        </span>
        <span className="label inline-flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ color: "var(--color-amber)", borderColor: "#5c4a24", background: "#2a2413" }}>
          ⚠ All Categories ±{backtest.allError}%
        </span>
      </div>
      <p className="mt-3 max-w-4xl text-[15px] leading-relaxed text-[color:var(--color-ink-dim)]">{backtest.note}</p>
    </div>
  );
}

const prepActionMeta: Record<PrepAction, { label: string; color: string; glyph: string }> = {
  stop: { label: "Stop prep", color: "var(--color-clay)", glyph: "⊘" },
  half: { label: "Half batch", color: "var(--color-amber)", glyph: "⊖" },
  full: { label: "Full prep", color: "var(--color-mint)", glyph: "⊕" },
};

function PrepPlanCards() {
  return (
    <div className="border-t px-6 py-6">
      <div className="flex items-center justify-between">
        <Label>Prep plan · the {prepPlan.changeover} changeover</Label>
        <Label>surplus window {prepPlan.surplusWindow}</Label>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-lg border sm:grid-cols-2">
        {prepPlan.plans.map((p) => {
          const m = prepActionMeta[p.action];
          return (
            <div key={p.category} className="bg-[color:var(--color-panel)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span style={{ color: m.color }}>{m.glyph}</span>
                <span className="font-medium">{p.category}</span>
                <span className="label" style={{ color: m.color }}>{m.label}</span>
              </div>
              <p className="mt-1.5 text-sm text-[color:var(--color-muted)]">{p.note}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-muted)]">{prepPlan.note}</p>
    </div>
  );
}

function Segmented<T extends string>({ options, value, onChange }: { options: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-full border bg-[color:var(--color-panel)] p-1">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${value === o.key ? "" : "text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"}`}
          style={value === o.key ? { background: "var(--color-matcha-200)", color: "var(--color-mint-bright)" } : {}}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function UnitEconomics() {
  const [scenario, setScenario] = useState<"base" | "p30" | "p80">("base");
  const uplift = scenario === "base" ? 0 : scenario === "p30" ? 30 : 80;
  return (
    <div className="flex flex-col rounded-xl border bg-[color:var(--color-surface)] rise rise-1">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-5">
        <div>
          <Label>Unit economics</Label>
          <h3 className="serif mt-1.5 text-xl">Margin by item</h3>
        </div>
        <Segmented
          value={scenario}
          onChange={setScenario}
          options={[{ key: "base", label: "Base" }, { key: "p30", label: "Matcha +30%" }, { key: "p80", label: "Matcha +80%" }]}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b">
              <th className="label px-6 py-3 text-left font-normal">Item</th>
              <th className="label px-3 py-3 text-right font-normal">Price</th>
              <th className="label px-3 py-3 text-right font-normal">COGS</th>
              <th className="label px-3 py-3 text-right font-normal">Margin</th>
              <th className="label px-6 py-3 text-right font-normal">vs Base</th>
            </tr>
          </thead>
          <tbody>
            {unitEconomics.map((u) => {
              const base = marginAt(u, 0).margin;
              const now = marginAt(u, uplift);
              const delta = (now.margin - base) * 100;
              return (
                <tr key={u.name} className="border-b last:border-0">
                  <td className="px-6 py-3.5">
                    <div className="font-medium">{u.name}</div>
                    <div className="label mt-0.5">{u.category}</div>
                  </td>
                  <td className="tnum px-3 py-3.5 text-right text-[color:var(--color-ink-dim)]">£{u.price.toFixed(2)}</td>
                  <td className="tnum px-3 py-3.5 text-right text-[color:var(--color-ink-dim)]">£{now.cogs.toFixed(2)}</td>
                  <td className="tnum px-3 py-3.5 text-right font-semibold">{(now.margin * 100).toFixed(1)}%</td>
                  <td className="tnum px-6 py-3.5 text-right" style={{ color: delta < -0.05 ? "var(--color-clay)" : "var(--color-muted)" }}>
                    {uplift === 0 ? "—" : `${delta.toFixed(1)}pt`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ForwardRisk() {
  const r = forwardRisk;
  return (
    <div className="flex flex-col rounded-xl border bg-[color:var(--color-surface)] rise rise-2">
      <div className="flex items-start justify-between gap-3 border-b px-6 py-5">
        <div>
          <Label>Forward risk · {r.horizon}</Label>
          <h3 className="serif mt-1.5 text-xl">{r.title}</h3>
        </div>
        <span className="label inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5" style={{ color: "var(--color-amber)", borderColor: "#5c4a24" }}>
          ⌖ {r.tag}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-6 px-6 py-6">
        <BigStat label="Weekday volume step" value={`${r.weekdayStep}%`} accent="clay" sub="Modelled footfall loss on weekdays" />
        <BigStat label="Weekly contribution" value={`−${gbp(Math.abs(r.weeklyContribution))}`} accent="clay" sub={`From ${gbp(r.from)} to ${gbp(r.to)}`} />
      </div>
      <div className="px-6 pb-6">
        <Label>Annualised</Label>
        <div className="serif tnum mt-1 text-3xl" style={{ color: "var(--color-clay)" }}>−{gbp(Math.abs(r.annualised))}</div>
        <div className="mt-1 text-sm text-[color:var(--color-muted)]">{r.retained}% of today’s contribution retained</div>
      </div>
      <div className="border-t px-6 py-4 text-sm leading-relaxed text-[color:var(--color-ink-dim)]">{r.note}</div>
    </div>
  );
}
