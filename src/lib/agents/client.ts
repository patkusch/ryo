import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Ryo runs on Claude. Opus 5 at low effort keeps the live demo snappy while
// staying strong on these scoped, structured-reasoning tasks.
export const MODEL = "claude-opus-5";

let _client: Anthropic | null = null;
export function anthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null; // no key → caller falls back to the mock
  if (!_client) _client = new Anthropic();
  return _client;
}

/**
 * One structured-output call. Forces Claude to return JSON matching `schema`
 * (output_config.format). Returns the parsed object, or throws — the caller
 * decides whether to fall back to the deterministic mock.
 */
export async function structured<T>(opts: {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
}): Promise<T> {
  const client = anthropic();
  if (!client) throw new Error("no-api-key");

  // output_config (effort + structured-output format) may lag the SDK typings —
  // cast through unknown so the extra keys still reach the wire.
  const body = {
    model: MODEL,
    max_tokens: opts.maxTokens ?? 8000,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
    output_config: { effort: "low", format: { type: "json_schema", schema: opts.schema } },
  };
  const res = await client.messages.create(body as unknown as Anthropic.MessageCreateParamsNonStreaming);

  if (res.stop_reason === "refusal") throw new Error("refusal");
  const text = res.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("no-text");
  return JSON.parse(text.text) as T;
}
