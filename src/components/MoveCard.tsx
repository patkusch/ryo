"use client";

import { useState } from "react";
import { type Move, type Decision, itemById } from "@/lib/ryo";
import { Pill, Confidence, Label, gbp, moveMeta, decisionMeta } from "./ui";

export function MoveCard({
  move,
  rank,
  decision,
  onDecide,
  delay = "",
}: {
  move: Move;
  rank: number;
  decision: Decision;
  onDecide: (id: string, d: Decision) => void;
  delay?: string;
}) {
  const [open, setOpen] = useState(false);
  const item = itemById(move.itemId);
  const m = moveMeta[move.type];

  return (
    <div
      className={`group rounded-xl border bg-[color:var(--color-surface)] transition-colors rise ${delay}`}
      style={{ borderLeft: `2px solid ${m.color}` }}
    >
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div className="serif tnum w-8 shrink-0 text-2xl text-[color:var(--color-faint)]">
          {String(rank).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Pill type={move.type} />
            <Label>{item.name}</Label>
            {decision !== "pending" && (
              <span className="label ml-auto" style={{ color: decisionMeta[decision].color }}>
                ● {decisionMeta[decision].label}
              </span>
            )}
          </div>

          <h3 className="serif mt-3 text-2xl leading-tight tracking-tight">{move.title}</h3>
          <p className="mt-1.5 text-sm font-medium" style={{ color: m.color }}>
            {move.impactLine}
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
            {move.order && (
              <Fact label="Suggested order" value={`${move.order.suggested}`} unit={`${item.unit} · ${gbp(move.order.estCost)}`} />
            )}
            {move.predicted.revenue && <Fact label="Revenue" value={`+${gbp(move.predicted.revenue)}`} />}
            {move.predicted.wasteSaved && <Fact label="Waste saved" value={`−${gbp(move.predicted.wasteSaved)}`} />}
            {move.predicted.marginPts && <Fact label="Margin" value={`+${move.predicted.marginPts}pt`} />}
            <div className="ml-auto flex flex-col gap-1.5">
              <Label>Confidence</Label>
              <Confidence value={move.confidence} />
            </div>
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            className="label mt-4 inline-flex items-center gap-1.5 transition-colors hover:text-[color:var(--color-mint)]"
            style={{ color: "var(--color-mint-bright)" }}
          >
            {open ? "Hide reasoning" : "Why this move"}
            <span className={`transition-transform ${open ? "rotate-90" : ""}`}>→</span>
          </button>

          {open && (
            <div className="mt-4 rounded-lg border bg-[color:var(--color-panel)] p-4 rise">
              <p className="text-[15px] leading-relaxed text-[color:var(--color-ink-dim)]">{move.rationale}</p>
              <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border sm:grid-cols-4">
                {move.evidence.map((e) => (
                  <div key={e.label} className="bg-[color:var(--color-surface)] px-3 py-2.5">
                    <Label>{e.label}</Label>
                    <div className="tnum mt-1 text-sm font-semibold text-[color:var(--color-ink)]">{e.value}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[color:var(--color-muted)]">
                <span className="label" style={{ color: "var(--color-faint)" }}>Method&nbsp;&nbsp;</span>
                {move.method}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <DecisionBtn active={decision === "actioned"} tone="go" onClick={() => onDecide(move.id, "actioned")}>
              ✓ Action it
            </DecisionBtn>
            <DecisionBtn active={decision === "modified"} tone="warn" onClick={() => onDecide(move.id, "modified")}>
              ± Modify
            </DecisionBtn>
            <DecisionBtn active={decision === "ignored"} tone="mute" onClick={() => onDecide(move.id, "ignored")}>
              ✕ Ignore
            </DecisionBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <div className="flex items-baseline gap-1.5">
        <span className="serif tnum text-xl text-[color:var(--color-ink)]">{value}</span>
        {unit && <span className="text-xs text-[color:var(--color-muted)]">{unit}</span>}
      </div>
    </div>
  );
}

function DecisionBtn({
  children,
  active,
  tone,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  tone: "go" | "warn" | "mute";
  onClick: () => void;
}) {
  const activeStyle: React.CSSProperties = active
    ? tone === "go"
      ? { background: "var(--color-mint-bright)", color: "#111", borderColor: "var(--color-mint-bright)" }
      : tone === "warn"
      ? { background: "var(--color-amber)", color: "#111", borderColor: "var(--color-amber)" }
      : { background: "var(--color-ink)", color: "var(--color-bg)", borderColor: "var(--color-ink)" }
    : {};
  return (
    <button
      onClick={onClick}
      style={activeStyle}
      className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active ? "" : "text-[color:var(--color-ink-dim)] hover:border-[color:var(--color-muted)]"
      }`}
    >
      {children}
    </button>
  );
}
