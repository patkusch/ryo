"use client";

import { useState, useRef } from "react";
import { critique } from "@/lib/ryo";
import { Label } from "./ui";

const verdictMeta = {
  move: { label: "Move it", color: "var(--color-clay)" },
  swap: { label: "Swap in", color: "var(--color-mint)" },
  keep: { label: "Keep", color: "var(--color-blue)" },
} as const;

export function Critique() {
  const [img, setImg] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File) => {
    const url = URL.createObjectURL(f);
    setImg(url);
    setDone(false);
    setAnalysing(true);
    // simulate vision pass
    setTimeout(() => { setAnalysing(false); setDone(true); }, 1400);
  };

  return (
    <div>
      <header className="rise pb-6">
        <Label>Visual merchandising · vision critique</Label>
        <h1 className="serif mt-3 text-4xl tracking-tight sm:text-5xl">
          Show me the <em style={{ fontStyle: "italic", color: "var(--color-mint)" }}>case.</em>
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[color:var(--color-ink-dim)]">
          Photograph the pastry case or counter. I’ll read the layout against this week’s demand and tell you what’s in the wrong place — with the velocity to prove it.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* upload / preview */}
        <div className="rise rise-1">
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}
            className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed bg-[color:var(--color-surface)] text-center transition-colors hover:border-[color:var(--color-muted)]"
          >
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt="Pastry case" className="h-full w-full object-cover" />
            ) : (
              <div className="px-6 py-10">
                <div className="serif text-2xl text-[color:var(--color-muted)]">＋</div>
                <div className="mt-2 text-sm text-[color:var(--color-ink-dim)]">Drop a photo of the case, or click to upload</div>
                <div className="label mt-2">JPG / PNG · analysed on-device for the demo</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          {!img && (
            <button
              onClick={() => { setImg("sample"); setDone(false); setAnalysing(true); setTimeout(() => { setAnalysing(false); setDone(true); }, 1400); }}
              className="label mt-3 rounded-full border px-4 py-2 text-[color:var(--color-ink-dim)] hover:border-[color:var(--color-muted)]"
            >
              Use the sample case →
            </button>
          )}
        </div>

        {/* analysis */}
        <div className="rise rise-2">
          {!img && (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-xl border bg-[color:var(--color-surface)] p-8 text-center text-sm text-[color:var(--color-muted)]">
              The critique appears here once you add a photo.
            </div>
          )}
          {analysing && (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border bg-[color:var(--color-surface)]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[color:var(--color-line)] border-t-[color:var(--color-mint)]" />
              <div className="label">Reading layout against demand…</div>
            </div>
          )}
          {done && (
            <div className="rounded-xl border bg-[color:var(--color-surface)]">
              <div className="flex items-center justify-between border-b px-6 py-5">
                <div>
                  <Label>Merchandising verdict</Label>
                  <h3 className="serif mt-1.5 text-xl leading-snug">{critique.headline}</h3>
                </div>
                <div className="text-right">
                  <Label>Score</Label>
                  <div className="serif tnum text-3xl" style={{ color: "var(--color-amber)" }}>{critique.score}</div>
                </div>
              </div>
              <div className="divide-y">
                {critique.notes.map((n) => {
                  const v = verdictMeta[n.verdict];
                  return (
                    <div key={n.zone} className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="label" style={{ color: v.color }}>{v.label}</span>
                        <span className="label">{n.zone}</span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--color-ink-dim)]">{n.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
