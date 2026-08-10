import "server-only";
import {
  cafe, items, itemById, suggestedOrder, weather, forecast,
  moves as mockMoves, opinion as mockOpinion, staffCards as mockStaff, social as mockSocial,
  type Move, type MoveType,
} from "@/lib/ryo";
import { structured } from "./client";
import { memoryContext, remember } from "./memory";

export interface TraceStep { agent: string; engine: "rules" | "claude"; ms: number; note: string }
export interface Brief {
  source: "claude" | "fallback";
  opinion: string;
  moves: Move[];
  staffCards: { title: string; instruction: string; metric: string }[];
  social: { caption: string; stories: string; visualDirection: string };
  trace: TraceStep[];
  generatedAt: string;
}

// ---- Data agent (deterministic): assemble the context bundle ----------------
function assembleContext(): string {
  const menu = items
    .map((i) => `${i.id} | ${i.name} | ${i.category} | £${i.price} sell / £${i.cost} cost (${Math.round((1 - i.cost / i.price) * 100)}% margin) | stock ${i.currentStock} ${i.unit} | ${i.weeklyVelocity}/wk, trend ${i.trendPct > 0 ? "+" : ""}${i.trendPct}%${i.leadTimeDays >= 7 ? " | 7-day lead" : ""}${i.shelfPosition ? ` | shelf ${i.shelfPosition}` : ""}`)
    .join("\n");
  return `CAFÉ: ${cafe.name}, ${cafe.location}. Week of ${cafe.weekOf}.
WEATHER (7-day): ${weather.summary} Iced drinks lift ~${weather.icedLiftPct}%, hot drinks ${weather.hotDragPct}%.
FORECAST: ${forecast.totalUnits} units, ${Math.round(forecast.icedShare * 100)}% iced, busiest ${forecast.busiest.name}.

MENU (id | name | category | economics | stock | velocity/trend | flags):
${menu}`;
}

const INSIGHT_SCHEMA = {
  type: "object", additionalProperties: false, required: ["summary", "findings"],
  properties: {
    summary: { type: "string" },
    findings: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["kind", "itemId", "insight"],
        properties: {
          kind: { type: "string", enum: ["demand", "attach", "waste", "margin", "experiment"] },
          itemId: { type: "string" },
          insight: { type: "string" },
        },
      },
    },
  },
} as const;

const ACTION_SCHEMA = {
  type: "object", additionalProperties: false, required: ["opinion", "moves", "staffCards", "social"],
  properties: {
    opinion: { type: "string" },
    moves: {
      type: "array",
      items: {
        type: "object", additionalProperties: false,
        required: ["type", "itemId", "title", "impactLine", "rationale", "method", "evidence", "confidence", "predicted"],
        properties: {
          type: { type: "string", enum: ["stock_up", "promote", "cut", "experiment"] },
          itemId: { type: "string" },
          title: { type: "string" },
          impactLine: { type: "string" },
          rationale: { type: "string" },
          method: { type: "string" },
          evidence: {
            type: "array",
            items: { type: "object", additionalProperties: false, required: ["label", "value"], properties: { label: { type: "string" }, value: { type: "string" } } },
          },
          confidence: { type: "number" },
          predicted: {
            type: "object", additionalProperties: false, required: ["revenue", "wasteSaved", "marginPts"],
            properties: { revenue: { type: "number" }, wasteSaved: { type: "number" }, marginPts: { type: "number" } },
          },
        },
      },
    },
    staffCards: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["title", "instruction", "metric"], properties: { title: { type: "string" }, instruction: { type: "string" }, metric: { type: "string" } } },
    },
    social: {
      type: "object", additionalProperties: false, required: ["caption", "stories", "visualDirection"],
      properties: { caption: { type: "string" }, stories: { type: "string" }, visualDirection: { type: "string" } },
    },
  },
} as const;

const PERSONA = `You are Ryo, an agentic AI operator for a specialty matcha café. Voice: calm, precise, slightly dry — a competent Japanese sous-chef who hates waste. You are opinionated, never hypey, and you always tie a claim to a number. Money is in GBP (£).`;

type InsightOut = { summary: string; findings: { kind: string; itemId: string; insight: string }[] };
type ActionOut = {
  opinion: string;
  moves: Omit<Move, "id" | "order">[];
  staffCards: Brief["staffCards"];
  social: Brief["social"];
};

// Attach the deterministic order-quantity engine — the maths stays real, not modelled.
function withOrders(raw: Omit<Move, "id" | "order">[]): Move[] {
  return raw
    .filter((m) => items.some((i) => i.id === m.itemId))
    .slice(0, 5)
    .map((m, i) => {
      const it = itemById(m.itemId);
      const move: Move = { ...m, id: `m${i + 1}`, evidence: (m.evidence ?? []).slice(0, 4) };
      if (m.type === "stock_up") {
        const lift = it.category !== "Retail" ? weather.icedLiftPct : 0;
        const o = suggestedOrder(it, lift);
        move.order = { suggested: o.suggested, estCost: o.estCost };
      }
      return move;
    });
}

export async function runBriefing(): Promise<Brief> {
  const trace: TraceStep[] = [];
  const step = async <T>(agent: string, engine: "rules" | "claude", note: string, fn: () => Promise<T> | T): Promise<T> => {
    const t = Date.now();
    const out = await fn();
    trace.push({ agent, engine, ms: Date.now() - t, note });
    return out;
  };

  try {
    const context = await step("Data", "rules", "Assembled tills, weather & economics", () => assembleContext());
    const memory = memoryContext();

    const insight = await step("Insight", "claude", "Ran velocity, attach, waste & margin analysis", () =>
      structured<InsightOut>({
        system: PERSONA,
        user: `Analyse this café for the coming week. Return the sharpest signals only — demand shifts, attach opportunities, waste risks, margin/elasticity. Ground every finding in the numbers.\n\n${context}\n\nMEMORY (last week):\n${memory}`,
        schema: INSIGHT_SCHEMA as unknown as Record<string, unknown>,
        maxTokens: 3000,
      }),
    );

    const action = await step("Action", "claude", "Generated ranked moves + order/staff/social artifacts", () =>
      structured<ActionOut>({
        system: PERSONA,
        user: `Given the analysis, produce this Monday's briefing. Return 3–5 ranked MOVES (most valuable first). Move types: stock_up (rising demand), promote (attach/upsell), cut (waste risk), experiment (bounded new-item test). Each move: a clear title, a one-line impact summary with a £ or % figure, a 2–3 sentence rationale in Ryo's voice, a one-sentence method, up to 4 evidence chips (short label + value), a confidence 0–1, and predicted {revenue, wasteSaved, marginPts} in £/pts (use 0 where not applicable). itemId MUST be one of the menu ids. Also write: an opening one-paragraph opinion; 3–4 staff briefing cards (title, specific instruction, one metric line); and social {caption, stories, visualDirection}.\n\nANALYSIS:\n${insight.summary}\n${insight.findings.map((f) => `- ${f.kind} · ${f.itemId}: ${f.insight}`).join("\n")}\n\n${context}\n\nMEMORY:\n${memory}`,
        schema: ACTION_SCHEMA as unknown as Record<string, unknown>,
        maxTokens: 8000,
      }),
    );

    const moves = await step("Persona", "claude", "Ranked & voiced by Ryo; orders costed by the engine", () => withOrders(action.moves));
    if (!moves.length) throw new Error("no valid moves");

    await step("Memory", "rules", "Wrote this week's moves back to the store", () => remember(cafe.weekOf, moves));

    return {
      source: "claude",
      opinion: action.opinion,
      moves,
      staffCards: action.staffCards?.length ? action.staffCards : mockStaff,
      social: action.social ?? mockSocial,
      trace,
      generatedAt: cafe.weekOf,
    };
  } catch (e) {
    // Crash-proof fallback: the deterministic mock, same shape. Demo never dies.
    console.error("[ryo] briefing failed:", e);
    trace.push({ agent: "Fallback", engine: "rules", ms: 0, note: "Live agents unavailable — served the deterministic briefing" });
    return {
      source: "fallback",
      opinion: mockOpinion,
      moves: mockMoves,
      staffCards: mockStaff,
      social: mockSocial,
      trace,
      generatedAt: cafe.weekOf,
    };
  }
}

export type { Move, MoveType };
