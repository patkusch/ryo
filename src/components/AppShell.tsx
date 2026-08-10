"use client";

import { useCallback, useEffect, useState } from "react";
import { cafe, type Decision, type BriefData } from "@/lib/ryo";
import { Dashboard } from "./Dashboard";
import { Briefing } from "./Briefing";
import { ActionPack } from "./ActionPack";
import { Scorecard } from "./Scorecard";
import { Critique } from "./Critique";

type Tab = "briefing" | "dashboard" | "action" | "history" | "critique";
const TABS: { key: Tab; label: string }[] = [
  { key: "briefing", label: "Agent" },
  { key: "dashboard", label: "Dashboard" },
  { key: "action", label: "Action Pack" },
  { key: "history", label: "Scorecard" },
  { key: "critique", label: "Critique" },
];

const TAB_KEYS = new Set<Tab>(["briefing", "dashboard", "action", "history", "critique"]);
function initialTab(): Tab {
  if (typeof window === "undefined") return "briefing";
  const t = new URLSearchParams(window.location.search).get("tab") as Tab | null;
  return t && TAB_KEYS.has(t) ? t : "briefing";
}

export function AppShell() {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [briefStatus, setBriefStatus] = useState<"loading" | "ready" | "error">("loading");

  // Run the multi-agent pipeline (Data → Insight → Action → Memory → Persona).
  const runBrief = useCallback(async () => {
    setBriefStatus("loading");
    try {
      const res = await fetch("/api/brief", { method: "POST" });
      if (!res.ok) throw new Error("bad status");
      setBrief((await res.json()) as BriefData);
      setBriefStatus("ready");
    } catch {
      setBriefStatus("error");
    }
  }, []);
  useEffect(() => { runBrief(); }, [runBrief]);

  // persist closed-loop decisions across reloads
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ryo.decisions");
      if (raw) setDecisions(JSON.parse(raw));
    } catch {}
  }, []);
  const decide = (id: string, d: Decision) => {
    setDecisions((prev) => {
      const next = { ...prev, [id]: prev[id] === d ? ("pending" as Decision) : d };
      try { localStorage.setItem("ryo.decisions", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-full">
      {/* top bar */}
      <header className="sticky top-0 z-20 border-b bg-[color:var(--color-bg-deep)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <button onClick={() => setTab("briefing")} className="flex items-center gap-2.5">
            <Whisk />
            <span className="serif text-xl tracking-tight">Ryo</span>
            <span className="label hidden sm:inline" style={{ color: "var(--color-faint)" }}>· {cafe.name}</span>
            {brief && (
              <span
                className="label ml-1 hidden rounded-full border px-2 py-0.5 sm:inline"
                title={brief.source === "claude" ? "Generated live by the Claude agent pipeline" : "Served from the deterministic fallback"}
                style={brief.source === "claude"
                  ? { color: "var(--color-mint)", borderColor: "#3a6b47" }
                  : { color: "var(--color-muted)", borderColor: "var(--color-line)" }}
              >
                {brief.source === "claude" ? "● Live agents" : "○ Fallback"}
              </span>
            )}
          </button>

          <nav className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative rounded-md px-2.5 py-1.5 text-sm transition-colors sm:px-3 ${
                  tab === t.key ? "text-[color:var(--color-ink)]" : "text-[color:var(--color-muted)] hover:text-[color:var(--color-ink-dim)]"
                }`}
              >
                {t.label}
                {tab === t.key && (
                  <span className="absolute inset-x-2.5 -bottom-[13px] hidden h-px sm:block" style={{ background: "var(--color-mint-bright)" }} />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        {tab === "briefing" && <Briefing brief={brief} status={briefStatus} onReload={runBrief} decisions={decisions} onDecide={decide} onExecute={() => setTab("action")} />}
        {tab === "dashboard" && <Dashboard />}
        {tab === "action" && <ActionPack brief={brief} decisions={decisions} />}
        {tab === "history" && <Scorecard />}
        {tab === "critique" && <Critique />}
      </main>

      <footer className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="hairline mb-4" />
        <p className="label" style={{ color: "var(--color-faint)" }}>
          Ryo · AI café operator · demo data · action &gt; insight · closed-loop or it's theatre
        </p>
      </footer>
    </div>
  );
}

function Whisk() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2v9" stroke="var(--color-mint-bright)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 4c0 4 0 6 4 7 4-1 4-3 4-7" stroke="var(--color-mint-bright)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 3v7M14 3v7" stroke="var(--color-mint-bright)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <path d="M9.5 13.5c0 3-1 6-1 6h7s-1-3-1-6" stroke="var(--color-mint)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
