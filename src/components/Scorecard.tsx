"use client";

import { history, lastWeekScore } from "@/lib/ryo";
import { Label, BigStat, Pill, gbp } from "./ui";

export function Scorecard() {
  return (
    <div>
      <header className="rise pb-6">
        <Label>Closed loop · last week vs actual</Label>
        <h1 className="serif mt-3 text-4xl tracking-tight sm:text-5xl">
          What I said, <em style={{ fontStyle: "italic", color: "var(--color-mint)" }}>what happened.</em>
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[color:var(--color-ink-dim)]">
          Every recommendation is scored against what the tills actually did. This is the part that isn't theatre — the model adjusts on its own misses, in the open.
        </p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-6 rounded-xl border bg-[color:var(--color-surface)] px-6 py-6 sm:grid-cols-4 rise rise-1">
        <BigStat label="Forecast accuracy" value={`${Math.round(lastWeekScore.accuracy * 100)}%`} accent="mint" sub="predicted vs actual" />
        <BigStat label="Moves actioned" value={`${lastWeekScore.movesActioned}/${lastWeekScore.movesTotal}`} sub="owner decisions" />
        <BigStat label="Revenue added" value={`+${gbp(lastWeekScore.revenueAdded)}`} accent="mint" sub="attributed" />
        <BigStat label="Waste saved" value={`−${gbp(lastWeekScore.wasteSaved)}`} accent="blue" sub="binned stock avoided" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-[color:var(--color-surface)] rise rise-2">
        <div className="border-b px-6 py-4"><Label>Recommendation ledger</Label></div>
        <div className="divide-y">
          {history.map((h) => (
            <div key={h.id} className="grid grid-cols-1 gap-3 px-6 py-5 sm:grid-cols-[1.6fr_1fr_1fr_auto] sm:items-center">
              <div>
                <Pill type={h.type} />
                <div className="serif mt-2 text-lg leading-snug">{h.title}</div>
              </div>
              <div>
                <Label>Predicted</Label>
                <div className="tnum mt-1 text-sm text-[color:var(--color-ink-dim)]">{h.predicted}</div>
              </div>
              <div>
                <Label>Actual</Label>
                <div className="tnum mt-1 text-sm font-semibold">{h.actual}</div>
              </div>
              <div className="flex sm:justify-end">
                <span
                  className="label inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5"
                  style={h.hit
                    ? { color: "var(--color-mint)", borderColor: "#3a6b47", background: "#1a2b1f" }
                    : { color: "var(--color-amber)", borderColor: "#5c4a24", background: "#2a2413" }}
                >
                  {h.hit ? "✓ On target" : "△ Off"}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[color:var(--color-muted)] sm:col-span-4">
                <span className="label" style={{ color: "var(--color-faint)" }}>Adjustment&nbsp;&nbsp;</span>
                {h.deltaNote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
