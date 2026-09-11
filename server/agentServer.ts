/**
 * Atlas agent HTTP proxy — holds ANTHROPIC_API_KEY server-side.
 *
 *   npm run agent:server
 *   POST http://localhost:8787/agent/chat
 */
// Shared app modules expect React Native's __DEV__ global.
(globalThis as {__DEV__?: boolean}).__DEV__ = false;

import http from 'node:http';
import {runAnthropicAgent} from '../src/agent/anthropicLoop';

const PORT = Number(process.env.ATLAS_AGENT_PORT || 8787);

function sendJson(
  res: http.ServerResponse,
  status: number,
  body: unknown,
): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function readJson(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {});
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      sendJson(res, 200, {
        ok: true,
        hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
        model: 'claude-sonnet-5',
      });
      return;
    }

    if (req.method === 'POST' && req.url === '/agent/chat') {
      const body = (await readJson(req)) as {
        message?: string;
        history?: Array<{role: 'user' | 'assistant'; text: string}>;
        context?: {
          destinationId?: string;
          destinationName?: string;
          tripId?: string;
          tripName?: string;
          nights?: number;
          originCity?: string;
        };
        itinerary?: import('../src/models').ItineraryItem[];
      };
      if (!body.message?.trim()) {
        sendJson(res, 400, {error: 'message is required'});
        return;
      }
      if (!process.env.ANTHROPIC_API_KEY) {
        sendJson(res, 503, {
          error: 'ANTHROPIC_API_KEY missing',
          fallback: true,
        });
        return;
      }

      const result = await runAnthropicAgent({
        message: body.message.trim(),
        history: body.history,
        context: {
          ...(body.context || {}),
          itinerary: body.itinerary,
        },
      });
      sendJson(res, 200, result);
      return;
    }

    sendJson(res, 404, {error: 'Not found'});
  } catch (error) {
    console.error('agentServer error', error);
    sendJson(res, 500, {
      error: (error as Error).message || 'Agent server error',
    });
  }
});

server.listen(PORT, () => {
  console.log(
    `Atlas agent server on http://localhost:${PORT} (Anthropic key ${
      process.env.ANTHROPIC_API_KEY ? 'present' : 'MISSING'
    })`,
  );
});
