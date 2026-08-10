// ------------------------------------------------------------------
//  Ryo — domain types, café data, and the reasoning engine.
//  All figures are mock but internally consistent so the demo holds up.
// ------------------------------------------------------------------

export type MoveType = "stock_up" | "promote" | "cut" | "experiment";
export type Decision = "pending" | "actioned" | "modified" | "ignored";

export interface Item {
  id: string;
  name: string;
  category: "Matcha Drinks" | "Seasonal" | "Pastry" | "Retail";
  price: number; // sell price, £
  cost: number; // COGS, £
  currentStock: number; // units on hand (or servings)
  unit: string;
  leadTimeDays: number;
  weeklyVelocity: number; // avg units/week over trailing 13w
  trendPct: number; // week-over-week velocity change
  shelfPosition?: "eye-level" | "mid" | "low";
}

export interface Evidence {
  label: string;
  value: string;
}

export interface Move {
  id: string;
  type: MoveType;
  itemId: string;
  title: string;
  impactLine: string; // one-line impact summary
  rationale: string; // Siki-style "why"
  method: string; // methodology sentence
  evidence: Evidence[];
  confidence: number; // 0..1
  predicted: { revenue?: number; wasteSaved?: number; marginPts?: number };
  order?: { suggested: number; estCost: number };
}

export interface HistoryRow {
  id: string;
  type: MoveType;
  title: string;
  predicted: string;
  actual: string;
  decision: Decision;
  hit: boolean; // did prediction land within tolerance
  deltaNote: string;
}

// ------------------------------------------------------------------
//  The café
// ------------------------------------------------------------------

export const cafe = {
  name: "Fern & Whisk",
  location: "Deptford, London",
  timezone: "Europe/London",
  weekOf: "Mon 10 Aug 2026",
};

export const weather = {
  summary: "Heatwave — 5 days above 29°C, then a break Sunday.",
  icedLiftPct: 22, // expected lift on iced drinks
  hotDragPct: -14,
};

// Daypart forecast — the "prep sheet" table on the briefing.
export interface DaypartRow {
  daypart: string;
  window: string;
  drinks: number;
  seasonal: number;
  pastry: number;
  retail: number;
  icedShare: number; // 0..1
}

export const forecast = {
  totalUnits: 1240,
  icedShare: 0.71,
  busiest: { name: "Lunch", units: 486, window: "12:00–14:30" },
  backtestWeeks: 8,
  generated: "Mon 10 Aug",
  dayparts: [
    { daypart: "Morning", window: "08:00–11:30", drinks: 214, seasonal: 96, pastry: 158, retail: 6, icedShare: 0.58 },
    { daypart: "Lunch", window: "12:00–14:30", drinks: 286, seasonal: 132, pastry: 62, retail: 6, icedShare: 0.79 },
    { daypart: "Afternoon", window: "14:30–17:00", drinks: 198, seasonal: 88, pastry: 74, retail: 8, icedShare: 0.74 },
    { daypart: "Evening", window: "17:00–19:00", drinks: 96, seasonal: 41, pastry: 28, retail: 3, icedShare: 0.66 },
  ] as DaypartRow[],
};

export const items: Item[] = [
  { id: "iml", name: "Iced Matcha Latte", category: "Matcha Drinks", price: 5.4, cost: 1.35, currentStock: 0, unit: "servings", leadTimeDays: 2, weeklyVelocity: 612, trendPct: 9, shelfPosition: "eye-level" },
  { id: "hml", name: "Hot Matcha Latte", category: "Matcha Drinks", price: 5.2, cost: 1.3, currentStock: 0, unit: "servings", leadTimeDays: 2, weeklyVelocity: 274, trendPct: -11 },
  { id: "sml", name: "Strawberry Matcha Latte", category: "Seasonal", price: 6.1, cost: 1.9, currentStock: 0, unit: "servings", leadTimeDays: 2, weeklyVelocity: 188, trendPct: 41 },
  { id: "dm", name: "Dirty Matcha (Espresso)", category: "Matcha Drinks", price: 5.8, cost: 1.55, currentStock: 0, unit: "servings", leadTimeDays: 2, weeklyVelocity: 143, trendPct: 6 },
  { id: "hoji", name: "Hojicha Oat Latte", category: "Matcha Drinks", price: 5.2, cost: 1.4, currentStock: 0, unit: "servings", leadTimeDays: 2, weeklyVelocity: 96, trendPct: 3 },
  { id: "yms", name: "Yuzu Matcha Soda", category: "Seasonal", price: 5.5, cost: 1.25, currentStock: 0, unit: "servings", leadTimeDays: 3, weeklyVelocity: 61, trendPct: 18 },

  { id: "bsc", name: "Black Sesame Cookie", category: "Pastry", price: 3.8, cost: 0.72, currentStock: 40, unit: "units", leadTimeDays: 1, weeklyVelocity: 132, trendPct: 4, shelfPosition: "low" },
  { id: "mc", name: "Matcha Cookie", category: "Pastry", price: 3.6, cost: 0.68, currentStock: 55, unit: "units", leadTimeDays: 1, weeklyVelocity: 301, trendPct: 12, shelfPosition: "mid" },
  { id: "mbl", name: "Miso Banana Loaf", category: "Pastry", price: 4.5, cost: 1.42, currentStock: 61, unit: "units", leadTimeDays: 1, weeklyVelocity: 96, trendPct: -8, shelfPosition: "eye-level" },
  { id: "mochi", name: "Mochi Muffin", category: "Pastry", price: 4.2, cost: 1.05, currentStock: 44, unit: "units", leadTimeDays: 1, weeklyVelocity: 174, trendPct: 7, shelfPosition: "mid" },

  { id: "tin", name: "Ceremonial Matcha Tin 100g", category: "Retail", price: 32, cost: 14.5, currentStock: 6, unit: "tins", leadTimeDays: 7, weeklyVelocity: 11, trendPct: 15 },
  { id: "chasen", name: "Bamboo Whisk (Chasen)", category: "Retail", price: 24, cost: 9.2, currentStock: 9, unit: "units", leadTimeDays: 7, weeklyVelocity: 4, trendPct: 2 },
];

export const itemById = (id: string) => items.find((i) => i.id === id)!;

// ------------------------------------------------------------------
//  Analytics series for the Dashboard charts (all mock, consistent)
// ------------------------------------------------------------------

export const weekdayRevenue = {
  average: 823,
  days: [
    { day: "Mon", value: 612 },
    { day: "Tue", value: 1021 },
    { day: "Wed", value: 838 },
    { day: "Thu", value: 1061 },
    { day: "Fri", value: 668 },
    { day: "Sat", value: 742 },
  ],
};

// Iced share vs daily max temperature — an S-curve.
export const weatherCurve = [
  { temp: 2, iced: 4 },
  { temp: 6, iced: 4 },
  { temp: 11, iced: 5 },
  { temp: 15, iced: 11 },
  { temp: 19, iced: 30 },
  { temp: 23, iced: 48 },
  { temp: 27, iced: 51 },
  { temp: 32, iced: 53 },
];

// 12 weeks of daily revenue, generated deterministically (stable saw-tooth).
export const dailyRevenueMean = 874;
export const dailyRevenue: { label: string; value: number }[] = (() => {
  const shape = [0.72, 1.18, 0.96, 1.22, 0.78, 0.86, 0.7]; // Mon..Sun
  const out: { label: string; value: number }[] = [];
  const start = new Date(2026, 4, 9); // 9 May
  for (let i = 0; i < 84; i++) {
    const wob = 1 + 0.12 * Math.sin(i * 1.3) + 0.06 * Math.sin(i * 0.5);
    const v = Math.round(dailyRevenueMean * shape[i % 7] * wob);
    const d = new Date(start.getTime() + i * 86400000);
    out.push({ label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: v });
  }
  return out;
})();

// Unit economics — margin by item, with matcha input-cost scenarios.
export interface UnitEcon {
  name: string;
  category: string;
  price: number;
  cogs: number;
  usesMatcha: boolean;
}
export const unitEconomics: UnitEcon[] = [
  { name: "Iced Matcha Latte", category: "Matcha Drinks", price: 5.4, cogs: 1.35, usesMatcha: true },
  { name: "Strawberry Matcha", category: "Seasonal", price: 6.1, cogs: 1.9, usesMatcha: true },
  { name: "Dirty Matcha", category: "Matcha Drinks", price: 5.8, cogs: 1.55, usesMatcha: true },
  { name: "Hojicha Oat Latte", category: "Matcha Drinks", price: 5.2, cogs: 1.4, usesMatcha: false },
  { name: "Black Sesame Cookie", category: "Pastry", price: 3.8, cogs: 0.72, usesMatcha: false },
  { name: "Matcha Cookie", category: "Pastry", price: 3.6, cogs: 0.68, usesMatcha: true },
];
// matcha portion of COGS ≈ 55% for matcha items; scenario scales that portion.
export function marginAt(u: UnitEcon, matchaUpliftPct: number) {
  const matchaCost = u.usesMatcha ? u.cogs * 0.55 : 0;
  const cogs = u.cogs - matchaCost + matchaCost * (1 + matchaUpliftPct / 100);
  return { cogs, margin: (u.price - cogs) / u.price };
}

// Forward risk scenario card.
export const forwardRisk = {
  tag: "Oriel Relocation",
  horizon: "Summer 2027",
  title: "Moorfields moves to St Pancras",
  weekdayStep: -12,
  weeklyContribution: -435,
  from: 3626,
  to: 3191,
  annualised: -22628,
  retained: 88,
  note: "Modelled footfall loss on weekdays if the eye hospital relocates. 88% of today's contribution is retained — the office lunch trade is the exposure, not the tourists.",
};

// Prep plan — the afternoon changeover cards.
export type PrepAction = "stop" | "half" | "full";
export interface PrepPlan {
  category: string;
  action: PrepAction;
  note: string;
}
export const prepPlan = {
  changeover: "14:00",
  surplusWindow: "15:00–16:00",
  plans: [
    { category: "Hot Matcha", action: "half", note: "82 expected after 14:00, 30% of the day — half batch." },
    { category: "Pastry", action: "half", note: "74 expected after 14:00, 34% of the day — half batch." },
    { category: "Seasonal", action: "full", note: "129 expected after 14:00 in the heat — keep full prep." },
    { category: "Retail", action: "stop", note: "Impulse only after 14:00 — don't restock, sell the shelf down." },
  ] as PrepPlan[],
  note: "Size the afternoon prep to the forecast above, not the lunch peak — the standing 15:00 surplus window is what over-production looks like from the outside.",
};

// ------------------------------------------------------------------
//  Order Quantity Engine
//  Suggested = (AvgWeekly × Safety) − CurrentStock + LeadTimeBuffer
// ------------------------------------------------------------------

export const SAFETY = 1.15;

export function suggestedOrder(item: Item, demandLiftPct = 0) {
  const lifted = item.weeklyVelocity * (1 + demandLiftPct / 100);
  const leadBuffer = (lifted / 7) * item.leadTimeDays;
  const raw = lifted * SAFETY - item.currentStock + leadBuffer;
  const suggested = Math.max(0, Math.ceil(raw / 5) * 5); // round to 5
  return { suggested, estCost: +(suggested * item.cost).toFixed(2), leadBuffer: Math.ceil(leadBuffer) };
}

// ------------------------------------------------------------------
//  The Moves — this Monday's ranked briefing
// ------------------------------------------------------------------

export const opinion =
  "Ride the heat. Strawberry and iced are climbing — stock them hard. Cut the Miso Loaf back before it becomes bin liner. One clean upsell could add £430 with zero new footfall.";

export const moves: Move[] = [
  {
    id: "m1",
    type: "stock_up",
    itemId: "sml",
    title: "Stock up hard on Strawberry Matcha",
    impactLine: "+£520 revenue this week · demand up 41% w/w",
    rationale:
      "This is your fastest riser and the forecast is on its side. Strawberry Matcha is up 41% week-on-week and the heatwave lifts iced drinks another ~22%. You ran dry Saturday 2pm last week — that is refusal-to-sell, not lack of demand. Order for the surge, not last week.",
    method: "Velocity (13w) × safety 1.15 × weather lift, minus stock, plus 2-day lead buffer.",
    evidence: [
      { label: "Trend w/w", value: "+41%" },
      { label: "Weather lift", value: "+22% iced" },
      { label: "Stockout", value: "Sat 14:00" },
      { label: "Margin", value: "69%" },
    ],
    confidence: 0.86,
    predicted: { revenue: 520, marginPts: 2 },
    order: { suggested: 0, estCost: 0 }, // filled by engine below
  },
  {
    id: "m2",
    type: "promote",
    itemId: "bsc",
    title: "Attach Black Sesame Cookie to Iced Matcha",
    impactLine: "+£430 revenue · attach rate only 7% (peers hit 19%)",
    rationale:
      "612 Iced Matcha Lattes go out weekly and only 7% leave with a cookie. Black Sesame pairs on flavour and it's your highest-margin pastry (81%). Lift attach to 15% and that's ~£430 a week from footfall you already have. This is the cheapest money on the board.",
    method: "Iced Matcha volume × (target 15% − current 7% attach) × cookie contribution margin.",
    evidence: [
      { label: "Anchor volume", value: "612/wk" },
      { label: "Attach now", value: "7%" },
      { label: "Cookie margin", value: "81%" },
      { label: "Target", value: "15%" },
    ],
    confidence: 0.78,
    predicted: { revenue: 430, marginPts: 1 },
  },
  {
    id: "m3",
    type: "cut",
    itemId: "mbl",
    title: "Cut Miso Banana Loaf bake by a third",
    impactLine: "−£190 waste · selling 96/wk, baking 140",
    rationale:
      "You bake ~140 loaves and sell 96 — the rest goes home as staff-eats or bin. Velocity is down 8% and it sits in prime eye-level space it hasn't earned. Drop the bake to 100 and reclaim both the money and the shelf. See the merchandising note — this loaf is the case's biggest offender.",
    method: "Trailing waste rate × unit cost, cross-checked against 13w velocity decline.",
    evidence: [
      { label: "Baked", value: "~140/wk" },
      { label: "Sold", value: "96/wk" },
      { label: "Trend", value: "−8%" },
      { label: "Waste cost", value: "£190/wk" },
    ],
    confidence: 0.82,
    predicted: { wasteSaved: 190, marginPts: 1 },
  },
  {
    id: "m4",
    type: "stock_up",
    itemId: "tin",
    title: "Reorder Ceremonial Matcha Tins now",
    impactLine: "Avoid stockout · 7-day lead, 6 left, selling 11/wk",
    rationale:
      "Six tins left, you sell eleven a week, and the supplier takes seven days. Order today or you're empty by Thursday — and this is your highest-ticket item (£32, 55% margin). Retail stockouts are silent; the customer just doesn't buy. Don't let the best line go dark.",
    method: "Coverage = stock ÷ velocity vs lead time. Reorder point breached.",
    evidence: [
      { label: "On hand", value: "6 tins" },
      { label: "Velocity", value: "11/wk" },
      { label: "Lead time", value: "7 days" },
      { label: "Ticket", value: "£32" },
    ],
    confidence: 0.91,
    predicted: { revenue: 260 },
    order: { suggested: 0, estCost: 0 },
  },
  {
    id: "m5",
    type: "experiment",
    itemId: "yms",
    title: "Trial Yuzu Matcha Soda as the heatwave special",
    impactLine: "Hypothesis: +£180 · low cost, 77% margin",
    rationale:
      "A cheap bet worth testing. Yuzu Matcha Soda is up 18% off a small base, costs £1.25 to make, and reads perfectly for a heatwave. Feature it as the week's special on the A-board and Stories. If it clears 100 units we make it permanent; if not we've lost nothing but a chalk line.",
    method: "Small-base momentum × high margin. Framed as a bounded 1-week test with a clear kill/keep threshold.",
    evidence: [
      { label: "Trend", value: "+18%" },
      { label: "Margin", value: "77%" },
      { label: "Keep if", value: ">100 units" },
      { label: "Downside", value: "~£0" },
    ],
    confidence: 0.58,
    predicted: { revenue: 180 },
  },
];

// Fill order quantities from the engine so the numbers are real.
for (const m of moves) {
  if (m.order) {
    const it = itemById(m.itemId);
    const lift = m.type === "stock_up" && it.category !== "Retail" ? weather.icedLiftPct : 0;
    const o = suggestedOrder(it, lift);
    m.order = { suggested: o.suggested, estCost: o.estCost };
  }
}

// ------------------------------------------------------------------
//  Last week — the closed loop. Predicted vs actual.
// ------------------------------------------------------------------

export const backtest = {
  window: "Last 8 weeks",
  matchaError: 9.4,
  allError: 19.1,
  note: "The headline number is the error, not the accuracy. Matcha drinks — the category every prep decision hangs on — forecast to ±9.4%. The overall ±19.1% is dragged up by the low-volume categories, where a miss of two or three units on a base of ten is arithmetic rather than model failure. Neither figure is hidden or rounded in our favour.",
};

export const lastWeekScore = {
  accuracy: 0.79,
  movesActioned: 4,
  movesTotal: 5,
  revenueAdded: 1180,
  wasteSaved: 240,
};

export const history: HistoryRow[] = [
  {
    id: "h1",
    type: "stock_up",
    title: "Stock up on Iced Matcha (heat spike)",
    predicted: "+£480 revenue",
    actual: "+£511 revenue",
    decision: "actioned",
    hit: true,
    deltaNote: "Slightly under-forecast. Nudging safety stock up 3%.",
  },
  {
    id: "h2",
    type: "promote",
    title: "Attach Matcha Cookie to Hot Latte",
    predicted: "attach 9% → 16%",
    actual: "attach 9% → 13%",
    decision: "modified",
    hit: false,
    deltaNote: "Owner ran it 3 days not 7. Partial lift. Staff card wording revised.",
  },
  {
    id: "h3",
    type: "cut",
    title: "Reduce Croissant bake by 25%",
    predicted: "−£150 waste",
    actual: "−£168 waste",
    decision: "actioned",
    hit: true,
    deltaNote: "Waste model was conservative. Good call.",
  },
  {
    id: "h4",
    type: "stock_up",
    title: "Reorder Oat Milk (2 cases)",
    predicted: "avoid stockout",
    actual: "no stockout",
    decision: "actioned",
    hit: true,
    deltaNote: "Held through the week with 1 case buffer.",
  },
  {
    id: "h5",
    type: "experiment",
    title: "Trial Black Sesame Latte",
    predicted: "keep if >80 units",
    actual: "63 units — killed",
    decision: "ignored",
    hit: false,
    deltaNote: "Owner skipped the Stories push. Under threshold. Retired.",
  },
];

// ------------------------------------------------------------------
//  Action Pack artifacts
// ------------------------------------------------------------------

export interface StaffCard {
  title: string;
  instruction: string;
  metric: string;
}

// Shape returned by /api/brief (the multi-agent pipeline) — also the fallback shape.
export interface TraceStep {
  agent: string;
  engine: "rules" | "claude";
  ms: number;
  note: string;
}
export interface BriefData {
  source: "claude" | "fallback";
  opinion: string;
  moves: Move[];
  staffCards: StaffCard[];
  social: { caption: string; stories: string; visualDirection: string };
  trace: TraceStep[];
  generatedAt: string;
}

export const staffCards: StaffCard[] = [
  {
    title: "The one upsell that matters",
    instruction:
      "When someone orders an Iced Matcha Latte, offer the Black Sesame Cookie — “these two are made for each other.” Don't ask ‘anything else?’ — name the cookie.",
    metric: "Attach rate is 7%. Target 15%. Worth ~£430/wk.",
  },
  {
    title: "Strawberry Matcha — don't run dry",
    instruction:
      "Prep strawberry purée in the morning AND after lunch. We sold out at 2pm Saturday last week. If the batch is below a third, flag the bar lead.",
    metric: "Demand up 41% w/w. Heatwave all week.",
  },
  {
    title: "Miso Loaf — bake less",
    instruction:
      "Bake 100, not 140. Move it off eye-level to the lower shelf; put Matcha Cookies where it was.",
    metric: "Selling 96/wk, wasting ~44. Reclaim the space.",
  },
  {
    title: "This week's special",
    instruction:
      "Push Yuzu Matcha Soda as the heatwave special. Chalk it on the A-board. One line: ‘cold, citrusy, gone by September.’",
    metric: "Trial week. Keep it if we clear 100 units.",
  },
];

export const social = {
  caption:
    "Heatwave rules at Fern & Whisk 🍓🍵 Strawberry Matcha is back and colder than your ex. New this week: Yuzu Matcha Soda — cold, citrusy, gone by September. Deptford, from 8am. #matcha #deptford #icedmatcha",
  stories:
    "SLIDE 1: ‘It's 30°C. You know what to do.’ over an Iced Matcha pour.\nSLIDE 2: Strawberry Matcha close-up → sticker ‘back for the heat’.\nSLIDE 3: Yuzu Matcha Soda → poll ‘would you?’ yes / obviously.",
  visualDirection:
    "Shoot in hard morning light, condensation on the glass, matcha against the pale oak counter. Strawberry as the hero colour. No filters — let the green read true.",
};

// ------------------------------------------------------------------
//  Visual merchandising critique (canned vision analysis)
// ------------------------------------------------------------------

export interface CritiqueNote {
  zone: string;
  verdict: "move" | "keep" | "swap";
  note: string;
}

export const critique = {
  headline: "Your best sellers are hiding. Your slow mover has the throne.",
  score: 62,
  notes: [
    {
      zone: "Eye-level, centre",
      verdict: "move",
      note: "Miso Banana Loaf holds prime eye-level but sells 96/wk and is trending down 8%. This is your case's most expensive real estate — it's not paying rent.",
    },
    {
      zone: "Eye-level (recommended)",
      verdict: "swap",
      note: "Put Matcha Cookies here. 301/wk and climbing 12% — they earn the position and pull the highest-margin attach.",
    },
    {
      zone: "Lower shelf, right",
      verdict: "move",
      note: "Black Sesame Cookie is your attach hero but it's on the bottom shelf where no one reaches. Bring it up beside the till for the Iced Matcha upsell.",
    },
    {
      zone: "Counter clutter",
      verdict: "keep",
      note: "Retail tins by the till are well placed — impulse-friendly. Keep the whisk demo, it earns the £32 tin.",
    },
  ] as CritiqueNote[],
};
