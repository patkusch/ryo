# Ryo — AI Café Operator

**Your Monday, already handled.**

Ryo is an agentic AI operator for specialty (matcha-focused) cafés. It doesn't just
report sales — it forms opinions, prepares concrete actions, and measures whether
those actions worked. Every Monday the owner opens Ryo and leaves with exact order
quantities, staff instructions, promo assets, an expected-impact estimate, and the
memory of what worked last week.

Persona: calm, precise, slightly dry — a competent Japanese sous-chef who hates waste.

## The five screens

| Screen | What it does |
| --- | --- |
| **Agent** | The Monday briefing — Ryo's opinion + 3–5 ranked *Moves* (Stock Up / Promote / Cut / Experiment), each with a one-line impact, expandable reasoning, evidence, and a confidence score. Mark each **Action / Modify / Ignore** (the closed loop). |
| **Dashboard** | The analytics: honest backtest band, next-day prep sheet + daypart forecast, prep-plan changeover cards, weekday-revenue bars, weather-sensitivity S-curve, 12-week trading history, unit-economics scenarios, and a forward-risk model. |
| **Action Pack** | One click turns the week's moves into a supplier order list (copy / CSV), printable staff cards, social assets, and an impact simulation. |
| **Scorecard** | Closed loop — what Ryo predicted vs. what the tills actually did, with per-move accuracy and how the model adjusted. |
| **Critique** | Upload a photo of the pastry case; Ryo reads the layout against current demand and says what's in the wrong place. |

## Design

Editorial dark: warm charcoal, a high-contrast serif display (Fraunces) with an italic
mint accent, monospace micro-labels, sage-green + periwinkle data accents. Calm,
precise, high information density.

## Principles

- **Action > insight.** Every screen ends in something you can do.
- **Closed-loop or it's theatre.** Recommendations are scored against reality.
- **Transparent reasoning.** Every move shows its method and evidence.
- **Opinionated, not neutral.** Ryo ranks and commits.
- **Honest about error.** The backtest shows the error, not a flattering accuracy.

## Stack

Next.js 16 · React 19 · Tailwind v4 · inline-SVG charts (no chart dependency).
All figures are internally-consistent **mock data** so the demo never depends on a
live API or venue wifi.

## Run it

```bash
npm install
npm run dev   # http://localhost:3000
```

---

*Demo build. Data is synthetic. Café "Fern & Whisk" is fictional.*
