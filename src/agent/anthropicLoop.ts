/**
 * Anthropic Messages API tool loop for Atlas agent.
 * Runs in Node (agent server). Key stays server-side only.
 */
import {
  ANTHROPIC_TOOLS,
  buildSystemPrompt,
  emptyArtifacts,
  executeAgentTool,
  type AgentArtifacts,
  type AgentToolContext,
} from './tools';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 2048;
const MAX_TOOL_ROUNDS = 6;

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface AnthropicAgentRequest {
  message: string;
  history?: ChatTurn[];
  context?: AgentToolContext;
}

export interface AnthropicAgentResponse {
  text: string;
  links: AgentArtifacts['links'];
  activities: AgentArtifacts['activities'];
  weather?: AgentArtifacts['weather'];
  suggestions: string[];
  provider: 'anthropic';
  model: string;
}

type ContentBlock =
  | {type: 'text'; text: string}
  | {type: 'tool_use'; id: string; name: string; input: Record<string, unknown>}
  | {type: 'thinking'; thinking?: string}
  | {type: string; [key: string]: unknown};

function requireApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Add it as a Cursor Runtime Secret and start a new agent.',
    );
  }
  return key;
}

async function callAnthropic(body: Record<string, unknown>): Promise<{
  content: ContentBlock[];
  stop_reason: string | null;
}> {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': requireApiKey(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic HTTP ${res.status}: ${errText.slice(0, 400)}`);
  }
  return res.json();
}

function extractText(content: ContentBlock[]): string {
  return content
    .filter((b): b is {type: 'text'; text: string} => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim();
}

function extractToolUses(
  content: ContentBlock[],
): Array<{id: string; name: string; input: Record<string, unknown>}> {
  return content.filter(
    (b): b is {type: 'tool_use'; id: string; name: string; input: Record<string, unknown>} =>
      b.type === 'tool_use',
  );
}

export async function runAnthropicAgent(
  req: AnthropicAgentRequest,
): Promise<AnthropicAgentResponse> {
  const ctx: AgentToolContext = req.context || {};
  let artifacts = emptyArtifacts();

  const messages: Array<{role: 'user' | 'assistant'; content: unknown}> = [];
  for (const turn of req.history || []) {
    if (!turn.text.trim()) continue;
    messages.push({
      role: turn.role === 'assistant' ? 'assistant' : 'user',
      content: turn.text,
    });
  }
  messages.push({role: 'user', content: req.message});

  let finalText = '';

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const data = await callAnthropic({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: buildSystemPrompt(ctx),
      tools: ANTHROPIC_TOOLS,
      messages,
    });

    const toolUses = extractToolUses(data.content);
    if (!toolUses.length) {
      finalText = extractText(data.content);
      break;
    }

    messages.push({role: 'assistant', content: data.content});

    const toolResults = [];
    for (const tool of toolUses) {
      const {result, artifacts: next} = await executeAgentTool(
        tool.name,
        tool.input || {},
        ctx,
        artifacts,
      );
      artifacts = next;
      toolResults.push({
        type: 'tool_result',
        tool_use_id: tool.id,
        content: JSON.stringify(result),
      });
    }
    messages.push({role: 'user', content: toolResults});

    if (data.stop_reason === 'end_turn') {
      finalText = extractText(data.content);
      break;
    }
  }

  if (!finalText) {
    finalText =
      artifacts.weather || artifacts.links.length || artifacts.activities.length
        ? 'Here’s what I found — open a partner link when you want to book, or ask me to refine the plan.'
        : 'I hit a snag finishing that thought. Try asking again about weather, flights, hotels, or trending stops.';
  }

  if (!artifacts.suggestions.length) {
    const place = ctx.destinationName || 'your trip';
    artifacts = {
      ...artifacts,
      suggestions: [
        `Weather in ${place}`,
        `Flights to ${place}`,
        `Hotels in ${place}`,
        `What's trending in ${place}?`,
      ],
    };
  }

  return {
    text: finalText,
    links: artifacts.links,
    activities: artifacts.activities,
    weather: artifacts.weather,
    suggestions: artifacts.suggestions,
    provider: 'anthropic',
    model: MODEL,
  };
}
