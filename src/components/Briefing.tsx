"use client";

import {
  cafe, moves as mockMoves, opinion as mockOpinion, lastWeekScore,
  type Decision, type BriefData, type TraceStep,
} from "@/lib/ryo";
import { Label } from "./ui";
import { MoveCard } from "./MoveCard";

const PIPELINE = ["Data", "Insight", "Action", "Memory", "Persona"];

export function Briefing({
  brief,
  status,
  onReload,
  decisions,
  onDecide,
  onExecute,
}: {
  brief: BriefData | null;
  status: "loading" | "ready" | "error";
  onReload: () => void;
  decisions: Record<string, Decision>;
  onDecide: (id: string, d: Decision) => void;
  onExecute: () => void;
}) {
  const loading = status === "loading" && !brief;
  const moves = brief?.moves ?? mockMoves;
  const opinion = brief?.opinion ?? mockOpinion;
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
            <em style={{ fontStyle: "italic", color: "var(--color-mint)" }}>already handled.</em>
          </h1>
          <div className="lg:pb-2">
            {loading ? (
              <div className="space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-[color:var(--color-line)]" />
                <div className="h-3 w-full animate-pulse rounded bg-[color:var(--color-line)]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[color:var(--color-line)]" />
              </div>
            ) : (
              <p className="text-[15px] leading-relaxed text-[color:var(--color-ink-dim)]">
                <span className="serif" style={{ color: "var(--color-mint)" }}>Ryo —&nbsp;</span>
                {opinion}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button
                onClick={onExecute}
                className="label inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors"
                style={{ background: "var(--color-mint-bright)", color: "#111" }}
              >
                Execute this week →
              </button>
              <button
                onClick={onReload}
                disabled={status === "loading"}
                className="label inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[color:var(--color-ink-dim)] transition-colors hover:border-[color:var(--color-muted)] disabled:opacity-50"
              >
                {status === "loading" ? "Reasoning…" : "↻ Re-run Ryo"}
              </button>
            </div>
            <div className="mt-3">
              <Label>{moves.length} moves · {cafe.weekOf} · {Math.round(lastWeekScore.accuracy * 100)}% last-week accuracy</Label>
            </div>
          </div>
        </div>
      </header>

      <AgentTrace status={status} trace={brief?.trace} />

      <div className="hairline my-6" />

      <div className="mb-4 flex items-center justify-between">
        <Label>This Monday's moves · ranked</Label>
        <Label>{loading ? "reasoning…" : `${pending} pending decision${pending === 1 ? "" : "s"}`}</Label>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border bg-[color:var(--color-surface)] p-6" style={{ borderLeft: "2px solid var(--color-line)" }}>
              <div className="h-3 w-24 animate-pulse rounded bg-[color:var(--color-line)]" />
              <div className="mt-3 h-6 w-2/3 animate-pulse rounded bg-[color:var(--color-line)]" />
              <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-[color:var(--color-line)]" />
            </div>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}

function AgentTrace({ status, trace }: { status: "loading" | "ready" | "error"; trace?: TraceStep[] }) {
  const engineOf = (name: string): "rules" | "claude" | undefined => trace?.find((t) => t.agent === name)?.engine;
  const done = (name: string) => !!trace?.find((t) => t.agent === name);

  return (
    <div className="mt-6 rounded-xl border bg-[color:var(--color-surface)] px-5 py-4 rise rise-1">
      <div className="flex items-center justify-between">
        <Label>Agent pipeline</Label>
        {status === "error" && <span className="label" style={{ color: "var(--color-clay)" }}>fallback · deterministic</span>}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2">
        {PIPELINE.map((name, i) => {
          const engine = engineOf(name);
          const complete = done(name);
          const active = status === "loading" && !complete;
          const color = engine === "claude" ? "var(--color-mint)" : engine === "rules" ? "var(--color-blue)" : "var(--color-muted)";
          return (
            <div key={name} className="flex items-center gap-1.5">
              <span
                className="label inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
                style={{ color: complete ? color : "var(--color-faint)", borderColor: complete ? "transparent" : "var(--color-line)", background: complete ? `${engine === "claude" ? "#6fb48814" : "#93a9dd14"}` : "transparent" }}
              >
                <span
                  className={active ? "animate-pulse" : ""}
                  style={{ width: 6, height: 6, borderRadius: 99, background: complete ? color : "var(--color-faint)", display: "inline-block" }}
                />
                {name}
                {engine && <span style={{ opacity: 0.6 }}>· {engine}</span>}
              </span>
              {i < PIPELINE.length - 1 && <span style={{ color: "var(--color-faint)" }}>→</span>}
            </div>
          );
        })}
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-[color:var(--color-muted)]">
        {status === "loading"
          ? "Ryo is reasoning — Data assembles the context, Insight and Action run on Claude, Memory feeds last week's outcomes back in."
          : "Data & Memory are deterministic; Insight, Action & Persona run on Claude (Opus 5). Numbers are costed by the order engine, not the model."}
      </p>
    </div>
  );
}
