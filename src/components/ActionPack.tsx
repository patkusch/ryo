"use client";

import { useState } from "react";
import {
  moves as mockMoves, staffCards as mockStaff, social as mockSocial, itemById,
  type Decision, type BriefData, type Move, type StaffCard,
} from "@/lib/ryo";
import { Label, BigStat, gbp } from "./ui";

export function ActionPack({ brief, decisions }: { brief: BriefData | null; decisions: Record<string, Decision> }) {
  const moves = brief?.moves ?? mockMoves;
  const staff = brief?.staffCards ?? mockStaff;
  const social = brief?.social ?? mockSocial;
  const orderMoves = moves.filter((m) => m.order && m.order.suggested > 0);

  const actioned = moves.filter((m) => decisions[m.id] === "actioned");
  const consider = actioned.length ? actioned : moves;
  const revenue = consider.reduce((s, m) => s + (m.predicted.revenue ?? 0), 0);
  const waste = consider.reduce((s, m) => s + (m.predicted.wasteSaved ?? 0), 0);
  const orderTotal = orderMoves.reduce((s, m) => s + (m.order?.estCost ?? 0), 0);

  return (
    <div>
      <header className="rise pb-6">
        <Label>Action pack · week of 10 Aug</Label>
        <h1 className="serif mt-3 text-4xl tracking-tight sm:text-5xl">Everything, prepped.</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[color:var(--color-ink-dim)]">
          One click turned this Monday's moves into a supplier order, staff cards, and the week's social. Print it, copy it, send it — then let the loop measure it.
        </p>
      </header>

      <div className="mb-5 rounded-xl border bg-[color:var(--color-surface)] rise rise-1">
        <div className="border-b px-6 py-4"><Label>Impact simulation · if you run {actioned.length ? "the actioned moves" : "all of them"}</Label></div>
        <div className="grid grid-cols-2 gap-6 px-6 py-6 sm:grid-cols-4">
          <BigStat label="Added revenue" value={`+${gbp(revenue)}`} accent="mint" sub="this week" />
          <BigStat label="Waste avoided" value={`−${gbp(waste)}`} accent="mint" sub="binned stock" />
          <BigStat label="Net impact" value={`+${gbp(revenue + waste)}`} sub="revenue + waste" />
          <BigStat label="Order outlay" value={gbp(orderTotal)} accent="blue" sub="supplier spend" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SupplierOrder orderMoves={orderMoves} total={orderTotal} />
        <div className="space-y-5">
          <StaffCards staff={staff} />
          <Social social={social} />
        </div>
      </div>
    </div>
  );
}

function SupplierOrder({ orderMoves, total }: { orderMoves: Move[]; total: number }) {
  const [copied, setCopied] = useState(false);
  const rows = orderMoves.map((m) => {
    const it = itemById(m.itemId);
    return { name: it.name, unit: it.unit, stock: it.currentStock, order: m.order!.suggested, cost: m.order!.estCost };
  });

  const asText = () =>
    "Fern & Whisk — supplier order, week of 10 Aug\n" +
    rows.map((r) => `• ${r.name}: order ${r.order} ${r.unit} (on hand ${r.stock}) — ${gbp(r.cost)}`).join("\n") +
    `\nTotal: ${gbp(total)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked — no-op */ }
  };

  const downloadCsv = () => {
    const csv = "Item,Unit,On hand,Suggested order,Est cost\n" +
      rows.map((r) => `${r.name},${r.unit},${r.stock},${r.order},${r.cost}`).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "fern-and-whisk-order.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border bg-[color:var(--color-surface)] rise rise-2">
      <div className="flex items-center justify-between border-b px-6 py-5">
        <div>
          <Label>Artifact 01</Label>
          <h3 className="serif mt-1.5 text-xl">Supplier order list</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={copy} className="rounded-lg border px-3 py-1.5 text-sm font-medium text-[color:var(--color-ink-dim)] hover:border-[color:var(--color-muted)]">
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <button onClick={downloadCsv} className="rounded-lg border px-3 py-1.5 text-sm font-medium text-[color:var(--color-ink-dim)] hover:border-[color:var(--color-muted)]">
            CSV
          </button>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="px-6 py-6 text-sm text-[color:var(--color-muted)]">No stock-up orders this week — nothing to reorder.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="label px-6 py-3 text-left font-normal">Item</th>
              <th className="label px-3 py-3 text-right font-normal">On hand</th>
              <th className="label px-3 py-3 text-right font-normal">Order</th>
              <th className="label px-6 py-3 text-right font-normal">Est cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b last:border-0">
                <td className="px-6 py-3.5 font-medium">{r.name}</td>
                <td className="tnum px-3 py-3.5 text-right text-[color:var(--color-muted)]">{r.stock}</td>
                <td className="tnum px-3 py-3.5 text-right font-semibold">{r.order} <span className="text-[color:var(--color-muted)]">{r.unit}</span></td>
                <td className="tnum px-6 py-3.5 text-right">{gbp(r.cost)}</td>
              </tr>
            ))}
            <tr>
              <td className="px-6 py-3.5 label" colSpan={3}>Total</td>
              <td className="tnum px-6 py-3.5 text-right serif text-lg" style={{ color: "var(--color-mint)" }}>{gbp(total)}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

function StaffCards({ staff }: { staff: StaffCard[] }) {
  return (
    <div className="rounded-xl border bg-[color:var(--color-surface)] rise rise-3">
      <div className="border-b px-6 py-5">
        <Label>Artifact 02</Label>
        <h3 className="serif mt-1.5 text-xl">Staff briefing cards</h3>
      </div>
      <div className="grid grid-cols-1 gap-px overflow-hidden sm:grid-cols-2">
        {staff.map((c) => (
          <div key={c.title} className="border-b border-r bg-[color:var(--color-surface)] px-5 py-4">
            <div className="serif text-[15px]">{c.title}</div>
            <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--color-ink-dim)]">{c.instruction}</p>
            <div className="label mt-2.5" style={{ color: "var(--color-mint)" }}>{c.metric}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Social({ social }: { social: { caption: string; stories: string; visualDirection: string } }) {
  return (
    <div className="rounded-xl border bg-[color:var(--color-surface)] rise rise-4">
      <div className="border-b px-6 py-5">
        <Label>Artifact 03</Label>
        <h3 className="serif mt-1.5 text-xl">Social assets</h3>
      </div>
      <div className="space-y-4 px-6 py-5">
        <div>
          <Label>Instagram caption</Label>
          <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--color-ink-dim)]">{social.caption}</p>
        </div>
        <div>
          <Label>Stories</Label>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[color:var(--color-ink-dim)]">{social.stories}</p>
        </div>
        <div>
          <Label>Visual direction</Label>
          <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--color-muted)]">{social.visualDirection}</p>
        </div>
      </div>
    </div>
  );
}
