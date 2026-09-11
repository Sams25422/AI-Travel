/**
 * AgentService — travel-agent brain with tools.
 * Prefers Claude Sonnet 5 via local agent proxy; falls back to intent router offline.
 */
import type {GeoPoint, ItineraryItem, Trip} from '../models';
import {DESTINATIONS, getDestination} from '../data/destinations';
import {
  getGlobalTrending,
  getTrendingForDestination,
  type TrendingActivity,
} from '../data/trending';
import {ATLAS_AGENT_URL} from '../config/agent';
import WeatherService, {type WeatherSnapshot} from './WeatherService';
import TravelLinksService, {type TravelLink} from './TravelLinksService';
import {generateUUID, nowISO, log, logError} from '../utils/helpers';

export type AgentRole = 'user' | 'agent' | 'system';

export interface AgentMessage {
  id: string;
  role: AgentRole;
  text: string;
  createdAt: string;
  links?: TravelLink[];
  activities?: TrendingActivity[];
  weather?: WeatherSnapshot;
  suggestions?: string[];
}

export interface AgentContext {
  destinationId?: string;
  destinationName?: string;
  tripId?: string;
  tripName?: string;
  nights?: number;
  originCity?: string;
}

type Intent =
  | 'weather'
  | 'flights'
  | 'hotels'
  | 'trending'
  | 'plan_help'
  | 'itinerary_tip'
  | 'greeting'
  | 'general';

function detectIntent(text: string): Intent {
  const q = text.toLowerCase();
  if (/\b(hi|hello|hey|good morning|good evening)\b/.test(q) && q.length < 40) {
    return 'greeting';
  }
  if (/\b(weather|forecast|rain|temperature|hot|cold|umbrella)\b/.test(q)) {
    return 'weather';
  }
  if (/\b(flight|flights|fly|airfare|airport)\b/.test(q)) return 'flights';
  if (/\b(hotel|hotels|stay|airbnb|accommodation|where to sleep)\b/.test(q)) {
    return 'hotels';
  }
  if (/\b(trend|trending|popular|viral|what.?s hot|things to do|activit)/.test(q)) {
    return 'trending';
  }
  if (/\b(itinerary|schedule|day plan|add stop|morning|evening)\b/.test(q)) {
    return 'itinerary_tip';
  }
  if (/\b(plan|trip|nights|weekend|visit)\b/.test(q)) return 'plan_help';
  return 'general';
}

function resolveDestination(ctx: AgentContext, text: string) {
  const fromCtx = ctx.destinationId ? getDestination(ctx.destinationId) : undefined;
  if (fromCtx) return fromCtx;
  const lower = text.toLowerCase();
  return (
    DESTINATIONS.find(
      d =>
        lower.includes(d.name.toLowerCase()) ||
        lower.includes(d.country.toLowerCase()) ||
        lower.includes(d.id),
    ) || DESTINATIONS[0]
  );
}

class AgentService {
  buildWelcome(ctx: AgentContext = {}): AgentMessage {
    const dest = ctx.destinationId ? getDestination(ctx.destinationId) : undefined;
    const place = dest?.name || ctx.destinationName || 'your next trip';
    return {
      id: generateUUID(),
      role: 'agent',
      createdAt: nowISO(),
      text: dest
        ? `I'm your Atlas agent for ${place}. Ask about weather, flights, stays, or what's trending — I'll keep advice practical and open partner search links when you want to book.`
        : `I'm your Atlas travel agent. Ask about weather, flights, hotels, or trending things to do. I help you plan; Atlas journals when you go.`,
      suggestions: [
        dest ? `Weather in ${dest.name}` : 'Weather in Paris',
        dest ? `Flights to ${dest.name}` : 'Flights to Tokyo',
        dest ? `Hotels in ${dest.name}` : 'Hotels in Marrakech',
        dest ? `What's trending in ${dest.name}?` : "What's trending now?",
      ],
    };
  }

  async reply(
    userText: string,
    ctx: AgentContext = {},
    itinerary: ItineraryItem[] = [],
    history: Array<{role: 'user' | 'agent'; text: string}> = [],
  ): Promise<AgentMessage> {
    const llm = await this.tryLlmReply(userText, ctx, itinerary, history);
    if (llm) return llm;
    return this.localReply(userText, ctx, itinerary);
  }

  private async tryLlmReply(
    userText: string,
    ctx: AgentContext,
    itinerary: ItineraryItem[],
    history: Array<{role: 'user' | 'agent'; text: string}>,
  ): Promise<AgentMessage | null> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(`${ATLAS_AGENT_URL}/agent/chat`, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        signal: controller.signal,
        body: JSON.stringify({
          message: userText,
          history: history
            .filter(h => h.role === 'user' || h.role === 'agent')
            .slice(-8)
            .map(h => ({
              role: h.role === 'agent' ? 'assistant' : 'user',
              text: h.text,
            })),
          context: {
            destinationId: ctx.destinationId,
            destinationName: ctx.destinationName,
            tripId: ctx.tripId,
            tripName: ctx.tripName,
            nights: ctx.nights,
            originCity: ctx.originCity,
          },
          itinerary,
        }),
      });
      clearTimeout(timer);
      if (res.status === 503) {
        log('AgentService: LLM proxy unavailable, using local router');
        return null;
      }
      if (!res.ok) {
        log('AgentService: LLM proxy error', res.status);
        return null;
      }
      const data = (await res.json()) as {
        text?: string;
        links?: TravelLink[];
        activities?: TrendingActivity[];
        weather?: WeatherSnapshot;
        suggestions?: string[];
      };
      if (!data.text?.trim()) return null;
      log('AgentService: LLM reply');
      return {
        id: generateUUID(),
        role: 'agent',
        createdAt: nowISO(),
        text: data.text,
        links: data.links,
        activities: data.activities,
        weather: data.weather,
        suggestions: data.suggestions,
      };
    } catch (error) {
      logError(error as Error, {context: 'AgentService.tryLlmReply'});
      return null;
    }
  }

  private async localReply(
    userText: string,
    ctx: AgentContext = {},
    itinerary: ItineraryItem[] = [],
  ): Promise<AgentMessage> {
    const intent = detectIntent(userText);
    const dest = resolveDestination(ctx, userText);
    log('AgentService: local intent', intent, dest.id);

    switch (intent) {
      case 'greeting':
        return {
          id: generateUUID(),
          role: 'agent',
          createdAt: nowISO(),
          text: `Hey — ready when you are. We can shape ${dest.name}, check the forecast, or pull trending stops.`,
          suggestions: [
            `Weather in ${dest.name}`,
            `What's trending in ${dest.name}?`,
            `Flights to ${dest.name}`,
          ],
        };

      case 'weather': {
        const weather = await WeatherService.getForecast(
          dest.center,
          dest.name,
          Math.max(3, ctx.nights ?? 5),
        );
        const today = weather.daily[0];
        const tip = today ? WeatherService.adviceForDay(today) : '';
        const lines = weather.daily
          .slice(0, 4)
          .map(
            d =>
              `· ${d.date.slice(5)} — ${d.label}, ${d.tempMinC}–${d.tempMaxC}°C` +
              (d.precipMm >= 1 ? ` · ${d.precipMm}mm rain` : ''),
          )
          .join('\n');
        return {
          id: generateUUID(),
          role: 'agent',
          createdAt: nowISO(),
          weather,
          text:
            `${dest.name} right now: ${weather.currentTempC}°C, ${weather.currentLabel}` +
            (weather.source === 'fallback' ? ' (offline sample).' : '.') +
            `\n\nNext days:\n${lines}\n\n${tip}`,
          suggestions: [
            `Hotels in ${dest.name}`,
            `What's trending in ${dest.name}?`,
            'Indoor ideas if it rains',
          ],
        };
      }

      case 'flights': {
        const links = TravelLinksService.flightSearch({
          origin: ctx.originCity || 'NYC',
          destination: dest.name,
        });
        return {
          id: generateUUID(),
          role: 'agent',
          createdAt: nowISO(),
          links,
          text: `Flight search deep-links for ${dest.name}. Atlas doesn't take a booking fee — these open trusted partners so you can compare and book there.`,
          suggestions: [
            `Hotels in ${dest.name}`,
            `Weather in ${dest.name}`,
            'Help me plan the first day',
          ],
        };
      }

      case 'hotels': {
        const links = TravelLinksService.hotelSearch({city: dest.name});
        return {
          id: generateUUID(),
          role: 'agent',
          createdAt: nowISO(),
          links,
          text: `Stay options for ${dest.name}. Neighborhood tip: lean into “${dest.tagline}”. Open a partner link for live rates — no OTA checkout inside Atlas.`,
          suggestions: [
            `What's trending in ${dest.name}?`,
            `Flights to ${dest.name}`,
            'Suggest a 3-night rhythm',
          ],
        };
      }

      case 'trending': {
        const local = getTrendingForDestination(dest.id);
        const activities = local.length ? local : getGlobalTrending(4);
        const links = TravelLinksService.activitySearch({
          city: dest.name,
          query: activities[0]?.title,
        });
        return {
          id: generateUUID(),
          role: 'agent',
          createdAt: nowISO(),
          activities,
          links,
          text: `Trending around ${dest.name} — heat scores are curated inspiration, not ads. Use a search link if you want tickets or tours.`,
          suggestions: [
            `Weather in ${dest.name}`,
            'Help me plan the first day',
            `Hotels in ${dest.name}`,
          ],
        };
      }

      case 'itinerary_tip': {
        const confirmed = itinerary.filter(i => i.isConfirmed).length;
        const weather = await WeatherService.getForecast(dest.center, dest.name, 3);
        const tip = weather.daily[0]
          ? WeatherService.adviceForDay(weather.daily[0])
          : '';
        const sample = dest.template[0];
        return {
          id: generateUUID(),
          role: 'agent',
          createdAt: nowISO(),
          weather,
          text:
            (itinerary.length
              ? `Your plan has ${itinerary.length} stops (${confirmed} confirmed). `
              : `No stops yet for this trip. `) +
            `A strong opener in ${dest.name} is “${sample?.title}” — ${sample?.notes || dest.tagline}. ` +
            tip +
            ' Confirm favorites, then start the trip so Atlas can journal them.',
          suggestions: [
            `What's trending in ${dest.name}?`,
            `Weather in ${dest.name}`,
            `Flights to ${dest.name}`,
          ],
        };
      }

      case 'plan_help': {
        return {
          id: generateUUID(),
          role: 'agent',
          createdAt: nowISO(),
          text:
            `${dest.name} shines as a ${dest.nights}-night trip — ${dest.tagline}. ` +
            `Fits styles: ${dest.styles.join(', ')}. ` +
            `I can pull weather, open flight/hotel search, or show what's trending.`,
          suggestions: [
            `Weather in ${dest.name}`,
            `Flights to ${dest.name}`,
            `Hotels in ${dest.name}`,
            `What's trending in ${dest.name}?`,
          ],
        };
      }

      default: {
        const trending = getTrendingForDestination(dest.id)[0];
        return {
          id: generateUUID(),
          role: 'agent',
          createdAt: nowISO(),
          text:
            `I can help like a travel agent for ${dest.name}: weather, flight/hotel links, trending activities, and itinerary tips. ` +
            (trending ? `People are talking about “${trending.title}”. ` : '') +
            `What should we sort first?`,
          suggestions: [
            `Weather in ${dest.name}`,
            `Flights to ${dest.name}`,
            `Hotels in ${dest.name}`,
            `What's trending in ${dest.name}?`,
          ],
        };
      }
    }
  }

  async weatherBrief(point: GeoPoint, name: string): Promise<string> {
    const snap = await WeatherService.getForecast(point, name, 2);
    const tip = snap.daily[0] ? WeatherService.adviceForDay(snap.daily[0]) : '';
    return `${snap.currentTempC}°C · ${snap.currentLabel}. ${tip}`;
  }

  tripContextFromTrip(trip: Trip): AgentContext {
    return {
      tripId: trip.id,
      tripName: trip.name,
      destinationId: trip.destinationId,
      destinationName: trip.destinationName,
      nights: trip.plannedNights,
    };
  }
}

export default new AgentService();
