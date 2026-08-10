"use client";

import { cafe, moves, opinion, lastWeekScore, type Decision } from "@/lib/ryo";
import { Label } from "./ui";
import { MoveCard } from "./MoveCard";

export function Briefing({
  decisions,
  onDecide,
  onExecute,
}: {
  decisions: Record<string, Decision>;
  onDecide: (id: string, d: Decision) => void;
  onExecute: () => void;
}) {
  const pending = moves.filter((m) => (decisions[m.id] ?? "pending") === "pending").length;

  return (
    <div>
      {/* Hero */}
      <header className="rise pb-8">
        <Label>{cafe.name} · {cafe.location}</Label>
        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h1 className="serif text-5xl leading-[0.98] tracking-tight sm:text-6xl">
            Your Monday,
            <br />
            <em className="not-italic" style={{ fontStyle: "italic", color: "var(--color-mint)" }}>already handled.</em>
          </h1>
          <div className="lg:pb-2">
            <p className="text-[15px] leading-relaxed text-[color:var(--color-ink-dim)]">
              <span className="serif" style={{ color: "var(--color-mint)" }}>Ryo —&nbsp;</span>
              {opinion}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button
                onClick={onExecute}
                className="label inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors"
                style={{ background: "var(--color-mint-bright)", color: "#111" }}
              >
                Execute this week →
              </button>
              <Label>{moves.length} moves · generated {cafe.weekOf} · {Math.round(lastWeekScore.accuracy * 100)}% last-week accuracy</Label>
            </div>
          </div>
        </div>
      </header>

      <div className="hairline mb-6" />

      <div className="mb-4 flex items-center justify-between">
        <Label>This Monday's moves · ranked</Label>
        <Label>{pending} pending decision{pending === 1 ? "" : "s"}</Label>
      </div>

      <div className="space-y-4">
        {moves.map((m, i) => (
          <MoveCard
            key={m.id}
            move={m}
            rank={i + 1}
            decision={decisions[m.id] ?? "pending"}
            onDecide={onDecide}
            delay={`rise-${Math.min(i + 1, 5)}`}
          />
        ))}
      </div>
    </div>
  );
}
