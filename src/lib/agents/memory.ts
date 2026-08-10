import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { history, lastWeekScore, type Move } from "@/lib/ryo";

// File-based memory store. Persists each week's recommendations so the loop is
// real: last week's predictions vs. outcomes feed into this week's reasoning.
const MEM_PATH = path.join(process.cwd(), ".ryo", "memory.json");

interface MemoryFile {
  weeks: { weekOf: string; generatedAt: string; moves: Pick<Move, "type" | "itemId" | "title">[] }[];
}

async function read(): Promise<MemoryFile> {
  try {
    return JSON.parse(await fs.readFile(MEM_PATH, "utf8")) as MemoryFile;
  } catch {
    return { weeks: [] };
  }
}

/** What the Memory agent hands to Insight + Action: last week's scored outcomes. */
export function memoryContext(): string {
  const rows = history
    .map((h) => `- [${h.decision}] ${h.title}: predicted ${h.predicted}, actual ${h.actual} (${h.hit ? "HIT" : "MISS"}). Adjustment: ${h.deltaNote}`)
    .join("\n");
  return `Last week's forecast accuracy was ${Math.round(lastWeekScore.accuracy * 100)}%. Scored recommendations:\n${rows}\n\nUse these to calibrate: repeat what hit, adjust what missed, and reference the memory when it changes a call.`;
}

/** Persist this week's moves so a future run inherits them. */
export async function remember(weekOf: string, moves: Move[]): Promise<void> {
  try {
    const mem = await read();
    mem.weeks = [
      { weekOf, generatedAt: new Date().toISOString(), moves: moves.map((m) => ({ type: m.type, itemId: m.itemId, title: m.title })) },
      ...mem.weeks,
    ].slice(0, 12);
    await fs.mkdir(path.dirname(MEM_PATH), { recursive: true });
    await fs.writeFile(MEM_PATH, JSON.stringify(mem, null, 2));
  } catch {
    /* memory write is best-effort — never break the briefing over it */
  }
}
